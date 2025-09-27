"use client";

import Link from "next/link";
import { LazyImage } from "@/components/ui/LazyImage";
import { useI18n } from "@/providers/I18nProvider";
import { useProductComparison } from "@/hooks/useProductComparison";
import { formatCurrency } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/imagekit";

interface ProductComparisonProps {
  locale: string;
}

export function ProductComparison({ locale }: ProductComparisonProps) {
  const { t } = useI18n();
  const { compareList, removeProduct, clearAll } = useProductComparison();

  if (compareList.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t("compare.empty", "No products to compare")}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t("compare.emptyDescription", "Add products to comparison to see them here.")}
          </p>
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            {t("compare.browseProducts", "Browse Products")}
          </Link>
        </div>
      </div>
    );
  }

  const features = [
    { key: "price", label: t("products.price", "Price") },
    { key: "brand", label: t("productDetail.brand", "Brand") },
    { key: "category", label: t("productDetail.category", "Category") },
    { key: "halal", label: t("products.halal", "Halal") },
    { key: "spiceLevel", label: t("products.spiceLevel", "Spice Level") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("compare.title", "Product Comparison")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t("compare.subtitle", "Compare up to {max} products", { max: 3 })}
          </p>
        </div>
        <button
          onClick={clearAll}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          {t("compare.clearAll", "Clear All")}
        </button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="w-40 p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("compare.features", "Features")}
              </th>
              {compareList.map((product) => (
                <th key={product.id} className="min-w-64 p-4">
                  <div className="space-y-4">
                    {/* Product Image */}
                    <div className="relative aspect-square w-32 mx-auto rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {product.imageUrl ? (
                        <LazyImage
                          src={resolveImageUrl(product.imageUrl, { width: 200, quality: 80 })}
                          alt={product.name}
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <div className="text-center">
                      <Link
                        href={`/${locale}/products/${product.slug}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-emerald-600 transition-colors line-clamp-2"
                      >
                        {product.name}
                      </Link>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="w-full px-3 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      {t("compare.remove", "Remove")}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr
                key={feature.key}
                className={`border-b border-gray-200 dark:border-gray-700 ${
                  index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/50" : ""
                }`}
              >
                <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {feature.label}
                </td>
                {compareList.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {feature.key === "price" && (
                        <span className="font-medium text-emerald-600">
                          {formatCurrency(product.price, product.currency)}
                        </span>
                      )}
                      {feature.key === "brand" && (
                        <span>{(product as any).brand || "-"}</span>
                      )}
                      {feature.key === "category" && (
                        <span>{(product as any).category || "-"}</span>
                      )}
                      {feature.key === "halal" && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          (product as any).halalCertified
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {(product as any).halalCertified ? "✓" : "✗"}
                        </span>
                      )}
                      {feature.key === "spiceLevel" && (
                        <span>
                          {(product as any).spiceLevel
                            ? "🌶️".repeat((product as any).spiceLevel)
                            : "-"
                          }
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        {compareList.map((product) => (
          <Link
            key={product.id}
            href={`/${locale}/products/${product.slug}`}
            className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            {t("compare.viewProduct", "View {name}", { name: product.name.split(" ")[0] })}
          </Link>
        ))}
      </div>
    </div>
  );
}