"use client";

import { createContext, useContext, useMemo } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";

interface I18nContextValue {
  locale: string;
  messages: Dictionary;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveMessage(messages: Dictionary, key: string) {
  return key.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in acc) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, messages);
}

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nContextValue>(() => {
    const translator = (key: string, fallback?: string) => {
      const result = resolveMessage(messages, key);
      if (typeof result === "string") {
        return result;
      }
      if (typeof result === "number") {
        return result.toString();
      }
      return fallback ?? key;
    };

    return {
      locale,
      messages,
      t: translator,
    };
  }, [locale, messages]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within the I18nProvider");
  }
  return context;
}
