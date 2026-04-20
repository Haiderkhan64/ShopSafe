import type { Product } from "@/sanity.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import { MAX_CART_QUANTITY } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BasketItem {
  product: Product;
  quantity: number;
}

interface PersistedItem {
  productId: string;
  quantity: number;
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const RawServerItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const RawServerCartSchema = z.object({
  items: z.array(RawServerItemSchema),
});

// ---------------------------------------------------------------------------
// Dev-only logger
// ---------------------------------------------------------------------------

const log =
  process.env.NODE_ENV === "development"
    ? (...args: unknown[]) => console.log("[basket]", ...args)
    : () => {};

const warn =
  process.env.NODE_ENV === "development"
    ? (...args: unknown[]) => console.warn("[basket]", ...args)
    : () => {};

// ---------------------------------------------------------------------------
// Invariant assertion
// ---------------------------------------------------------------------------

function assertCartInvariant(
  items: BasketItem[],
  persisted: PersistedItem[],
  context: string
): void {
  if (process.env.NODE_ENV !== "development") return;

  if (items.length !== persisted.length) {
    console.error(
      `[basket] INVARIANT VIOLATION in ${context}: items.length (${items.length}) !== _persistedItems.length (${persisted.length})`
    );
    return;
  }

  for (const item of items) {
    const p = persisted.find((pi) => pi.productId === item.product._id);
    if (!p) {
      console.error(
        `[basket] INVARIANT VIOLATION in ${context}: item ${item.product._id} missing from _persistedItems`
      );
    } else if (p.quantity !== item.quantity) {
      console.error(
        `[basket] INVARIANT VIOLATION in ${context}: quantity mismatch for ${item.product._id} — items: ${item.quantity}, _persistedItems: ${p.quantity}`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Cart sync abort flag
// FIX: expose resetCartSyncAbort so useCartSync can unconditionally clear it
// at the start of every leader election, not just on auth-state transitions.
// Previously the flag could remain true across client-side navigations because
// module-level state is never re-initialised by Next.js between SPA transitions.
// ---------------------------------------------------------------------------

let _cartSyncAborted = false;

export function abortCartSync(): void {
  _cartSyncAborted = true;
  log("Cart sync aborted");
}

export function resetCartSyncAbort(): void {
  _cartSyncAborted = false;
  log("Cart sync abort flag reset");
}

export function isCartSyncAborted(): boolean {
  return _cartSyncAborted;
}

// ---------------------------------------------------------------------------
// State interface
// ---------------------------------------------------------------------------

interface BasketState {
  items: BasketItem[];
  _persistedItems: PersistedItem[];
  _hasHydrated: boolean;
  isSyncing: boolean;
  lastSyncError: string | null;

  _setHasHydrated: (value: boolean) => void;

  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearBasket: () => void;
  clearBasketWithServer: () => Promise<void>;

  hydrateItemsLocally: () => Promise<void>;
  mergeWithServer: () => Promise<void>;
  hydrateFromServer: () => Promise<void>;

  getTotalPrice: () => number;
  getGroupedItems: () => BasketItem[];
  getItemCount: (productId: string) => number;
}

// ---------------------------------------------------------------------------
// Cart mutation helper — THE ONLY WAY to mutate cart contents
// ---------------------------------------------------------------------------

type CartSlice = Pick<BasketState, "items" | "_persistedItems">;

function mutateCartItem(
  state: CartSlice,
  productId: string,
  product: Product | null,
  delta: number,
  context = "mutateCartItem"
): CartSlice {
  const currentItem = state.items.find((i) => i.product._id === productId);
  const currentPersisted = state._persistedItems.find(
    (i) => i.productId === productId
  );

  const currentQty = currentItem?.quantity ?? currentPersisted?.quantity ?? 0;
  const newQty = Math.max(0, Math.min(currentQty + delta, MAX_CART_QUANTITY));

  let nextItems: BasketItem[];
  let nextPersisted: PersistedItem[];

  if (newQty === 0) {
    nextItems = state.items.filter((i) => i.product._id !== productId);
    nextPersisted = state._persistedItems.filter(
      (i) => i.productId !== productId
    );
  } else if (currentItem) {
    nextItems = state.items.map((i) =>
      i.product._id === productId ? { ...i, quantity: newQty } : i
    );
    nextPersisted = state._persistedItems.map((i) =>
      i.productId === productId ? { ...i, quantity: newQty } : i
    );
  } else if (currentPersisted) {
    nextItems = state.items;
    nextPersisted = state._persistedItems.map((i) =>
      i.productId === productId ? { ...i, quantity: newQty } : i
    );
  } else {
    if (!product) {
      console.error(
        `[basket] mutateCartItem (${context}): product object is required when adding a new item`,
        productId
      );
      return state;
    }
    nextItems = [...state.items, { product, quantity: newQty }];
    nextPersisted = [
      ...state._persistedItems,
      { productId, quantity: newQty },
    ];
  }

  const preHydration = nextItems.length !== nextPersisted.length;
  if (!preHydration) {
    assertCartInvariant(nextItems, nextPersisted, context);
  }

  return { items: nextItems, _persistedItems: nextPersisted };
}

// ---------------------------------------------------------------------------
// Helper: build a consistent cart slice from PersistedItem[] + product map
// ---------------------------------------------------------------------------

function buildCartSlice(
  persisted: PersistedItem[],
  productMap: Map<string, Product>,
  context: string
): CartSlice {
  const items: BasketItem[] = [];
  const validPersisted: PersistedItem[] = [];

  for (const { productId, quantity } of persisted) {
    const product = productMap.get(productId);
    if (!product) {
      warn(`${context}: no Sanity product for ${productId} — removing`);
      continue;
    }
    const clampedQty = Math.min(quantity, MAX_CART_QUANTITY);
    items.push({ product, quantity: clampedQty });
    validPersisted.push({ productId, quantity: clampedQty });
  }

  assertCartInvariant(items, validPersisted, context);
  return { items, _persistedItems: validPersisted };
}

// ---------------------------------------------------------------------------
// Network helpers
// ---------------------------------------------------------------------------

async function fetchProductsByIds(
  productIds: string[]
): Promise<Map<string, Product>> {
  if (productIds.length === 0) return new Map();

  const response = await fetch("/api/products/by-ids", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: productIds }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products [${response.status}]`);
  }

  const products: Product[] = await response.json();
  return new Map(products.map((p) => [p._id, p]));
}

async function fetchRawServerCart(): Promise<PersistedItem[]> {
  const response = await fetch("/api/cart");

  if (!response.ok) {
    throw new Error(`Failed to fetch server cart [${response.status}]`);
  }

  const raw = await response.json();
  const normalised = { items: Array.isArray(raw?.items) ? raw.items : [] };

  const parsed = RawServerCartSchema.safeParse(normalised);
  if (!parsed.success) {
    throw new Error(`Invalid cart response: ${parsed.error.message}`);
  }

  return parsed.data.items;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      _persistedItems: [],
      _hasHydrated: false,
      isSyncing: false,
      lastSyncError: null,

      _setHasHydrated: (value) => set({ _hasHydrated: value }),

      addItem: (product) => {
        if (!product?._id) {
          console.error("[basket] addItem called with invalid product", product);
          return;
        }
        set((state) =>
          mutateCartItem(state, product._id, product, 1, "addItem")
        );
      },

      removeItem: (productId) => {
        if (!productId) return;
        set((state) =>
          mutateCartItem(state, productId, null, -1, "removeItem")
        );
      },

      clearBasket: () => {
        set({ items: [], _persistedItems: [] });
        assertCartInvariant([], [], "clearBasket");
      },

      clearBasketWithServer: async () => {
        set({ items: [], _persistedItems: [] });
        assertCartInvariant([], [], "clearBasketWithServer");
      },

      hydrateItemsLocally: async () => {
        const persisted = get()._persistedItems;

        if (persisted.length === 0) {
          set({ items: [], _persistedItems: [] });
          return;
        }

        if (get().isSyncing) {
          warn("hydrateItemsLocally skipped — sync already in progress");
          return;
        }

        set({ isSyncing: true, lastSyncError: null });
        log("Hydrating locally for", persisted.length, "products");

        try {
          const productMap = await fetchProductsByIds(
            persisted.map((i) => i.productId)
          );
          const slice = buildCartSlice(
            persisted,
            productMap,
            "hydrateItemsLocally"
          );
          set(slice);
          log("hydrateItemsLocally complete:", slice.items.length, "items");
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Local hydration failed";
          set({ lastSyncError: msg });
          console.error("[basket] hydrateItemsLocally error:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      mergeWithServer: async () => {
        const { _hasHydrated, isSyncing } = get();

        if (!_hasHydrated) {
          warn("mergeWithServer called before hydration — skipping");
          return;
        }

        if (isSyncing) {
          warn("mergeWithServer already in progress — skipping");
          return;
        }

        set({ isSyncing: true, lastSyncError: null });
        log("Starting merge with server...");

        try {
          const [serverItems, localItems] = [
            await fetchRawServerCart(),
            get()._persistedItems,
          ];

          log(
            "Server items:",
            serverItems.length,
            "Local items:",
            localItems.length
          );

          if (localItems.length === 0 && serverItems.length === 0) {
            log("Both carts empty — nothing to do");
            return;
          }

          let mergedItems: PersistedItem[];

          if (localItems.length === 0) {
            mergedItems = serverItems.map((si) => ({
              productId: si.productId,
              quantity: Math.min(si.quantity, MAX_CART_QUANTITY),
            }));
          } else {
            const mergedMap = new Map<string, number>();
            for (const si of serverItems) {
              mergedMap.set(si.productId, si.quantity);
            }
            for (const li of localItems) {
              const serverQty = mergedMap.get(li.productId) ?? 0;
              mergedMap.set(
                li.productId,
                Math.min(Math.max(li.quantity, serverQty), MAX_CART_QUANTITY)
              );
            }
            mergedItems = Array.from(mergedMap.entries()).map(
              ([productId, quantity]) => ({ productId, quantity })
            );
          }

          const pushResponse = await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ localItems: mergedItems }),
          });

          if (!pushResponse.ok) {
            const errBody = await pushResponse.json().catch(() => ({}));
            throw new Error(
              `Merge failed [${pushResponse.status}]: ${
                errBody?.error ?? pushResponse.statusText
              }`
            );
          }

          const productMap = await fetchProductsByIds(
            mergedItems.map((i) => i.productId)
          );
          const slice = buildCartSlice(
            mergedItems,
            productMap,
            "mergeWithServer"
          );
          set(slice);
          log("Merge complete:", slice.items.length, "items");
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Merge failed";
          set({ lastSyncError: msg });
          console.error("[basket] mergeWithServer error:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      hydrateFromServer: async () => {
        if (get().isSyncing) {
          warn("hydrateFromServer already in progress — skipping");
          return;
        }

        set({ isSyncing: true, lastSyncError: null });
        log("Hydrating cart from server...");

        try {
          const serverItems = await fetchRawServerCart();

          if (serverItems.length === 0) {
            log("Server cart empty");
            set({ items: [], _persistedItems: [] });
            assertCartInvariant([], [], "hydrateFromServer:empty");
            return;
          }

          const productMap = await fetchProductsByIds(
            serverItems.map((i) => i.productId)
          );
          const slice = buildCartSlice(
            serverItems,
            productMap,
            "hydrateFromServer"
          );
          set(slice);
          log("Hydrated", slice.items.length, "items from server");
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : "Hydration failed";
          set({ lastSyncError: msg });
          console.error("[basket] hydrateFromServer error:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      getTotalPrice: () =>
        get().items.reduce((total, item) => {
          if (typeof item.product?.price !== "number") return total;
          return total + item.product.price * item.quantity;
        }, 0),

      getGroupedItems: () => get().items.filter((item) => !!item.product?._id),

      getItemCount: (productId) =>
        get().items.find((i) => i.product._id === productId)?.quantity ?? 0,
    }),

    {
      name: "basket-store",
      partialize: (state) => ({ _persistedItems: state._persistedItems }),

      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const before = state._persistedItems?.length ?? 0;
        state._persistedItems = (state._persistedItems ?? []).filter(
          (item) =>
            typeof item.productId === "string" &&
            item.productId.length > 0 &&
            typeof item.quantity === "number" &&
            item.quantity > 0 &&
            item.quantity <= MAX_CART_QUANTITY
        );

        if (state._persistedItems.length !== before) {
          warn(
            `Removed ${
              before - state._persistedItems.length
            } corrupted items during rehydration`
          );
        }

        state.items = [];
        state._hasHydrated = true;
        state._setHasHydrated(true);
        log(
          "Store rehydrated —",
          state._persistedItems.length,
          "persisted items"
        );
      },
    }
  )
);

export default useBasketStore;