"use client";

import type { Product } from "@/sanity.types";
import useBasketStore, { isCartSyncAborted } from "@/store";
import { FC, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";

interface AddToBasketButtonProps {
  product: Product;
  disabled?: boolean;
}

const AddToBasketButton: FC<AddToBasketButtonProps> = ({ product, disabled }) => {
  const { isSignedIn } = useAuth();
  const addItem    = useBasketStore((s) => s.addItem);
  const removeItem = useBasketStore((s) => s.removeItem);
  const itemCount  = useBasketStore((s) => s.getItemCount(product._id ?? ""));

  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const syncToServer = async (action: "add" | "remove") => {
    if (!isSignedIn || isCartSyncAborted()) return;
    try {
      const res = await fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, action, quantity: 1 }),
      });
      if (!res.ok) console.error(`[AddToBasketButton] sync ${action} failed:`, res.status);
    } catch (err) {
      console.error("[AddToBasketButton] sync error:", err);
    }
  };

  const handleAdd = async () => {
    if (!product._id || disabled) return;
    addItem(product);
    await syncToServer("add");
  };

  const handleRemove = async () => {
    if (!product._id) return;
    removeItem(product._id);
    await syncToServer("remove");
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center w-11 h-11" aria-hidden="true">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <button
        onClick={handleAdd}
        disabled={disabled}
        aria-label={`Add ${product.name} to cart`}
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg
          bg-purple-600 text-white font-semibold
          hover:bg-purple-700 active:bg-purple-800
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-purple-500 focus-visible:ring-offset-2"
      >
        <ShoppingCart className="w-4 h-4" aria-hidden="true" />
        Add to Cart
      </button>
    );
  }

  return (
    // FIX: aria-label on the group; role="group" for screen readers
    <div
      className="flex items-center gap-3"
      role="group"
      aria-label={`${product.name} quantity`}
    >
      {/* FIX: 44px minimum touch target (w-11 h-11), dark mode hover */}
      <button
        onClick={handleRemove}
        aria-label="Remove one"
        className="flex items-center justify-center w-11 h-11 rounded-full
          border-2 border-purple-600 text-purple-600
          hover:bg-purple-50 dark:hover:bg-purple-900/40
          transition-colors focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-purple-500 focus-visible:ring-offset-2"
      >
        <Minus className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* FIX: min-w instead of fixed w to handle ≥100, dark mode text */}
      <span
        className="min-w-[2rem] text-center font-bold text-gray-900 dark:text-gray-100 tabular-nums"
        aria-live="polite"
        aria-atomic="true"
      >
        {itemCount}
      </span>

      <button
        onClick={handleAdd}
        disabled={disabled}
        aria-label="Add one more"
        className="flex items-center justify-center w-11 h-11 rounded-full
          bg-purple-600 text-white
          hover:bg-purple-700 active:bg-purple-800
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-purple-500 focus-visible:ring-offset-2"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default AddToBasketButton;