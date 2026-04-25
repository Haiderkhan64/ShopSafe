"use client";

import type { Product } from "@/sanity.types";
import useBasketStore, { isCartSyncAborted } from "@/store";
import { ShoppingBag } from "lucide-react";
import { ReactElement, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface AddToButtonsProps {
  product: Product;
  disabled?: boolean;
}

export default function AddToButtons({ product, disabled }: AddToButtonsProps): ReactElement {
  const { isSignedIn } = useAuth();
  const addItem   = useBasketStore((s) => s.addItem);
  const itemCount = useBasketStore((s) => s.getItemCount(product._id ?? ""));

  const [status, setStatus] = useState<"idle" | "adding" | "success">("idle");

  const handleAddToCart = async () => {
    if (!product._id || disabled || status !== "idle") return;

    setStatus("adding");
    addItem(product);

    if (isSignedIn && !isCartSyncAborted()) {
      try {
        const res = await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id, action: "add", quantity: 1 }),
        });
        if (!res.ok) console.error("[AddToButtons] sync failed:", res.status);
      } catch (err) {
        console.error("[AddToButtons] sync error:", err);
      }
    }

    setStatus("success");
    setTimeout(() => setStatus("idle"), 2000);
  };

  const isAdding  = status === "adding";
  const isSuccess = status === "success";

  return (
    <div className="space-y-3">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isAdding  && "Adding to cart…"}
        {isSuccess && "Added to cart!"}
      </div>

      <button
        onClick={handleAddToCart}
        disabled={disabled || isAdding}
        aria-busy={isAdding}
        aria-label={
          disabled   ? "Out of stock"
          : isAdding  ? "Adding to cart"
          : isSuccess ? "Added to cart"
          : itemCount > 0
            ? `Add another — ${itemCount} already in cart`
            : `Add ${product.name} to cart`
        }
        className="w-full py-3 px-6 rounded-xl font-bold text-white
          flex items-center justify-center gap-2
          transition-all duration-200
          hover:opacity-90 active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-purple-500 focus-visible:ring-offset-2"
        style={{
          background: disabled
            ? "#9CA3AF"
            : isSuccess
              ? "linear-gradient(135deg, #059669 0%, #10b981 100%)"
              : "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
        }}
      >
        {isAdding ? (
          // Inline spinner using only Tailwind — no extra import needed
          <span
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        ) : isSuccess ? (
          // Checkmark as SVG path — stays same size as ShoppingBag
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        ) : (
          <ShoppingBag className="w-5 h-5" aria-hidden="true" />
        )}

        <span>
          {disabled
            ? "Out of Stock"
            : isAdding
              ? "Adding…"
              : isSuccess
                ? "Added to Cart!"
                : itemCount > 0
                  ? `Add More (${itemCount} in cart)`
                  : "Add to Cart"}
        </span>
      </button>
    </div>
  );
}