"use client";

import { useTransition } from "react";
import { useCartStore } from "@/hooks/useCartStore";

interface AddToCartButtonProps {
  productId: number;
  quantity?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, quantity = 1, children, className, disabled }: AddToCartButtonProps) {
  const { addItem } = useCartStore();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={`rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300 ${className ?? ""}`}
      disabled={isPending || disabled}
      onClick={() =>
        startTransition(() => {
          void addItem(productId, quantity);
        })
      }
    >
      {isPending ? "..." : children}
    </button>
  );
}
