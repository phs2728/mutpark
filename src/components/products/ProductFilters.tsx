"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/providers/I18nProvider";

const defaultCategories = [
  { value: "Sauce", label: "Sauce" },
  { value: "SideDish", label: "Banchan" },
  { value: "Snack", label: "Snack" },
  { value: "Beverage", label: "Beverage" },
];

interface FilterOptions {
  categories: string[];
  brands: string[];
}

export function ProductFilters() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [halal, setHalal] = useState(searchParams.get("halal") === "true");
  const [spicy, setSpicy] = useState(searchParams.get("spicy") === "true");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");
  const [options, setOptions] = useState<FilterOptions>({ categories: [], brands: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ id: number; slug: string; name: string }>>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadFilters = async () => {
      try {
        const response = await fetch("/api/products/filters");
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const json = (await response.json()) as {
          success: boolean;
          data?: FilterOptions;
        };
        if (!json.success || !json.data) {
          throw new Error("Failed to load filter options");
        }
        if (active) {
          setOptions(json.data);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError((err as Error).message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFilters();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();
    setSuggestionsLoading(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/products?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load search suggestions");
        }
        const json = (await response.json()) as {
          data?: {
            suggestions?: Array<{ id: number; slug: string; name: string }>;
          };
        };
        setSuggestions(json.data?.suggestions ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setSuggestionsLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  const applyFilters = (overrides?: {
    search?: string;
    category?: string;
    brand?: string;
    halal?: boolean;
    spicy?: boolean;
    sort?: string;
  }) => {
    const nextSearch = (overrides?.search ?? search).trim();
    const nextCategory = overrides?.category ?? category;
    const nextBrand = overrides?.brand ?? brand;
    const nextHalal = overrides?.halal ?? halal;
    const nextSpicy = overrides?.spicy ?? spicy;
    const nextSort = overrides?.sort ?? sort;

    const params = new URLSearchParams();
    if (nextSearch) params.set("search", nextSearch);
    if (nextCategory) params.set("category", nextCategory);
    if (nextBrand) params.set("brand", nextBrand);
    if (nextHalal) params.set("halal", "true");
    if (nextSpicy) params.set("spicy", "true");
    if (nextSort && nextSort !== "newest") params.set("sort", nextSort);

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    applyFilters();
  };

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setHalal(false);
    setSpicy(false);
    setSort("newest");
    setSuggestions([]);
    router.replace(pathname);
  };

  const handleSuggestionSelect = (value: string) => {
    setSearch(value);
    setSuggestions([]);
    applyFilters({ search: value });
  };

  const categoryOptions = options.categories.length
    ? options.categories.map((value) => ({ value, label: value }))
    : defaultCategories;

  const brandOptions = options.brands;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {t("notifications.error")}
        </p>
      ) : null}
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
        {suggestionsLoading ? (
          <p className="pt-2 text-xs text-slate-400 dark:text-slate-500">{t("products.filters.loadingSuggestions", "Searching...")}</p>
        ) : null}
        {!suggestionsLoading && suggestions.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs uppercase text-slate-400 dark:text-slate-500">
              {t("products.filters.suggestions")}
            </span>
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSuggestionSelect(item.name)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-500"
              >
                {item.name}
              </button>
            ))}
          </div>
        ) : null}
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
          <option value="">{t("products.filters.all")}</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("products.filters.brand")}
        </label>
        <select
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          disabled={loading && !brandOptions.length}
        >
          <option value="">{t("products.filters.all")}</option>
          {brandOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("products.filters.sort")}
        </label>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="newest">{t("products.filters.sortNewest")}</option>
          <option value="price-asc">{t("products.filters.sortPriceAsc")}</option>
          <option value="price-desc">{t("products.filters.sortPriceDesc")}</option>
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
