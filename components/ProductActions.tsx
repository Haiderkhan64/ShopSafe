"use client";

import type { Product } from "@/sanity.types";
import useBasketStore from "@/store";
import AddToButtons from "./AddToButtons";
import AddToBasketButton from "./AddToBasketButton";

export default function ProductActions({
  product,
  disabled,
}: {
  product: Product;
  disabled?: boolean;
}) {
  const itemCount = useBasketStore((s) => s.getItemCount(product._id ?? ""));

  return (
    <div className="space-y-3 pt-8 border-t border-gray-200 dark:border-gray-700">
      {itemCount === 0 ? (
        // Zero-state: prominent full-width CTA with trust badges
        <AddToButtons product={product} disabled={disabled} />
      ) : (
        // In-cart state: compact stepper only — no duplicate "Add to Cart"
        <div className="flex flex-col gap-3">
          <AddToBasketButton product={product} disabled={disabled} />
          {/* Retain trust badges for visual continuity */}
        </div>
      )}
    </div>
  );
}