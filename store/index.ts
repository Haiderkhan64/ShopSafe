import type { Product } from "@/sanity.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BasketItem {
  product: Product;
  quantity: number;
}

interface BasketState {
  items: BasketItem[];
  isSyncing: boolean;
  lastSyncError: string | null;
  
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearBasket: () => void;
  
  syncToServer: (productId: string, action: 'add' | 'remove') => Promise<void>;
  mergeWithServer: () => Promise<void>;
  hydrateFromServer: () => Promise<void>;
  
  getTotalPrice: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => BasketItem[];
}

const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      lastSyncError: null,

      addItem: (product) => {
        if (!product || !product._id) {
          console.error('Invalid product:', product);
          return;
        }

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product?._id === product._id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product?._id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity: 1 }],
          };
        });
      },

      removeItem: (productId: string) => {
        if (!productId) return;

        set((state) => ({
          items: state.items.reduce((acc, item) => {
            if (item.product?._id === productId) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as BasketItem[]),
        }));
      },

      clearBasket: () => set({ items: [] }),

      syncToServer: async (productId, action) => {
        set({ isSyncing: true, lastSyncError: null });
        
        try {
          const response = await fetch('/api/cart/merge', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, action }),
          });

          if (!response.ok) {
            throw new Error('Sync failed');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Sync failed';
          set({ lastSyncError: errorMsg });
          console.error('Failed to sync cart:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      mergeWithServer: async () => {
        set({ isSyncing: true, lastSyncError: null });

        try {
          // Get current localStorage items FIRST (source of truth)
          const { items: localItems } = get();
          const validLocalItems = localItems.filter(item => item.product && item.product._id);
          
          // If localStorage has items, sync them to server (localStorage wins)
          if (validLocalItems.length > 0) {
            console.log('📤 Syncing localStorage cart to server (localStorage is source of truth)');

            const response = await fetch('/api/cart/merge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                localItems: validLocalItems.map(item => ({
                  product: { _id: item.product._id },
                  quantity: item.quantity
                }))
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('Merge failed:', response.status, errorData);
              throw new Error(`Merge failed: ${errorData.error || response.statusText}`);
            }

            console.log('✅ Cart synced to server successfully');
            
          } else {
            // If localStorage is empty, load from server (server wins)
            console.log('📥 localStorage empty - loading cart from server');
            await get().hydrateFromServer();
          }

        } catch (error) {
          set({ lastSyncError: 'Failed to merge cart' });
          console.error('Cart merge error:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      hydrateFromServer: async () => {
        set({ isSyncing: true, lastSyncError: null });

        try {
          console.log('Fetching cart from server...');
          
          // Fetch cart from database (only has productIds)
          const cartResponse = await fetch('/api/cart');
          
          if (!cartResponse.ok) {
            throw new Error('Failed to fetch cart');
          }

          const serverCart = await cartResponse.json();
          
          if (!serverCart.items || serverCart.items.length === 0) {
            console.log('No items in server cart');
            return;
          }

          console.log('Server cart items:', serverCart.items);

          // Extract product IDs
          const productIds = serverCart.items.map((item: any) => item.productId);
          
          // Fetch full product details from Sanity
          const productsResponse = await fetch('/api/products/by-ids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: productIds }),
          });

          if (!productsResponse.ok) {
            throw new Error('Failed to fetch product details');
          }

          const products = await productsResponse.json();
          console.log('Fetched products from Sanity:', products);

          // Combine database quantities with Sanity product details
          const hydratedItems: BasketItem[] = serverCart.items
            .map((dbItem: any) => {
              const product = products.find((p: Product) => p._id === dbItem.productId);
              
              if (!product) {
                console.warn(`Product ${dbItem.productId} not found in Sanity`);
                return null;
              }

              return {
                product,
                quantity: dbItem.quantity,
              };
            })
            .filter((item): item is BasketItem => item !== null);

          console.log('Hydrated cart items:', hydratedItems);

          // Update store with hydrated items
          set({ items: hydratedItems });

        } catch (error) {
          console.error('Failed to hydrate cart:', error);
          set({ lastSyncError: 'Failed to load cart' });
        } finally {
          set({ isSyncing: false });
        }
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          if (!item.product || typeof item.product.price !== 'number') {
            return total;
          }
          return total + item.product.price * item.quantity;
        }, 0);
      },

      getItemCount: (productId) => {
        if (!productId) return 0;
        
        const item = get().items.find((item) => 
          item.product && item.product._id === productId
        );
        return item ? item.quantity : 0;
      },

      getGroupedItems: () => {
        return get().items.filter(item => item.product && item.product._id);
      },
    }),
    {
      name: "basket-store",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const validItems = state.items.filter(
            item => item.product && item.product._id
          );
          
          if (validItems.length !== state.items.length) {
            console.log('Cleaned up corrupted cart items');
            state.items = validItems;
          }
        }
      },
    }
  )
);

export default useBasketStore;