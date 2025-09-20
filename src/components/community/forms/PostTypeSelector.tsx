'use client';

import { useState } from 'react';
import { X, ChefHat, Star, Lightbulb, HelpCircle } from 'lucide-react';

interface PostTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'RECIPE' | 'REVIEW' | 'TIP' | 'QUESTION') => void;
}

const postTypes = [
  {
    type: 'RECIPE' as const,
    title: '레시피 공유',
    description: '나만의 특별한 한국 요리 레시피를 공유해보세요',
    icon: ChefHat,
    color: 'bg-red-50 border-red-200 hover:bg-red-100',
    iconColor: 'text-red-600',
    gradient: 'from-red-50 to-orange-50'
  },
  {
    type: 'REVIEW' as const,
    title: '리뷰 작성',
    description: '상품, 레스토랑, 또는 경험에 대한 후기를 남겨주세요',
    icon: Star,
    color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    iconColor: 'text-yellow-600',
    gradient: 'from-yellow-50 to-amber-50'
  },
  {
    type: 'TIP' as const,
    title: '꿀팁 공유',
    description: '한국 문화와 생활에 도움되는 꿀팁을 알려주세요',
    icon: Lightbulb,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    iconColor: 'text-green-600',
    gradient: 'from-green-50 to-emerald-50'
  },
  {
    type: 'QUESTION' as const,
    title: '질문하기',
    description: '궁금한 것이 있다면 언제든 물어보세요',
    icon: HelpCircle,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600',
    gradient: 'from-blue-50 to-indigo-50'
  }
];

export default function PostTypeSelector({ isOpen, onClose, onSelect }: PostTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = (type: 'RECIPE' | 'REVIEW' | 'TIP' | 'QUESTION') => {
    setSelectedType(type);
    // 짧은 애니메이션 후 선택
    setTimeout(() => {
      onSelect(type);
      setSelectedType(null);
    }, 200);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">글 종류 선택</h2>
            <p className="text-gray-600 mt-1">어떤 내용을 공유하고 싶으신가요?</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid gap-4">
            {postTypes.map((postType) => {
              const Icon = postType.icon;
              const isSelected = selectedType === postType.type;

              return (
                <button
                  key={postType.type}
                  onClick={() => handleSelect(postType.type)}
                  className={`
                    relative p-6 rounded-xl border-2 text-left transition-all duration-200
                    ${postType.color}
                    ${isSelected ? 'scale-95' : 'hover:scale-[1.02]'}
                    group
                  `}
                >
                  <div className={`
                    absolute inset-0 rounded-xl bg-gradient-to-br ${postType.gradient}
                    opacity-0 group-hover:opacity-100 transition-opacity
                  `} />

                  <div className="relative flex items-start space-x-4">
                    <div className={`
                      p-3 rounded-xl bg-white shadow-sm
                      ${postType.iconColor}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {postType.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {postType.description}
                      </p>
                    </div>

                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cultural Message */}
          <div className="mt-8 p-4 bg-gradient-to-r from-red-50 to-blue-50 rounded-xl border border-red-100">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🍳</div>
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">함께 만들어가는 한국 문화 커뮤니티</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  정중하고 따뜻한 마음으로 소통해주세요 ❤️
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}