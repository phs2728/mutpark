'use client';

import { useState } from 'react';
import { X, Lightbulb, Tag, Image, Heart } from 'lucide-react';

interface TipFormData {
  title: string;
  content: string;
  imageUrl?: string;
  images: string[];
  tags: string[];
  [key: string]: unknown;
}

interface TipFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TipFormData) => Promise<void>;
}

const tipCategories = [
  { id: 'cooking', name: '요리팁', emoji: '🍳' },
  { id: 'shopping', name: '쇼핑팁', emoji: '🛒' },
  { id: 'culture', name: '문화팁', emoji: '🎎' },
  { id: 'language', name: '언어팁', emoji: '💬' },
  { id: 'life', name: '생활팁', emoji: '🏠' },
  { id: 'travel', name: '여행팁', emoji: '✈️' }
];

export default function TipForm({ isOpen, onClose, onSubmit }: TipFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TipFormData>({
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
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting tip:', error);
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
            <div className="p-3 bg-green-100 rounded-xl">
              <Lightbulb className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">꿀팁 공유하기</h2>
              <p className="text-gray-600 mt-1">유용한 정보를 나눠주세요</p>
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
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              카테고리 선택 (선택사항)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {tipCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => addCategoryTag(category.name)}
                  disabled={formData.tags.includes(category.name)}
                  className={`
                    p-3 rounded-lg border text-sm font-medium transition-colors
                    ${formData.tags.includes(category.name)
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-200'
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
              꿀팁 제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="예: 터키에서 김치 맛있게 담그는 비법"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              꿀팁 내용 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="구체적이고 실용적인 팁을 알려주세요. 단계별로 설명하거나 주의사항을 포함하면 더욱 도움이 됩니다."
              rows={8}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              최소 30자 이상 작성해주세요 ({formData.content.length}/30)
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
                팁을 더 잘 보여줄 수 있는 사진을 첨부해주세요
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
                placeholder="관련 태그 입력"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 팁 */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">좋은 꿀팁 작성하기</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• 실제로 경험해본 내용을 공유해주세요</li>
                  <li>• 구체적인 방법이나 단계를 포함해주세요</li>
                  <li>• 주의사항이나 실패 경험도 도움이 됩니다</li>
                  <li>• 사진이나 참고 자료가 있다면 더욱 좋아요</li>
                </ul>
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
            disabled={isSubmitting || !formData.title || formData.content.length < 30}
            className="px-8 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? '공유 중...' : '💡 꿀팁 공유하기'}
          </button>
        </div>
      </div>
    </div>
  );
}