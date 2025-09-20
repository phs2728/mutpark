"use client";

import { useState } from "react";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import PostTypeSelector from "@/components/community/forms/PostTypeSelector";
import RecipeForm from "@/components/community/forms/RecipeForm";
import ReviewForm from "@/components/community/forms/ReviewForm";
import TipForm from "@/components/community/forms/TipForm";
import QuestionForm from "@/components/community/forms/QuestionForm";

// Union type for all form data types
type CommunityFormData = {
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
  [key: string]: unknown;
};

interface CommunityPageProps {
  params: Promise<{ locale: string }>;
}

export default function CommunityPage({ params }: CommunityPageProps) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [currentForm, setCurrentForm] = useState<'RECIPE' | 'REVIEW' | 'TIP' | 'QUESTION' | null>(null);

  // params is available but not currently used in UI
  void params;

  const handleTypeSelect = (type: 'RECIPE' | 'REVIEW' | 'TIP' | 'QUESTION') => {
    setShowTypeSelector(false);
    setCurrentForm(type);
  };

  const handleCloseForm = () => {
    setCurrentForm(null);
  };

  const handleSubmitPost = async (data: CommunityFormData) => {
    try {
      // 임시로 사용자 ID 1을 사용 (실제로는 세션에서 가져와야 함)
      const postData = {
        ...data,
        authorId: 1,
        type: currentForm
      };

      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Post created:', result);

        // 성공 메시지
        const typeNames = {
          RECIPE: '레시피',
          REVIEW: '리뷰',
          TIP: '꿀팁',
          QUESTION: '질문'
        };

        alert(`${typeNames[currentForm!]}가 성공적으로 공유되었습니다! 🎉`);

        // 폼 닫기
        setCurrentForm(null);

        // 피드 새로고침 (필요시)
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Error creating post:', error);
        alert('게시물 작성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('게시물 작성 중 오류가 발생했습니다.');
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
            onClick={() => setShowTypeSelector(true)}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-blue-500 text-white rounded-lg hover:from-red-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ✍️ 글쓰기
          </button>
        </div>
      </div>

      {/* Community Feed */}
      <CommunityFeed />

      {/* Post Type Selector Modal */}
      <PostTypeSelector
        isOpen={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        onSelect={handleTypeSelect}
      />

      {/* Form Modals */}
      {currentForm === 'RECIPE' && (
        <RecipeForm
          isOpen={true}
          onClose={handleCloseForm}
          onSubmit={handleSubmitPost}
        />
      )}

      {currentForm === 'REVIEW' && (
        <ReviewForm
          isOpen={true}
          onClose={handleCloseForm}
          onSubmit={handleSubmitPost}
        />
      )}

      {currentForm === 'TIP' && (
        <TipForm
          isOpen={true}
          onClose={handleCloseForm}
          onSubmit={handleSubmitPost}
        />
      )}

      {currentForm === 'QUESTION' && (
        <QuestionForm
          isOpen={true}
          onClose={handleCloseForm}
          onSubmit={handleSubmitPost}
        />
      )}
    </div>
  );
}
