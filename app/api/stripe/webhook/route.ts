import type { Metadata } from "@/actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature found" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "No webhook secret found" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await handleCheckoutCompleted(event.id, session);
    } catch (error) {
      console.error("Error processing checkout.session.completed:", error);
      return NextResponse.json(
        { error: "Error processing checkout session" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  stripeEventId: string,
  session: Stripe.Checkout.Session
) {

  try {
    await prisma.processedWebhookEvent.create({
      data: {
        eventId: stripeEventId,
        eventType: "checkout.session.completed",
      },
    });
  } catch (error: unknown) {
    // P2002 = unique constraint violation → already processed.
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      console.log(
        `[stripe-webhook] Skipping duplicate event ${stripeEventId}`
      );
      return;
    }
    // Any other DB error — re-throw so the outer handler returns 500 and
    // Stripe will retry.
    throw error;
  }

  // Exactly one concurrent handler reaches here.
  await createOrderInSanity(session);

  const metadata = session.metadata as Metadata;
  if (metadata?.clerkUserId) {
    await clearCartInDatabase(metadata.clerkUserId);
  }
}

async function createOrderInSanity(session: Stripe.Checkout.Session) {
  const {
    id,
    amount_total,
    currency,
    metadata,
    payment_intent,
    customer,
    total_details,
  } = session;

  const { orderNumber, customerName, customerEmail, clerkUserId } =
    metadata as Metadata;

  // Wrap the Stripe API call in try/catch with explicit error context.
  // listLineItems can be throttled by Stripe — surface that clearly rather
  // than letting it bubble up as a generic 500.
  let lineItemsWithProduct: Stripe.ApiList<Stripe.LineItem>;
  try {
    lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(id, {
      expand: ["data.price.product"],
      limit: 100, // Stripe default is 10; most carts won't hit 100.
    });
  } catch (error) {
    console.error(
      `[stripe-webhook] Failed to fetch line items for session ${id}:`,
      error
    );
    throw error; // Re-throw — the outer handler will return 500 → Stripe retries.
  }

  const sanityProducts = lineItemsWithProduct.data.map((item) => ({
    _key: crypto.randomUUID(),
    product: {
      _type: "reference",
      _ref: (item.price?.product as Stripe.Product)?.metadata?.id,
    },
    quantity: item.quantity || 0,
  }));

  // createIfNotExists is Sanity's own idempotency primitive — safe on retries.
  await backendClient.createIfNotExists({
    _id: `order-${id}`,
    _type: "order",
    orderNumber,
    stripeCheckoutSessionId: id,
    stripePaymentIntentId: payment_intent,
    customerName,
    stripeCustomerId: customer,
    clerkUserId,
    email: customerEmail,
    currency,
    amountDiscount: total_details?.amount_discount
      ? total_details.amount_discount / 100
      : 0,
    products: sanityProducts,
    totalPrice: amount_total ? amount_total / 100 : 0,
    status: "paid",
    orderDate: new Date().toISOString(),
  });
}

async function clearCartInDatabase(clerkUserId: string) {
  try {
    // look up by clerkId, not by id.
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });
    if (!user) return;

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!cart) return;

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  } catch (error) {
    // Non-fatal — payment succeeded. Cart clears on next sign-in via mergeWithServer.
    console.error("Failed to clear database cart after payment:", error);
  }
}