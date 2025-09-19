import { Product, ProductTranslation } from "@prisma/client";
import { computeProductPricing } from "@/lib/product-pricing";

type ProductWithTranslations = Product & { translations: ProductTranslation[] };

export function getLocalizedProduct(product: ProductWithTranslations, locale: string) {
  const translation = product.translations.find((t) => t.language === locale);
  const pricing = computeProductPricing(product);

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: translation?.name ?? product.baseName,
    description: translation?.description ?? product.baseDescription,
    price: pricing.price,
    priceOriginal: pricing.priceOriginal,
    currency: product.currency,
    imageUrl: product.imageUrl,
    halalCertified: product.halalCertified,
    spiceLevel: product.spiceLevel,
    stock: product.stock,
    brand: product.brand,
    category: product.category,
    freshnessStatus: product.freshnessStatus,
    expiryDate: pricing.expiryDate,
    isExpired: pricing.isExpired,
    expiresSoon: pricing.expiresSoon,
    isLowStock: pricing.isLowStock,
    discountPercentage: pricing.discountPercentage,
    discountReason: pricing.discountReason,
    metadata: product.metadata as Record<string, unknown> | null,
  };
}
