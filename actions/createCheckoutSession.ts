"use server";

import { getEffectivePrice } from "@/lib/getEffectivePrice";
import { imageUrl } from "@/lib/imageUrl";
import stripe from "@/lib/stripe";
import type { BasketItem } from "@/store";
import { auth } from "@clerk/nextjs/server";
import { getActiveSales, getBestDiscount } from "@/sanity/lib/sales/getActiveSales";

export type Metadata = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId: string;
};

export type GroupedBasketItem = {
  product: BasketItem["product"];
  quantity: number;
};

export type CheckoutInput = {
  customerName: string;
  customerEmail: string;
};

export async function createCheckoutSession(
  items: BasketItem[],
  input: CheckoutInput
): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("You must be signed in to checkout.");

  if (!items || items.length === 0) throw new Error("Your cart is empty.");

  const itemsWithoutPrice = items.filter((item) => !item.product.price);
  if (itemsWithoutPrice.length > 0) {
    throw new Error(
      `${itemsWithoutPrice.length} item(s) are missing a price and cannot be checked out.`
    );
  }

  // Fetch the active sale discount once, here, at the moment the user
  // clicks "Checkout".  This is the single source of truth for the price
  // Stripe will charge.  The product page may be up to REVALIDATE_PRODUCT_PAGE_SECONDS
  // stale — if a sale has ended in that window the user would previously see
  // a discounted price but be charged the full amount (or vice-versa).
  //
  // The correct contract is:
  //   "The price you pay is the price calculated at the moment you click Checkout."
  //
  // We pass this snapshot price directly to Stripe's unit_amount so there is
  // no second place where the discount is looked up.
  const sales = await getActiveSales();
  const saleDiscount = getBestDiscount(sales);

  const orderNumber = crypto.randomUUID();

  const metadata: Metadata = {
    orderNumber,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    clerkUserId: userId,
  };

  const existingCustomers = await stripe.customers.list({
    email: input.customerEmail,
    limit: 1,
  });

  const customerId =
    existingCustomers.data.length > 0
      ? existingCustomers.data[0].id
      : undefined;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_creation: customerId ? undefined : "always",
    customer_email: !customerId ? input.customerEmail : undefined,
    metadata,
    mode: "payment",
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${orderNumber}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/basket`,
    line_items: items.map((item) => {
      // getEffectivePrice gives us the single discounted price the customer
      // should pay.  Product-level discount wins over sitewide sale — same
      // logic as the product page display.
      const { discountedPrice } = getEffectivePrice(item.product, saleDiscount);
      const unitAmountCents = Math.round(discountedPrice * 100);

      return {
        price_data: {
          currency: "usd",
          unit_amount: unitAmountCents,
          product_data: {
            name: item.product.name || "Unnamed product",
            description: `Product ID: ${item.product._id}`,
            metadata: { id: item.product._id },
            images: item.product.image
              ? [imageUrl(item.product.image).url()]
              : undefined,
          },
        },
        quantity: item.quantity,
      };
    }),
  });

  if (!session.url) throw new Error("Stripe returned a session without a URL.");

  return session.url;
}