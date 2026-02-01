"use client";
import type { Product } from "@/sanity.types";
import useBasketStore from "@/store";
import {
  Heart,
  ShoppingBag,
  Loader2,
  Ruler,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { ReactElement, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface AddToButtonProps {
  product: Product;
}

const AddToButton = ({ product }: AddToButtonProps): ReactElement => {
  const { addItem } = useBasketStore();
  const { isSignedIn } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = async () => {
    if (!product._id || isAdding) return;
    setIsAdding(true);

    // 1. Update localStorage immediately (optimistic update)
    addItem(product);

    // 2. Sync to database if user is logged in
    if (isSignedIn) {
      try {
        const response = await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product._id,
            action: "add",
            quantity: 1,
          }),
        });

        if (!response.ok) {
          console.error("Failed to sync to server");
          // Don't rollback - localStorage is source of truth
        }
      } catch (error) {
        console.error("Sync error:", error);
        // Don't rollback - user can continue shopping
      }
    }

    // Show success animation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    setIsAdding(false);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Add your favorite logic here
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main Action Buttons */}
      <div className="flex flex-col gap-4">
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="group relative w-full overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 bg-[length:200%_100%] animate-gradient" />

          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300" />

          {/* Button Content */}
          <div className="relative flex items-center justify-center gap-3 py-4 px-8">
            {isAdding ? (
              <>
                <Loader2 className="h-5 w-5 text-white animate-spin" />
                <span className="text-white font-bold text-lg">
                  Adding to Cart...
                </span>
              </>
            ) : showSuccess ? (
              <>
                <CheckCircle className="h-5 w-5 text-white animate-bounce" />
                <span className="text-white font-bold text-lg">Added!</span>
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
                <span className="text-white font-bold text-lg">
                  Add to Cart
                </span>
              </>
            )}
          </div>

          {/* Shine Effect on Hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </button>
        {/* Add to Favorites Button */}
        <button
          onClick={handleToggleFavorite}
          className={`group relative w-full py-4 px-8 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
            isFavorite
              ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10"
          }`}
        >
          {/* Glow on Hover */}
          <div
            className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 ${
              isFavorite ? "bg-red-500" : "bg-purple-500"
            }`}
          />

          {/* Button Content */}
          <div className="relative flex items-center justify-center gap-3">
            <Heart
              className={`h-5 w-5 transition-all duration-300 ${
                isFavorite
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:scale-110"
              }`}
            />
            <span
              className={`font-bold text-lg transition-colors duration-300 ${
                isFavorite
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400"
              }`}
            >
              {isFavorite ? "Added to Favorites" : "Add to Favorites"}
            </span>
          </div>
        </button>
      </div>

      {/* Additional Info */}
      <div className="flex flex-col gap-4 pt-2">
        {/* Size Guide Link */}
        <button className="group flex items-center gap-2 text-sm transition-colors duration-200">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors duration-200">
            <Ruler className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200" />
          </div>
          <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 underline underline-offset-4 decoration-2 decoration-transparent group-hover:decoration-purple-400 transition-all duration-200">
            View Size Guide
          </span>
        </button>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-green-900 dark:text-green-100">
                In Stock
              </span>
              <span className="text-xs text-green-700 dark:text-green-300">
                Ready to ship
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-100">
                Premium
              </span>
              <span className="text-xs text-blue-700 dark:text-blue-300">
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border-2 border-purple-200 dark:border-purple-700">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-purple-700 dark:text-purple-300" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-1">
                Free Shipping
              </h4>
              <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                On orders over $50. Estimated delivery in 2-5 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToButton;
