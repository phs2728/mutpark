"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CurrencyCode, SUPPORTED_CURRENCIES, convertCurrency, isCurrency } from "@/lib/currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  convert: (amount: number, from: CurrencyCode) => number;
};

const DEFAULT_CURRENCY: CurrencyCode = "TRY";
const STORAGE_KEY = "mutpark:currency";

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children, initialCurrency }: { children: React.ReactNode; initialCurrency?: string }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (initialCurrency && isCurrency(initialCurrency)) {
      return initialCurrency;
    }
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && isCurrency(stored)) {
        return stored;
      }
    }
    return DEFAULT_CURRENCY;
  });

  useEffect(() => {
    if (!initialCurrency || !isCurrency(initialCurrency)) return;
    setCurrencyState(initialCurrency);
  }, [initialCurrency]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency: setCurrencyState,
      convert: (amount: number, from: CurrencyCode) => convertCurrency(amount, from, currency),
    }),
    [currency],
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

export function getDefaultCurrency(initial?: string) {
  return initial && isCurrency(initial) ? initial : DEFAULT_CURRENCY;
}

export function getSupportedCurrencies() {
  return SUPPORTED_CURRENCIES;
}
