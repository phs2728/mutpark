"use client";

import { useState } from "react";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import PostTypeSelector from "@/components/community/forms/PostTypeSelector";
import RecipeForm from "@/components/community/forms/RecipeForm";
import ReviewForm from "@/components/community/forms/ReviewForm";
import TipForm from "@/components/community/forms/TipForm";
import QuestionForm from "@/components/community/forms/QuestionForm";
import SeasonalEvents from "@/components/community/SeasonalEvents";
import BadgeSystem from "@/components/community/BadgeSystem";
import PopularContent from "@/components/community/PopularContent";

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
  const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'badges' | 'popular'>('feed');

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Korean Traditional Theme */}
      <div className="korean-gradient-sunset rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 korean-wave">
              🏮 한국인 커뮤니티
            </h1>
            <p className="text-white/90">
              터키에서 한국 요리와 문화를 함께 나누는 따뜻한 공간
            </p>
          </div>
          <button
            onClick={() => setShowTypeSelector(true)}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/30"
          >
            ✍️ 글쓰기
          </button>
        </div>
      </div>

      {/* Navigation Tabs with Korean Traditional Colors */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2">
        <div className="flex space-x-2">
          {[
            { key: 'feed', label: '🍽️ 커뮤니티 피드', desc: '레시피와 꿀팁 공유' },
            { key: 'popular', label: '🔥 인기 콘텐츠', desc: '트렌딩 게시물과 인기 태그' },
            { key: 'events', label: '🎉 계절 이벤트', desc: '전통 명절과 특별 이벤트' },
            { key: 'badges', label: '🏆 배지 시스템', desc: '활동 배지와 성취' }
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 p-4 rounded-xl transition-all duration-200 text-left ${
                activeTab === key
                  ? 'korean-traditional text-white shadow-lg transform scale-105'
                  : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="font-semibold">{label}</div>
              <div className={`text-sm ${activeTab === key ? 'text-white/80' : 'text-gray-500'}`}>
                {desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'feed' && (
          <div className="community-spring rounded-2xl p-6">
            <CommunityFeed />
          </div>
        )}

        {activeTab === 'popular' && (
          <div className="community-summer rounded-2xl p-6">
            <PopularContent />
          </div>
        )}

        {activeTab === 'events' && (
          <div className="community-autumn rounded-2xl p-6">
            <SeasonalEvents />
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="community-winter rounded-2xl p-6">
            <BadgeSystem userId={1} />
          </div>
        )}
      </div>

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
