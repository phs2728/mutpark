"use client";

import { create } from "zustand";

interface CartProduct {
  id: number;
  slug: string;
  name: string;
  imageUrl?: string | null;
  price: number;
  currency: string;
  halalCertified: boolean;
  spiceLevel?: number | null;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: CartProduct;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error?: string;
  subtotal: number;
  optimisticUpdating: Set<number>; // Track items being updated optimistically
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clear: () => void;
  clearError: () => void;
}

interface RawCartItemTranslation {
  name?: string | null;
}

interface RawCartItemProduct {
  id: number;
  slug: string;
  baseName: string;
  translations?: RawCartItemTranslation[] | null;
  imageUrl?: string | null;
  price: number | string;
  currency: string;
  halalCertified: boolean;
  spiceLevel?: number | null;
}

interface RawCartItem {
  id: number;
  productId: number;
  quantity: number;
  product: RawCartItemProduct;
}

interface CartApiResponse {
  data: {
    items?: RawCartItem[];
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message ?? "Request failed");
  }
  return (await response.json()) as T;
}

function parseCartItems(rawItems: RawCartItem[]): CartItem[] {
  return rawItems.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      slug: item.product.slug,
      name: item.product.translations?.[0]?.name ?? item.product.baseName,
      imageUrl: item.product.imageUrl,
      price: Number(item.product.price),
      currency: item.product.currency,
      halalCertified: item.product.halalCertified,
      spiceLevel: item.product.spiceLevel,
    },
  }));
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  subtotal: 0,
  optimisticUpdating: new Set(),
  async fetchCart() {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/cart", { credentials: "include" });
      // Treat 401 as unauthenticated: clear cart silently
      if (response.status === 401) {
        set({ items: [], subtotal: 0, loading: false });
        return;
      }
      const json = await handleResponse<CartApiResponse>(response);
      const items = parseCartItems(json.data.items ?? []);
      const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      set({ items, subtotal, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  async addItem(productId, quantity = 1) {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });
      if (response.status === 401) {
        // Not logged in
        set({ loading: false });
        return;
      }
      await handleResponse(response);
      await get().fetchCart();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  async updateItem(productId, quantity) {
    const currentState = get();
    const optimisticUpdating = new Set(currentState.optimisticUpdating);
    optimisticUpdating.add(productId);

    // Optimistic update
    const optimisticItems = currentState.items.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    const optimisticSubtotal = optimisticItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    set({
      items: optimisticItems,
      subtotal: optimisticSubtotal,
      optimisticUpdating,
      error: undefined
    });

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.status === 401) {
        // Revert optimistic update on auth failure
        const revertedUpdating = new Set(get().optimisticUpdating);
        revertedUpdating.delete(productId);
        set({
          items: currentState.items,
          subtotal: currentState.subtotal,
          optimisticUpdating: revertedUpdating
        });
        return;
      }

      await handleResponse(response);

      // Success: remove from optimistic updating set
      const successUpdating = new Set(get().optimisticUpdating);
      successUpdating.delete(productId);
      set({ optimisticUpdating: successUpdating });

      // Fetch latest data to ensure consistency
      await get().fetchCart();
    } catch (error) {
      // Revert optimistic update on error
      const errorUpdating = new Set(get().optimisticUpdating);
      errorUpdating.delete(productId);
      set({
        items: currentState.items,
        subtotal: currentState.subtotal,
        optimisticUpdating: errorUpdating,
        error: (error as Error).message
      });
    }
  },
  async removeItem(productId) {
    const currentState = get();
    const optimisticUpdating = new Set(currentState.optimisticUpdating);
    optimisticUpdating.add(productId);

    // Optimistic removal
    const optimisticItems = currentState.items.filter(item => item.productId !== productId);
    const optimisticSubtotal = optimisticItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    set({
      items: optimisticItems,
      subtotal: optimisticSubtotal,
      optimisticUpdating,
      error: undefined
    });

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (response.status === 401) {
        // Revert optimistic removal on auth failure
        const revertedUpdating = new Set(get().optimisticUpdating);
        revertedUpdating.delete(productId);
        set({
          items: currentState.items,
          subtotal: currentState.subtotal,
          optimisticUpdating: revertedUpdating
        });
        return;
      }

      await handleResponse(response);

      // Success: remove from optimistic updating set
      const successUpdating = new Set(get().optimisticUpdating);
      successUpdating.delete(productId);
      set({ optimisticUpdating: successUpdating });

      // Fetch latest data to ensure consistency
      await get().fetchCart();
    } catch (error) {
      // Revert optimistic removal on error
      const errorUpdating = new Set(get().optimisticUpdating);
      errorUpdating.delete(productId);
      set({
        items: currentState.items,
        subtotal: currentState.subtotal,
        optimisticUpdating: errorUpdating,
        error: (error as Error).message
      });
    }
  },
  clear() {
    set({ items: [], subtotal: 0, optimisticUpdating: new Set() });
  },
  clearError() {
    set({ error: undefined });
  },
}));
