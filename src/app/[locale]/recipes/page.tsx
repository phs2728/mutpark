import { Metadata } from "next";

export const metadata: Metadata = {
  title: "레시피 | MutPark",
  description: "터키에서 만드는 한국 요리 레시피",
};

export default function RecipesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            한국 요리 레시피
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            터키에서 만드는 정통 한국 요리 레시피를 공유해요
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            레시피 기능 준비 중
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            커뮤니티에서 공유되는 레시피들을 더 체계적으로 관리할 수 있는
            레시피 기능을 준비하고 있어요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/ko/community"
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
            >
              커뮤니티에서 레시피 보기
            </a>
            <a
              href="/ko"
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              홈으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
