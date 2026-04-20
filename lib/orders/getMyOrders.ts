import type { Order } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "next-sanity";

const MY_ORDERS_QUERY = defineQuery(`
  *[_type == "order" && clerkUserId == $userId] | order(orderDate desc) {
    ...,
    products[]{
      ...,
      product->
    }
  }
`);

/**
 * Fetches all orders for the given user from Sanity.
 * Returns immediately — no polling, no blocking.
 *
 * If you need to wait for a specific order to appear after payment, do it
 * client-side in the success page via /api/orders/check polling (already
 * implemented in app/(store)/success/page.tsx).
 */
export async function getMyOrders(userId: string): Promise<Order[]> {
  if (!userId) {
    throw new Error("User not logged in");
  }

  try {
    const orders = await sanityFetch({
      query: MY_ORDERS_QUERY,
      params: { userId },
    });
    return (orders.data as Order[]) || [];
  } catch (error) {
    console.error("Error fetching orders", error);
    throw new Error("Error fetching orders");
  }
}