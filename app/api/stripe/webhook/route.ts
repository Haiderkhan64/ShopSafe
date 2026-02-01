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
    return NextResponse.json(
      { error: "No webhook secret found" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.log("Error constructing event:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      {
        status: 400,
      },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      // Create order in Sanity
      const existingOrder = await backendClient.fetch(
        `*[_type == "order" && stripeCheckoutSessionId == $id][0]`,
        { id: session.id }
);

  if (existingOrder) {
    return NextResponse.json({ received: true });
  }

      await createOrderInSanity(session);
      
      // Clear the cart in database after successful payment
      const metadata = session.metadata as Metadata;
      if (metadata?.clerkUserId) {
        await clearCartInDatabase(metadata.clerkUserId);
      }

    } catch (error) {
      console.log("Error processing checkout session:", error);
      return NextResponse.json(
        { error: "Error processing checkout session" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
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

  const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(
    id,
    {
      expand: ["data.price.product"],
    },
  );

  const sanityProducts = lineItemsWithProduct.data.map((item) => ({
    _key: crypto.randomUUID(),
    product: {
      _type: "reference",
      _ref: (item.price?.product as Stripe.Product)?.metadata?.id,
    },
    quantity: item.quantity || 0,
  }));

  const order = await backendClient.create({
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

  return order;
}

async function clearCartInDatabase(clerkUserId: string) {
  try {
    console.log('🧹 Clearing database cart for user:', clerkUserId);

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: clerkUserId }
    });

    if (!cart) {
      console.log('No cart found to clear');
      return;
    }

    // Delete all items in the cart
    const deleted = await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    console.log(`✅ Database cart cleared - deleted ${deleted.count} items`);
  } catch (error) {
    console.error("Error clearing database cart:", error);
    // Don't throw - payment already succeeded
  }
}