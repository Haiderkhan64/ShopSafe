'use client';

import { useCartSync } from '@/hooks/useCartSync';

export function CartSyncWrapper({ children }: { children: React.ReactNode }) {
  useCartSync(); // This handles all the cart syncing automatically
  return <>{children}</>;
}