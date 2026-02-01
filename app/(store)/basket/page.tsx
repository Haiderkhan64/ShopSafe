"use client";
import {
  createCheckoutSession,
  type Metadata,
} from "@/actions/createCheckoutSession";
import AddToBasketButton from "@/components/AddToBasketButton";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { imageUrl } from "@/lib/imageUrl";
import useBasketStore from "@/store";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import { Home, Info, ShoppingCart, Package, Truck, Shield } from "lucide-react";
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

  const totalPrice = useBasketStore.getState().getTotalPrice().toFixed(2);
  const totalTaxes = (+totalPrice * 0.2).toFixed(2);

  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return <Loader />;
  }

  if (getGroupedItems().length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/20 flex items-center justify-center px-4 py-16 transition-colors duration-300">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative mb-8 inline-block">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-20 dark:opacity-30 animate-pulse"
              style={{
                background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
              }}
            />
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
            Looks like you haven't added anything to your cart yet. Discover our
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

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <Truck className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Free Shipping
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                On orders over $800
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <Shield className="w-8 h-8 mx-auto mb-2 text-yellow-500 dark:text-yellow-400" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Secure Payment
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                100% protected
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <Package className="w-8 h-8 text-green-600 dark:text-green-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Easy Returns
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                30-day guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSignedIn) return;
    setIsLoading(true);

    try {
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(),
        customerName: user?.fullName || "Unknown",
        customerEmail: user?.emailAddresses[0].emailAddress || "Unknown",
        clerkUserId: user!.id,
      };

      const checkoutUrl = await createCheckoutSession(groupedItems, metadata);

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.log("Error checking out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/10 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/20 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg shadow-lg bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Shopping Cart
            </h1>
          </div>

          {/* Free Shipping Banner */}
          <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl transition-colors duration-300">
            <Truck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              Free shipping on orders over $800.00 · You're $
              {(800 - +totalPrice).toFixed(2)} away!
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-grow space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
              {getGroupedItems()?.map((item, index) => (
                <div
                  key={item.product._id + item.product._createdAt}
                  className={`p-6 flex items-center gap-6 transition-all duration-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 ${
                    index !== 0
                      ? "border-t border-gray-200 dark:border-gray-800"
                      : ""
                  }`}
                >
                  {/* Product Image */}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  </div>

                  {/* Product Details */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() =>
                      router.push(`/product/${item.product.slug?.current}`)
                    }
                  >
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 truncate hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      {item.product.name}
                    </h2>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500">
                        $
                        {((item.product.price ?? 0) * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          (${(item.product.price ?? 0).toFixed(2)} each)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/50">
                        Variant: US
                      </span>
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-200 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex-shrink-0">
                    <AddToBasketButton product={item.product} />
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Secure Checkout
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    SSL Encrypted
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Fast Delivery
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    2-5 Business Days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
                  <Package className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Easy Returns
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    30-Day Policy
                  </p>
                </div>
              </div>
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

              {/* Price Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Subtotal</span>
                    <Info className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                  <span className="font-semibold text-lg">${totalPrice}</span>
                </div>

                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Shipping</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      FREE
                    </span>
                    <span className="line-through text-gray-400 dark:text-gray-500 text-sm">
                      $15.00
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <div>
                    <span className="font-medium">Taxes</span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                      (included)
                    </span>
                  </div>
                  <span className="font-semibold">${totalTaxes}</span>
                </div>
              </div>

              <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

              {/* Total */}
              <div className="flex justify-between items-center mb-6 p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 transition-colors duration-300">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500">
                  ${totalPrice}
                </span>
              </div>

              {/* Checkout Button */}
              {isSignedIn ? (
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-bold text-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
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
                      background:
                        "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
                      border: "none",
                    }}
                  >
                    Sign In to Checkout
                  </Button>
                </SignInButton>
              )}

              {/* Security Badges */}
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
