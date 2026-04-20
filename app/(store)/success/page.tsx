"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import useBasketStore from "@/store";
import {
  Check,
  CreditCard,
  Download,
  Share2,
  ShoppingBag,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

function SimpleLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20">
      <div className="text-center">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-transparent animate-spin"
          style={{ borderTopColor: "#574095", borderRightColor: "#6B46C1" }}
        />
        <p className="text-lg font-semibold" style={{ color: "#574095" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}

function ConfirmingLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20">
      <div className="text-center max-w-sm px-4">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-transparent animate-spin"
          style={{ borderTopColor: "#574095", borderRightColor: "#6B46C1" }}
        />
        <p className="text-lg font-semibold mb-2" style={{ color: "#574095" }}>
          Confirming your order…
        </p>
        <p className="text-sm text-gray-500">
          This usually takes just a moment. Please don&apos;t close this tab.
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const clearBasket = useBasketStore((state) => state.clearBasket);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmFailed, setConfirmFailed] = useState(false);

  // Track whether we have already cleared the basket.  We clear it
  // immediately — before any polling — so that useCartSync's mergeWithServer
  // (which fires on page load from CartSyncWrapper in the layout) sees an
  // empty local cart and does not re-push the paid items back to the server.
  const hasCleared = useRef(false);

  useEffect(() => {
    const now = new Date();
    setDate(
      now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
    setTime(
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  }, []);

  // Auth guard
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Order number guard
  useEffect(() => {
    if (isLoaded && isSignedIn && !orderNumber) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, orderNumber, router]);


  useEffect(() => {
    if (!hasCleared.current) {
      hasCleared.current = true;
      clearBasket();
    }
  }, [clearBasket]);

  const waitForOrderInSanity = useCallback(async () => {
    if (!orderNumber) return;

    const delays = [1000, 2000, 4000, 8000, 8000, 8000];

    for (const delay of delays) {
      await new Promise((r) => setTimeout(r, delay));

      try {
        const res = await fetch(
          `/api/orders/check?orderNumber=${encodeURIComponent(orderNumber)}`
        );
        if (res.ok) {
          const { exists } = await res.json();
          if (exists) {
            setOrderConfirmed(true);
            return;
          }
        }
      } catch {
        // Network error — continue polling
      }
    }

    // Exhausted retries — show the page anyway (payment already succeeded).
    setOrderConfirmed(true);
    setConfirmFailed(true);
  }, [orderNumber]);

  useEffect(() => {
    if (isLoaded && isSignedIn && orderNumber) {
      waitForOrderInSanity();
    }
  }, [isLoaded, isSignedIn, orderNumber, waitForOrderInSanity]);

  if (!isLoaded || !isSignedIn) return <SimpleLoader />;
  if (!orderConfirmed) return <ConfirmingLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 flex items-start justify-center p-4">
      <Card className="w-full max-w-md bg-white mt-5 lg:mt-24 shadow-2xl rounded-2xl border-0 overflow-hidden">
        {/* Success Header */}
        <div
          className="pt-8 pb-6 px-6 text-center"
          style={{
            background: "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)",
          }}
        >
          <div className="mx-auto mb-6 relative inline-block">
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse"
              style={{
                background:
                  "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
              }}
            />
            <div
              className="relative size-24 rounded-full flex items-center justify-center shadow-xl animate-bounce"
              style={{
                background:
                  "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
                animationDuration: "2s",
              }}
            >
              <div className="bg-white p-2 rounded-full">
                <Check
                  className="h-10 w-10"
                  style={{ color: "#6B46C1" }}
                  strokeWidth={3}
                />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 font-medium">
            Your order has been confirmed
          </p>

          {confirmFailed && (
            <div className="mt-4 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Your payment was processed. Order details may take a minute to
                appear in My Orders.
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Order Number */}
          <div
            className="p-4 rounded-xl border-2 relative overflow-hidden"
            style={{
              borderColor: "#E9D5FF",
              background: "linear-gradient(135deg, #FEFCE8 0%, #FEF3C7 100%)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="p-2 rounded-lg shadow-md"
                style={{ backgroundColor: "#FCD34D" }}
              >
                <ShoppingBag
                  className="w-5 h-5"
                  style={{ color: "#D97706" }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Order Number
                </p>
                <p className="text-xs font-mono font-bold text-gray-800 break-all">
                  {orderNumber
                    ? `${orderNumber.slice(0, 18)}...`
                    : "Processing..."}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-3">
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: "#F9FAFB" }}
            >
              <span className="text-sm font-semibold text-gray-600">Date</span>
              <span className="text-sm font-bold text-gray-900">{date}</span>
            </div>

            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: "#F9FAFB" }}
            >
              <span className="text-sm font-semibold text-gray-600">Time</span>
              <span className="text-sm font-bold text-gray-900">{time}</span>
            </div>

            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: "#F9FAFB" }}
            >
              <span className="text-sm font-semibold text-gray-600">
                Payment Method
              </span>
              <div className="flex items-center gap-2">
                <CreditCard
                  className="h-4 w-4"
                  style={{ color: "#6B46C1" }}
                />
                <span className="text-sm font-bold text-gray-900">
                  Card Payment
                </span>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="flex items-center justify-center gap-2 p-3 rounded-lg"
              style={{ backgroundColor: "#F3E8FF" }}
            >
              <Shield className="w-4 h-4" style={{ color: "#FFD700" }} />
              <span
                className="text-xs font-bold"
                style={{ color: "#6B46C1" }}
              >
                Secure
              </span>
            </div>
            <div
              className="flex items-center justify-center gap-2 p-3 rounded-lg"
              style={{ backgroundColor: "#FEF3C7" }}
            >
              <Check className="w-4 h-4" style={{ color: "#D97706" }} />
              <span className="text-xs font-bold text-gray-700">Verified</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-3.5 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 relative overflow-hidden group"
            style={{
              background:
                "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
            }}
            onClick={() => router.push("/orders")}
          >
            <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <ShoppingBag className="w-5 h-5 relative z-10" />
            <span className="relative z-10">View My Orders</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full text-center py-2 text-sm font-semibold transition-colors hover:underline"
            style={{ color: "#6B46C1" }}
          >
            Continue Shopping →
          </button>
        </CardContent>

        <Separator className="my-0" />

        <CardFooter className="p-6 bg-gradient-to-br from-gray-50 to-purple-50/20 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 border-2"
            style={{ borderColor: "#E9D5FF", color: "#6B46C1" }}
          >
            <Download className="h-4 w-4" />
            Download Receipt
          </Button>
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 border-2"
            style={{ borderColor: "#FCD34D", color: "#D97706" }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </CardFooter>

        <div
          className="h-2 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(90deg, #574095 0%, #6B46C1 50%, #FFD700 100%)",
          }}
        />
      </Card>
    </div>
  );
}