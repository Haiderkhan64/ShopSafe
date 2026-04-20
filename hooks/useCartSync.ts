"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import useBasketStore, { resetCartSyncAbort } from "@/store";

type LeaderMessage =
  | { type: "ping" }
  | { type: "pong" }
  | { type: "sync_done" };

const CHANNEL_NAME = "shopsafe:cart:leader";
const PONG_TIMEOUT_MS = 200;

function supportsBC(): boolean {
  return typeof BroadcastChannel !== "undefined";
}

export function useCartSync() {
  const { isSignedIn, isLoaded } = useAuth();

  const mergeWithServer       = useBasketStore((s) => s.mergeWithServer);
  const clearBasketWithServer = useBasketStore((s) => s.clearBasketWithServer);
  const hydrateItemsLocally   = useBasketStore((s) => s.hydrateItemsLocally);
  const hasHydrated           = useBasketStore((s) => s._hasHydrated);

  const isLeader        = useRef(false);
  const didInitialSync  = useRef(false);
  const prevIsSignedIn  = useRef<boolean | null>(null);
  const channelRef      = useRef<BroadcastChannel | null>(null);
  const pongTimer       = useRef<ReturnType<typeof setTimeout> | null>(null);

  const becomeLeaderAndSync = useCallback(async () => {
    isLeader.current = true;
    // Always reset the abort flag before syncing.  The flag is a
    // module-level variable — Next.js never re-initialises module scope
    // between client-side navigations, so a stale `true` from a previous
    // sign-out would silently suppress all subsequent syncs.
    resetCartSyncAbort();
    log("Elected as leader — merging with server");
    await mergeWithServer();
    channelRef.current?.postMessage({ type: "sync_done" } satisfies LeaderMessage);
  }, [mergeWithServer]);

  const electLeader = useCallback(() => {
    if (!supportsBC()) {
      becomeLeaderAndSync();
      return;
    }

    channelRef.current?.postMessage({ type: "ping" } satisfies LeaderMessage);

    pongTimer.current = setTimeout(() => {
      becomeLeaderAndSync();
    }, PONG_TIMEOUT_MS);
  }, [becomeLeaderAndSync]);

  useEffect(() => {
    if (!supportsBC()) return;

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (e: MessageEvent<LeaderMessage>) => {
      const msg = e.data;

      if (msg.type === "ping" && isLeader.current) {
        channel.postMessage({ type: "pong" } satisfies LeaderMessage);
      }

      if (msg.type === "pong") {
        if (pongTimer.current) {
          clearTimeout(pongTimer.current);
          pongTimer.current = null;
        }
        log("Leader already exists — skipping merge");
      }

      if (msg.type === "sync_done") {
        log("Received sync_done from leader — hydrating from server");
        useBasketStore.getState().hydrateFromServer();
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
      if (pongTimer.current) clearTimeout(pongTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !hasHydrated) return;

    const signedIn = !!isSignedIn;

    const isSuccessPage =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/success");

    if (!didInitialSync.current) {
      didInitialSync.current = true;
      prevIsSignedIn.current = signedIn;

      if (signedIn) {
        if (isSuccessPage) {
          log("Initial load — success page, skipping merge");
        } else {
          log("Initial load — signed in, electing leader for merge");
          electLeader();
        }
      } else {
        log("Initial load — not signed in, hydrating locally");
        hydrateItemsLocally();
      }
      return;
    }

    // Auth-state transition (sign-in / sign-out)
    if (prevIsSignedIn.current !== signedIn) {
      prevIsSignedIn.current = signedIn;

      if (signedIn) {
        if (!isSuccessPage) {
          log("User signed in — electing leader for merge");
          electLeader();
        }
      } else {
        log("User signed out — clearing local cart");
        clearBasketWithServer();
      }
    }
  }, [
    isSignedIn,
    isLoaded,
    hasHydrated,
    electLeader,
    clearBasketWithServer,
    hydrateItemsLocally,
  ]);
}

const log =
  process.env.NODE_ENV === "development"
    ? (msg: string) => console.log("[CartSync]", msg)
    : () => {};