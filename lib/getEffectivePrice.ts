import type { Product } from "@/sanity.types";

export interface PriceInfo {
  /** The final price the customer pays */
  discountedPrice: number;
  /** The original price before discount */
  originalPrice: number;
  /** 0-100 percentage actually applied */
  effectiveDiscount: number;
  /** true when a discount > 0 applies and item is in stock */
  hasDiscount: boolean;
  /** Absolute saving amount (0 when no discount) */
  discountAmount: number;
}

/**
 * Computes all price-related values for a product.
 *
 * @param product        - Sanity product (must have a price)
 * @param saleDiscount   - Sitewide sale discount % from getActiveSales (0–100)
 */
export function getEffectivePrice(
  product: Product,
  saleDiscount: number = 0
): PriceInfo {
  const isOutOfStock =
    product.stock != null && product.stock <= 0;

  // Product-level discount wins over sitewide sale
  const productDiscount = product.discount ?? 0;
  const effectiveDiscount =
    productDiscount > 0 ? productDiscount : saleDiscount;

  const hasDiscount = effectiveDiscount > 0 && !isOutOfStock;
  const originalPrice = product.price ?? 0;
  const discountRate = effectiveDiscount / 100;

  const discountedPrice = hasDiscount
    ? Math.round(originalPrice * (1 - discountRate) * 100) / 100
    : originalPrice;

  const discountAmount = hasDiscount
    ? Math.round((originalPrice - discountedPrice) * 100) / 100
    : 0;

  return {
    discountedPrice,
    originalPrice,
    effectiveDiscount,
    hasDiscount,
    discountAmount,
  };
}