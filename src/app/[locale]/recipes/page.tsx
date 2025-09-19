import { Suspense } from "react";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { RecipeBoard } from "@/components/recipes/RecipeBoard";

export default async function RecipesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale: paramLocale } = await params;
  const locale = isLocale(paramLocale) ? paramLocale : defaultLocale;
  const dictionary = await getDictionary(locale as Locale);
  const resolvedSearchParams = await searchParams;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {dictionary.recipes.title}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {dictionary.recipes.subtitle}
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-200 rounded-xl h-48 dark:bg-slate-700"></div>
              <div className="mt-4 space-y-2">
                <div className="bg-slate-200 rounded h-4 dark:bg-slate-700"></div>
                <div className="bg-slate-200 rounded h-4 w-3/4 dark:bg-slate-700"></div>
              </div>
            </div>
          ))}
        </div>
      }>
        <RecipeBoard locale={locale} searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
