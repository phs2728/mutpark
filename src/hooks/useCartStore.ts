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
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clear: () => void;
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
  async fetchCart() {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/cart", { credentials: "include" });
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
      await handleResponse(response);
      await get().fetchCart();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  async updateItem(productId, quantity) {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });
      await handleResponse(response);
      await get().fetchCart();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  async removeItem(productId) {
    set({ loading: true, error: undefined });
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });
      await handleResponse(response);
      await get().fetchCart();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  clear() {
    set({ items: [], subtotal: 0 });
  },
}));
