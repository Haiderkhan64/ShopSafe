"use client";
import type { Product } from "@/sanity.types";
import useBasketStore from "@/store";
import { FC, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";

interface AddToBasketButtonProps {
  product: Product;
}

const AddToBasketButton: FC<AddToBasketButtonProps> = ({ product }) => {
  const { addItem, removeItem, getItemCount } = useBasketStore();
  const { isSignedIn } = useAuth();
  const itemCount = getItemCount(product._id);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => setIsClient(true), []);

  const syncToServer = async (action: 'add' | 'remove') => {
    if (!isSignedIn) return; // Only sync if logged in
    
    try {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          action,
          quantity: 1
        }),
      });
      
      if (!response.ok) {
        console.error(`Failed to sync ${action} to server`);
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const handleAdd = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    // Update localStorage immediately
    addItem(product);
    
    // Sync to database in background
    await syncToServer('add');
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    if (isUpdating || itemCount === 0) return;
    setIsUpdating(true);
    
    // Update localStorage immediately
    removeItem(product._id);
    
    // Sync to database in background
    await syncToServer('remove');
    setIsUpdating(false);
  };

  if (!isClient) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Quantity selector with enhanced styling */}
      <div className="flex items-center gap-4">
        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={isUpdating || itemCount === 0}
          className="group relative w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700 disabled:hover:bg-white dark:disabled:hover:bg-gray-800 shadow-md hover:shadow-lg"
        >
          {isUpdating ? (
            <Loader2 className="w-5 h-5 text-gray-400 dark:text-gray-500 animate-spin" />
          ) : (
            <Minus className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" />
          )}
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-xl bg-purple-400 dark:bg-purple-500 opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300" />
        </button>

        {/* Count Display */}
        <div className="relative">
          <div className="w-20 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-2 border-purple-200 dark:border-purple-700 shadow-md">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">
              {itemCount}
            </span>
          </div>
          
          {/* Badge for items in cart */}
          {itemCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse border-2 border-white dark:border-gray-900">
              <ShoppingCart className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          disabled={isUpdating}
          className="group relative w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 dark:from-purple-500 dark:to-purple-600 dark:hover:from-purple-600 dark:hover:to-purple-700 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105"
        >
          {isUpdating ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Plus className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
          )}
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-300" />
        </button>
      </div>

      {/* Optional: Add to cart text indicator */}
      {itemCount > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-gray-600 dark:text-gray-400 font-medium">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
          </span>
        </div>
      )}
    </div>
  );
};

export default AddToBasketButton;