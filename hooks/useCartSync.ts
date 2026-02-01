'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import useBasketStore from '@/store';

/**
 * Hook that automatically syncs cart with server when user authentication state changes
 * Works with Clerk authentication
 */
export function useCartSync() {
  const { isSignedIn, isLoaded } = useAuth();
  const { mergeWithServer, clearBasket } = useBasketStore();
  const hasSynced = useRef(false); // Track if we've already synced
  const previousSignedIn = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    // Wait for Clerk to finish loading
    if (!isLoaded) return;

    // User just signed IN (transition from signed out to signed in)
    if (isSignedIn && previousSignedIn.current === false) {
      console.log('🔄 User signed in - syncing cart with server');
      if (!hasSynced.current) {
        mergeWithServer();
        hasSynced.current = true;
      }
    }

    // User just signed OUT (transition from signed in to signed out)
    if (!isSignedIn && previousSignedIn.current === true) {
      console.log('🧹 User signed out - clearing cart');
      clearBasket();
      hasSynced.current = false;
    }

    // Initial page load - user is already signed in
    // CRITICAL: Only sync ONCE per session
    if (isSignedIn && !hasSynced.current && previousSignedIn.current === undefined) {
      console.log('✅ User already signed in - loading cart from server (ONCE)');
      mergeWithServer();
      hasSynced.current = true;
    }

    // Update previous state for next render
    previousSignedIn.current = isSignedIn;
  }, [isSignedIn, isLoaded, mergeWithServer, clearBasket]);
}