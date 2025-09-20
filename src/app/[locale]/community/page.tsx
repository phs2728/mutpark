"use client";

import { useState } from "react";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { RecipeShareForm } from "@/components/community/RecipeShareForm";

interface CommunityPageProps {
  params: Promise<{ locale: string }>;
}

export default function CommunityPage({ params }: CommunityPageProps) {
  const [showShareForm, setShowShareForm] = useState(false);

  // params is available but not currently used in UI
  void params;

  const handleShareRecipe = async (data: unknown) => {
    try {
      // TODO: Implement API call to save recipe
      console.log("Recipe data:", data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message or redirect
      alert("레시피가 성공적으로 공유되었습니다!");
    } catch (error) {
      console.error("Error sharing recipe:", error);
      alert("레시피 공유 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              커뮤니티
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              터키에서 한국 요리를 즐기는 사람들과 소통해보세요
            </p>
          </div>
          <button
            onClick={() => setShowShareForm(true)}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            레시피 공유하기
          </button>
        </div>
      </div>

      {/* Community Feed */}
      <CommunityFeed />

      {/* Recipe Share Form Modal */}
      {showShareForm && (
        <RecipeShareForm
          onClose={() => setShowShareForm(false)}
          onSubmit={handleShareRecipe}
        />
      )}
    </div>
  );
}
