"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/providers/I18nProvider";

const categories = [
  { value: "Sauce", label: "Sauce" },
  { value: "SideDish", label: "Banchan" },
  { value: "Snack", label: "Snack" },
  { value: "Beverage", label: "Beverage" },
];

export function ProductFilters() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [halal, setHalal] = useState(searchParams.get("halal") === "true");
  const [spicy, setSpicy] = useState(searchParams.get("spicy") === "true");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    if (halal) params.set("halal", "true");
    if (spicy) params.set("spicy", "true");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setHalal(false);
    setSpicy(false);
    router.replace(pathname);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("products.filters.search")}
        </label>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          placeholder="kimchi, gochujang..."
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("products.filters.category")}
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="">All</option>
          {categories.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("products.filters.halal")}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={halal}
            onChange={(event) => setHalal(event.target.checked)}
            className="h-4 w-4"
          />
          {t("products.halal")}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={spicy}
            onChange={(event) => setSpicy(event.target.checked)}
            className="h-4 w-4"
          />
          {t("products.filters.spicy")}
        </label>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          {t("products.filters.apply")}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300"
        >
          {t("products.filters.reset")}
        </button>
      </div>
    </form>
  );
}
