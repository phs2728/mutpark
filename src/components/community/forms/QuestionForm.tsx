'use client';

import { useState } from 'react';
import { X, HelpCircle, Tag, Image, Users, BookOpen } from 'lucide-react';

interface QuestionFormData {
  title: string;
  content: string;
  imageUrl?: string;
  images: string[];
  tags: string[];
  [key: string]: unknown;
}

interface QuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionFormData) => Promise<void>;
}

const questionCategories = [
  { id: 'cooking', name: '요리방법', emoji: '👩‍🍳' },
  { id: 'ingredients', name: '재료구입', emoji: '🛒' },
  { id: 'culture', name: '한국문화', emoji: '🏮' },
  { id: 'language', name: '한국어', emoji: '🗣️' },
  { id: 'places', name: '맛집추천', emoji: '🍽️' },
  { id: 'life', name: '생활정보', emoji: '🏘️' }
];

const urgencyLevels = [
  { id: 'low', name: '천천히', color: 'bg-gray-100 text-gray-700', emoji: '🐌' },
  { id: 'medium', name: '보통', color: 'bg-yellow-100 text-yellow-700', emoji: '⏰' },
  { id: 'high', name: '급해요', color: 'bg-red-100 text-red-700', emoji: '🚨' }
];

export default function QuestionForm({ isOpen, onClose, onSubmit }: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urgency, setUrgency] = useState('medium');
  const [formData, setFormData] = useState<QuestionFormData>({
    title: '',
    content: '',
    images: [],
    tags: []
  });

  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 긴급도를 태그로 추가
      const urgencyLevel = urgencyLevels.find(u => u.id === urgency);
      const finalData = {
        ...formData,
        tags: [...formData.tags, urgencyLevel?.name || '보통']
      };
      await onSubmit(finalData);
      onClose();
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addCategoryTag = (category: string) => {
    if (!formData.tags.includes(category)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, category]
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">질문하기</h2>
              <p className="text-gray-600 mt-1">궁금한 것이 있다면 언제든 물어보세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* 긴급도 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              답변 희망 시기
            </label>
            <div className="grid grid-cols-3 gap-3">
              {urgencyLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setUrgency(level.id)}
                  className={`
                    p-3 rounded-lg border text-sm font-medium transition-all duration-200
                    ${urgency === level.id
                      ? `${level.color} border-current ring-2 ring-blue-400 ring-offset-2`
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="text-lg mb-1">{level.emoji}</div>
                  {level.name}
                </button>
              ))}
            </div>
          </div>

          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              질문 카테고리 (선택사항)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {questionCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => addCategoryTag(category.name)}
                  disabled={formData.tags.includes(category.name)}
                  className={`
                    p-3 rounded-lg border text-sm font-medium transition-colors
                    ${formData.tags.includes(category.name)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200'
                    }
                  `}
                >
                  <div className="text-lg mb-1">{category.emoji}</div>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              질문 제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="예: 터키에서 고추장을 어디서 살 수 있나요?"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              구체적이고 명확한 제목을 작성해주세요
            </p>
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              질문 내용 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="상황을 자세히 설명해주세요. 어떤 것을 시도해봤는지, 어려운 점은 무엇인지 등을 포함하면 더 정확한 답변을 받을 수 있어요."
              rows={8}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              최소 20자 이상 작성해주세요 ({formData.content.length}/20)
            </p>
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              사진 첨부 (선택사항)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">📸</div>
              <p className="text-gray-600 text-sm">
                상황을 보여줄 수 있는 사진이 있다면 첨부해주세요
              </p>
              <p className="text-gray-400 text-xs mt-1">
                JPG, PNG 파일만 가능 (최대 5MB)
              </p>
            </div>
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              추가 태그
            </label>
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="관련 키워드 입력"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 질문 가이드 */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-start space-x-3">
              <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">좋은 질문하기 가이드</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>구체적으로:</strong> 상황과 문제점을 자세히 설명해주세요</li>
                  <li>• <strong>시도한 것:</strong> 어떤 방법을 시도해봤는지 알려주세요</li>
                  <li>• <strong>배경 정보:</strong> 지역, 예산, 선호도 등을 포함해주세요</li>
                  <li>• <strong>사진 활용:</strong> 관련 사진이 있다면 첨부해주세요</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 커뮤니티 메시지 */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-800">
                  <span className="font-medium">따뜻한 커뮤니티</span>에서 함께 해결해보아요!
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  경험이 풍부한 분들이 친절하게 답변해드릴 거예요 💝
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            * 필수 입력 항목
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title || formData.content.length < 20}
            className="px-8 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? '질문 등록 중...' : '❓ 질문하기'}
          </button>
        </div>
      </div>
    </div>
  );
}