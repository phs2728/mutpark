"use client";

import { createContext, useContext, useMemo } from "react";
import { CurrencyCode, convertCurrency, DEFAULT_CURRENCY } from "@/lib/currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  convert: (amount: number, from: CurrencyCode) => number;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency: DEFAULT_CURRENCY,
      setCurrency: () => undefined,
      convert: (amount: number) => convertCurrency(amount, DEFAULT_CURRENCY, DEFAULT_CURRENCY),
    }),
    [],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
