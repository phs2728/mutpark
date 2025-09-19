import { notFound } from "next/navigation";
import { Suspense } from "react";
import { defaultLocale, isLocale } from "@/i18n/config";
// import { getDictionary } from "@/i18n/get-dictionary";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";

interface RecipePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { locale: paramLocale, slug } = await params;
  const locale = isLocale(paramLocale) ? paramLocale : defaultLocale;
  // const dictionary = await getDictionary(locale as Locale);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/recipes/${slug}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      notFound();
    }

    const recipe = await response.json();

    return (
      <div className="space-y-8">
        <Suspense fallback={
          <div className="animate-pulse space-y-6">
            <div className="bg-slate-200 rounded-xl h-64 dark:bg-slate-700"></div>
            <div className="space-y-4">
              <div className="bg-slate-200 rounded h-8 w-1/2 dark:bg-slate-700"></div>
              <div className="bg-slate-200 rounded h-4 dark:bg-slate-700"></div>
              <div className="bg-slate-200 rounded h-4 w-3/4 dark:bg-slate-700"></div>
            </div>
          </div>
        }>
          <RecipeDetail recipe={recipe} locale={locale} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error fetching recipe:", error);
    notFound();
  }
}

export async function generateMetadata({ params }: RecipePageProps) {
  const { slug } = await params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/recipes/${slug}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return {
        title: "Recipe Not Found",
      };
    }

    const recipe = await response.json();

    return {
      title: `${recipe.title} | MutPark Recipes`,
      description: recipe.content ?
        (typeof recipe.content === 'string' ? recipe.content.slice(0, 160) : 'Delicious Korean recipe')
        : 'Delicious Korean recipe from MutPark',
      openGraph: {
        title: recipe.title,
        description: recipe.content ?
          (typeof recipe.content === 'string' ? recipe.content.slice(0, 160) : 'Delicious Korean recipe')
          : 'Delicious Korean recipe from MutPark',
        images: recipe.mainImageUrl ? [recipe.mainImageUrl] : [],
      },
    };
  } catch {
    return {
      title: "Recipe Not Found",
    };
  }
}