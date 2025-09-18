import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocalizedProduct } from "@/lib/i18n-utils";
import { ProductDetail } from "@/components/products/ProductDetail";

export default async function ProductDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      translations: true,
    },
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      NOT: { id: product.id },
    },
    take: 4,
    include: {
      translations: true,
    },
  });

  const localizedProduct = getLocalizedProduct(product, params.locale);
  const localizedRelated = relatedProducts.map((related) => getLocalizedProduct(related, params.locale));

  return (
    <ProductDetail
      locale={params.locale}
      product={localizedProduct}
      related={localizedRelated.map((item) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        price: item.price,
        currency: item.currency,
      }))}
    />
  );
}
