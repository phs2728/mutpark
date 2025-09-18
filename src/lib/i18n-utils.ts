import { Prisma, Product, ProductTranslation } from "@prisma/client";

type ProductWithTranslations = Product & { translations: ProductTranslation[] };

export function getLocalizedProduct(product: ProductWithTranslations, locale: string) {
  const translation = product.translations.find((t) => t.language === locale);
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: translation?.name ?? product.baseName,
    description: translation?.description ?? product.baseDescription,
    price: product.price instanceof Prisma.Decimal ? product.price.toNumber() : Number(product.price),
    currency: product.currency,
    imageUrl: product.imageUrl,
    halalCertified: product.halalCertified,
    spiceLevel: product.spiceLevel,
    stock: product.stock,
    brand: product.brand,
    category: product.category,
  };
}
