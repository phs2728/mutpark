import { redirect } from "next/navigation";
import { ReviewHistory } from "@/components/account/ReviewHistory";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { defaultLocale, isLocale } from "@/i18n/config";

export default async function ReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: paramLocale } = await params;
  const locale = isLocale(paramLocale) ? paramLocale : defaultLocale;
  const auth = await getAuthenticatedUser();

  if (!auth) {
    redirect(`/${locale}/auth/login`);
  }

  // Fetch user reviews
  const reviews = await prisma.productReview.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          translations: true
        }
      },
      helpful: true
    }
  });

  const transformedReviews = reviews.map(review => ({
    id: review.id,
    rating: review.rating,
    comment: review.content,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    helpful: review.helpful.length,
    product: {
      id: review.product.id,
      name: review.product.translations.find((t: any) => t.language === locale)?.name || review.product.baseName,
      slug: review.product.slug,
      imageUrl: review.product.imageUrl || undefined,
      price: Number(review.product.price)
    },
    reviewImages: review.imageUrls ? JSON.parse(review.imageUrls as string) : [],
    isVerifiedPurchase: review.verifiedPurchase,
    status: review.status as "PENDING" | "APPROVED" | "REJECTED"
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <ReviewHistory
        locale={locale}
        initialReviews={transformedReviews}
      />
    </div>
  );
}