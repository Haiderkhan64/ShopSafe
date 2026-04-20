"use client";

import {
  createCheckoutSession,
  type CheckoutInput,
} from "@/actions/createCheckoutSession";
import AddToBasketButton from "@/components/AddToBasketButton";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getEffectivePrice } from "@/lib/getEffectivePrice";
import { imageUrl } from "@/lib/imageUrl";
import { formatCurrency } from "@/lib/formatCurrency";
import useBasketStore from "@/store";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import { Home, Info, ShoppingCart, Package, Truck, Shield, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

const BasketPage: FC = () => {
  const { getGroupedItems } = useBasketStore();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const groupedItems = getGroupedItems();

  const [isClient, setIsClient] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const totalPrice = groupedItems.reduce((sum, item) => {
    const { discountedPrice } = getEffectivePrice(item.product);
    return sum + discountedPrice * item.quantity;
  }, 0);

  const totalTaxes = totalPrice * 0.2;

  useEffect(() => setIsClient(true), []);

  const isSyncing = useBasketStore((state) => state.isSyncing);
  const hasHydrated = useBasketStore((state) => state._hasHydrated);
  const persistedCount = useBasketStore((state) => state._persistedItems.length);
  const itemsCount = useBasketStore((state) => state.items.length);

  const isWaitingForHydration =
  !isClient ||
  !hasHydrated || (persistedCount > 0 && itemsCount === 0 && isSyncing);
 
  if (isWaitingForHydration) {
    return <Loader />;
  }

  if (getGroupedItems().length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/20 flex items-center justify-center px-4 py-16 transition-colors duration-300">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative mb-8 inline-block">
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-full shadow-2xl transition-colors duration-300">
              <ShoppingCart
                size={80}
                strokeWidth={1.5}
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Your Cart is Empty
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Looks like you haven&apos;t added anything to your cart yet. Discover our
            amazing products and start shopping!
          </p>

          <Link
            href="/"
            className="group inline-flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
            }}
          >
            <Home className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Start Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSignedIn || !user) return;

    setIsLoading(true);
    setCheckoutError(null);

    try {
      // orderNumber is now generated inside the Server Action — not here.
      // We pass only what the user legitimately controls.
      const input: CheckoutInput = {
        customerName: user.fullName || "Unknown",
        customerEmail: user.emailAddresses[0]?.emailAddress || "",
      };

      const checkoutUrl = await createCheckoutSession(groupedItems, input);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout failed:", error);
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/10 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/20 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg shadow-lg bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Shopping Cart
            </h1>
          </div>

          <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl transition-colors duration-300">
            <Truck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              Free shipping on orders over $800.00 &middot; You&apos;re{" "}
              {formatCurrency(Math.max(0, 800 - totalPrice))} away!
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-grow space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
              {getGroupedItems()?.map((item, index) => {
                const { discountedPrice, originalPrice, hasDiscount } =
                  getEffectivePrice(item.product);
                const lineTotal = discountedPrice * item.quantity;

                return (
                  <div
                    key={item.product._id + item.product._createdAt}
                    className={`p-6 flex items-center gap-6 transition-all duration-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 ${
                      index !== 0
                        ? "border-t border-gray-200 dark:border-gray-800"
                        : ""
                    }`}
                  >
                    <div
                      className="relative group cursor-pointer flex-shrink-0"
                      onClick={() =>
                        router.push(`/product/${item.product.slug?.current}`)
                      }
                    >
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300 bg-gray-100 dark:bg-gray-800">
                        {item.product.image && (
                          <Image
                            src={imageUrl(item.product.image).url()}
                            alt={item.product.name || "Product Image"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            width={112}
                            height={112}
                          />
                        )}
                      </div>
                    </div>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() =>
                        router.push(`/product/${item.product.slug?.current}`)
                      }
                    >
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 truncate hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        {item.product.name}
                      </h2>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500">
                          {formatCurrency(lineTotal)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({formatCurrency(discountedPrice)} each)
                          </span>
                        )}
                        {hasDiscount && (
                          <span className="text-sm line-through text-gray-400 dark:text-gray-500">
                            {formatCurrency(originalPrice * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <AddToBasketButton product={item.product} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800 lg:sticky lg:top-8 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Order Summary
                </h3>
              </div>

              <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Subtotal</span>
                    <Info className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <span className="font-semibold text-lg">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Shipping</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">FREE</span>
                    <span className="line-through text-gray-400 dark:text-gray-500 text-sm">$15.00</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <div>
                    <span className="font-medium">Taxes</span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">(included)</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(totalTaxes)}</span>
                </div>
              </div>

              <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

              <div className="flex justify-between items-center mb-6 p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 transition-colors duration-300">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              {checkoutError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    {checkoutError}
                  </p>
                </div>
              )}

              {isSignedIn ? (
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-bold text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
                    border: "none",
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span>Secure Checkout</span>
                    </div>
                  )}
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button
                    className="w-full h-14 text-lg font-bold text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
                      border: "none",
                    }}
                  >
                    Sign In to Checkout
                  </Button>
                </SignInButton>
              )}

              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                  <span>SSL Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketPage;