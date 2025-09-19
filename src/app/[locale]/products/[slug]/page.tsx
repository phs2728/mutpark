import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocalizedProduct } from "@/lib/i18n-utils";
import { getAuthenticatedUser } from "@/lib/session";
import { ProductDetail } from "@/components/products/ProductDetail";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      translations: true,
    },
  });

  if (!product) {
    notFound();
  }

  const auth = await getAuthenticatedUser();

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

  const localizedProduct = getLocalizedProduct(product, locale);
  const localizedRelated = relatedProducts.map((related) => getLocalizedProduct(related, locale));

  return (
    <ProductDetail
      locale={locale}
      product={localizedProduct}
      related={localizedRelated.map((item) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        price: item.price,
        currency: item.currency,
      }))}
      currentUserId={auth?.userId}
    />
  );
}
