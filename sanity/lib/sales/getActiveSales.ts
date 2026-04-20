import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export interface ActiveSale {
  _id: string;
  title: string | null;
  discountAmount: number | null;
  couponCode: string | null;
  validFrom: string | null;
  validUntil: string | null;
}

/**
 * Returns all currently active sales, ordered by discount amount descending
 * so the best deal wins when multiple sales apply.
 */
export async function getActiveSales(): Promise<ActiveSale[]> {
  const now = new Date().toISOString();

  const ACTIVE_SALES_QUERY = defineQuery(`
    *[
      _type == "sale" &&
      isActive == true &&
      (validFrom == null || validFrom <= $now) &&
      (validUntil == null || validUntil >= $now)
    ] | order(discountAmount desc) {
      _id,
      title,
      discountAmount,
      couponCode,
      validFrom,
      validUntil
    }
  `);

  try {
    const result = await sanityFetch({
      query: ACTIVE_SALES_QUERY,
      params: { now },
    });
    return (result.data as ActiveSale[]) || [];
  } catch (error) {
    console.error("Error fetching active sales:", error);
    return [];
  }
}

/**
 * Returns the best discount percentage (0–100) applicable to a product.
 * Currently applies the same sale to all products (sitewide discount).
 * Extend this to filter by product category/tag when needed.
 */
export function getBestDiscount(sales: ActiveSale[]): number {
  if (sales.length === 0) return 0;
  return sales[0].discountAmount ?? 0;
}