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
      className={["btn-primary", className].filter(Boolean).join(" ")}
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
