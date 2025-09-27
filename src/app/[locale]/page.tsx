import type { ReactNode } from "react";
import { Suspense } from "react";
import { Prisma } from "@prisma/client";
import { HeroSection } from "@/components/home/HeroSection";
import { BannerDisplay } from "@/components/banners/BannerDisplay";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { RecommendedProducts } from "@/components/products/RecommendedProducts";
import { PopularProducts } from "@/components/products/PopularProducts";
import { prisma } from "@/lib/prisma";
import { getLocalizedProduct } from "@/lib/i18n-utils";
import { productFilterSchema } from "@/lib/validators";

export default async function LocaleHome({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const searchParamsResolved = await searchParams;
  const parsedFilters = productFilterSchema.parse({
    search: searchParamsResolved.search,
    category: searchParamsResolved.category,
    halal: searchParamsResolved.halal,
    spicy: searchParamsResolved.spicy,
    page: searchParamsResolved.page,
    pageSize: searchParamsResolved.pageSize,
    sort: searchParamsResolved.sort,
  });

  const where: Prisma.ProductWhereInput = {};

  if (parsedFilters.search) {
    where.OR = [
      { baseName: { contains: parsedFilters.search } },
      {
        translations: {
          some: {
            name: { contains: parsedFilters.search },
          },
        },
      },
    ];
  }

  if (parsedFilters.category) {
    where.category = parsedFilters.category;
  }

  if (parsedFilters.halal !== undefined) {
    where.halalCertified = parsedFilters.halal;
  }

  if (parsedFilters.spicy) {
    where.spiceLevel = { gt: 0 };
  }

  const skip = (parsedFilters.page - 1) * parsedFilters.pageSize;

  const orderBy = (() => {
    switch (parsedFilters.sort) {
      case "price-asc":
        return { price: "asc" as const };
      case "price-desc":
        return { price: "desc" as const };
      case "newest":
      default:
        return { createdAt: "desc" as const };
    }
  })();

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: parsedFilters.pageSize,
      include: {
        translations: true,
      },
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  const localizedProducts = products.map((product) => getLocalizedProduct(product, locale));

  return (
    <div className="flex flex-col gap-10">
      {/* Header Banner */}
      <BannerDisplay position="HEADER" locale={locale} className="w-full" />

      {/* Hero Banners */}
      <BannerDisplay position="HERO" locale={locale} maxItems={1} />

      {/* Fallback to original HeroSection if no HERO banners */}
      <div className="hero-fallback">
        <HeroSection locale={locale} />
      </div>

      {/* Popular Products Section */}
      <Suspense fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48 dark:bg-slate-700"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-200 rounded-xl h-48 dark:bg-slate-700"></div>
            ))}
          </div>
        </div>
      }>
        <PopularProducts locale={locale} maxItems={8} />
      </Suspense>

      {/* Recommended Products Section */}
      <Suspense fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48 dark:bg-slate-700"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-200 rounded-xl h-48 dark:bg-slate-700"></div>
            ))}
          </div>
        </div>
      }>
        <RecommendedProducts locale={locale} maxItems={8} />
      </Suspense>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <ProductFilters />
          {/* Sidebar Banners */}
          <BannerDisplay position="SIDEBAR" locale={locale} maxItems={3} />
        </div>
        <div className="space-y-6">
          <ProductGrid
            locale={locale}
            products={localizedProducts}
            meta={{
              total,
              sort: parsedFilters.sort,
              page: parsedFilters.page,
              pageSize: parsedFilters.pageSize,
            }}
          />
          <Pagination
            currentPage={parsedFilters.page}
            pageSize={parsedFilters.pageSize}
            totalItems={total}
            locale={locale}
            searchParams={searchParamsResolved}
          />
        </div>
      </div>

      {/* Floating and Modal Banners (render globally) */}
      <BannerDisplay position="FLOATING" locale={locale} maxItems={1} />
      <BannerDisplay position="MODAL" locale={locale} maxItems={1} />
    </div>
  );
}

function Pagination({
  currentPage,
  pageSize,
  totalItems,
  locale,
  searchParams,
}: {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  locale: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (key !== "page") {
      params.set(key, value);
    }
  });

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
      <span>
        {currentPage} / {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <PaginationLink
          disabled={currentPage <= 1}
          href={`/${locale}?${(() => {
            const copy = new URLSearchParams(params);
            copy.set("page", String(currentPage - 1));
            return copy.toString();
          })()}`}
        >
          ←
        </PaginationLink>
        <PaginationLink
          disabled={currentPage >= totalPages}
          href={`/${locale}?${(() => {
            const copy = new URLSearchParams(params);
            copy.set("page", String(currentPage + 1));
            return copy.toString();
          })()}`}
        >
          →
        </PaginationLink>
      </div>
    </div>
  );
}

function PaginationLink({ href, disabled, children }: { href: string; disabled: boolean; children: ReactNode }) {
  if (disabled) {
    return (
      <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-300 dark:border-slate-700 dark:text-slate-600">
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
    >
      {children}
    </a>
  );
}
