"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import useBasketStore from "@/store";
import { cn } from "@/lib/utils";
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


// Brand purple used the same way it is in Loader.tsx / orders/page.tsx:
// solid gradients stay as literal hex (they already read fine on both
// themes), while surfaces, borders and text follow the app's existing
// dark: convention instead of shadcn's --card/--foreground tokens, which
// the rest of the app doesn't actually use.
const BRAND = {
  gradient: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
  accentGradient: "linear-gradient(90deg, #574095 0%, #6B46C1 50%, #FFD700 100%)",
  purple: "#6B46C1",
} as const;

// Matches Loader.tsx / orders/page.tsx exactly.
const PAGE_BACKGROUND_CLASS =
  "min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/20 transition-colors duration-300";


// Split out of the page's return purely for readability — none of these are
// reused elsewhere, so they stay in this file rather than becoming separate
// modules.

function BrandSpinner() {
  return (
    <div
      className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-transparent animate-spin"
      style={{ borderTopColor: "#574095", borderRightColor: BRAND.purple }}
    />
  );
}

function SimpleLoader() {
  return (
    <div className={cn("flex items-center justify-center", PAGE_BACKGROUND_CLASS)}>
      <div className="text-center">
        <BrandSpinner />
        <p className="text-lg font-semibold text-[#574095] dark:text-purple-300">
          Loading...
        </p>
      </div>
    </div>
  );
}

function ConfirmingLoader() {
  return (
    <div className={cn("flex items-center justify-center", PAGE_BACKGROUND_CLASS)}>
      <div className="text-center max-w-sm px-4">
        <BrandSpinner />
        <p className="text-lg font-semibold mb-2 text-[#574095] dark:text-purple-300">
          Confirming your order…
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This usually takes just a moment. Please don&apos;t close this tab.
        </p>
      </div>
    </div>
  );
}

function SuccessHeader({ confirmFailed }: { confirmFailed: boolean }) {
  return (
    <div className="pt-8 pb-6 px-6 text-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 transition-colors duration-300">
      <div className="mx-auto mb-6 relative inline-block">
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse"
          style={{ background: BRAND.gradient }}
        />
        <div
          className="relative size-24 rounded-full flex items-center justify-center shadow-xl animate-bounce"
          style={{ background: BRAND.gradient, animationDuration: "2s" }}
        >
          <div className="bg-white dark:bg-gray-900 p-2 rounded-full transition-colors duration-300">
            <Check
              className="h-10 w-10 text-purple-600 dark:text-purple-400"
              strokeWidth={3}
            />
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Payment Successful!
      </h1>
      <p className="text-gray-600 dark:text-gray-400 font-medium">
        Your order has been confirmed
      </p>

      {confirmFailed && (
        <div className="mt-4 flex items-center gap-2 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 text-xs text-left transition-colors duration-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            Your payment was processed. Order details may take a minute to appear in My
            Orders.
          </span>
        </div>
      )}
    </div>
  );
}

function OrderNumberCard({ orderNumber }: { orderNumber: string | null }) {
  return (
    <div className="p-4 rounded-xl border-2 relative overflow-hidden bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-300 dark:border-yellow-700 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg shadow-md bg-yellow-300 dark:bg-yellow-700/60">
          <ShoppingBag className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Order Number
          </p>
          <p className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 break-all">
            {orderNumber ? `${orderNumber.slice(0, 18)}...` : "Processing..."}
          </p>
        </div>
      </div>
    </div>
  );
}

function TransactionDetails({ date, time }: { date: string; time: string }) {
  const rowClass =
    "flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-colors duration-300";
  const labelClass = "text-sm font-semibold text-gray-600 dark:text-gray-400";
  const valueClass = "text-sm font-bold text-gray-900 dark:text-gray-100";

  return (
    <div className="space-y-3">
      <div className={rowClass}>
        <span className={labelClass}>Date</span>
        <span className={valueClass}>{date}</span>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>Time</span>
        <span className={valueClass}>{time}</span>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>Payment Method</span>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className={valueClass}>Card Payment</span>
        </div>
      </div>
    </div>
  );
}

function SecurityBadges() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50 transition-colors duration-300">
        <Shield className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
          Secure
        </span>
      </div>
      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/40 transition-colors duration-300">
        <Check className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
          Verified
        </span>
      </div>
    </div>
  );
}

function PrimaryActions({ onViewOrders, onContinueShopping }: {
  onViewOrders: () => void;
  onContinueShopping: () => void;
}) {
  return (
    <>
      <button
        type="button"
        className="w-full py-3.5 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 relative overflow-hidden group"
        style={{ background: BRAND.gradient }}
        onClick={onViewOrders}
      >
        <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <ShoppingBag className="w-5 h-5 relative z-10" />
        <span className="relative z-10">View My Orders</span>
      </button>

      <button
        type="button"
        onClick={onContinueShopping}
        className="w-full text-center py-2 text-sm font-semibold transition-colors hover:underline text-purple-700 dark:text-purple-400"
      >
        Continue Shopping →
      </button>
    </>
  );
}

function ReceiptFooterActions() {
  return (
    <CardFooter className="p-6 bg-gradient-to-br from-gray-50 to-purple-50/20 dark:from-gray-800/60 dark:to-purple-900/20 flex flex-col sm:flex-row gap-3 transition-colors duration-300">
      <Button
        variant="outline"
        className="flex-1 flex items-center justify-center gap-2 border-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
      >
        <Download className="h-4 w-4" />
        Download Receipt
      </Button>
      <Button
        variant="outline"
        className="flex-1 flex items-center justify-center gap-2 border-2 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </CardFooter>
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
      now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    );
    setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
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
    <div className={cn(PAGE_BACKGROUND_CLASS, "flex items-start justify-center p-4")}>
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 mt-5 lg:mt-24 shadow-2xl rounded-2xl border-0 overflow-hidden transition-colors duration-300">
        <SuccessHeader confirmFailed={confirmFailed} />

        <CardContent className="p-6 space-y-6">
          <OrderNumberCard orderNumber={orderNumber} />

          <Separator />

          <TransactionDetails date={date} time={time} />

          <SecurityBadges />

          <PrimaryActions
            onViewOrders={() => router.push("/orders")}
            onContinueShopping={() => router.push("/")}
          />
        </CardContent>

        <Separator className="my-0" />

        <ReceiptFooterActions />

        <div className="h-2 relative overflow-hidden" style={{ background: BRAND.accentGradient }} />
      </Card>
    </div>
  );
}
