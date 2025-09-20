'use client';

import { useState } from 'react';
import { X, Star, Package, MapPin, Calendar, Tv, Image, Tag } from 'lucide-react';

interface ReviewFormData {
  title: string;
  content: string;
  rating: number;
  reviewType: 'PRODUCT' | 'PLACE' | 'EVENT' | 'MEDIA';
  productId?: number;
  imageUrl?: string;
  images: string[];
  tags: string[];
  [key: string]: unknown;
}

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => Promise<void>;
}

const reviewTypes = [
  {
    type: 'PRODUCT' as const,
    title: '상품 리뷰',
    description: '한국 식품이나 조리도구에 대한 후기',
    icon: Package,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    type: 'PLACE' as const,
    title: '장소 리뷰',
    description: '한국 레스토랑이나 마트 방문 후기',
    icon: MapPin,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    type: 'EVENT' as const,
    title: '이벤트 리뷰',
    description: '한국 문화 행사나 축제 참여 후기',
    icon: Calendar,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    type: 'MEDIA' as const,
    title: '미디어 리뷰',
    description: '한국 드라마, 요리 프로그램 등',
    icon: Tv,
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    iconColor: 'text-orange-600'
  }
];

export default function ReviewForm({ isOpen, onClose, onSubmit }: ReviewFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState<ReviewFormData>({
    title: '',
    content: '',
    rating: 0,
    reviewType: 'PRODUCT',
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
      console.error('Error submitting review:', error);
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

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const selectedReviewType = reviewTypes.find(type => type.type === formData.reviewType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">리뷰 작성하기</h2>
            <p className="text-gray-600 mt-1">경험을 다른 사람들과 공유해보세요</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 1 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-yellow-500' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 2 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`flex-1 h-1 ${currentStep >= 3 ? 'bg-yellow-500' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 3 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>리뷰 유형</span>
            <span>평점 & 내용</span>
            <span>완성</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Step 1: 리뷰 유형 선택 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">리뷰 유형을 선택해주세요</h3>

              <div className="grid gap-4">
                {reviewTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.reviewType === type.type;

                  return (
                    <button
                      key={type.type}
                      onClick={() => setFormData(prev => ({ ...prev, reviewType: type.type }))}
                      className={`
                        relative p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${type.color}
                        ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
                        group
                      `}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`
                          p-3 rounded-xl bg-white shadow-sm
                          ${type.iconColor}
                        `}>
                          <Icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {type.title}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {type.description}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Star className="w-4 h-4 text-white fill-current" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: 평점 및 내용 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* 평점 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  평점을 매겨주세요 *
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || formData.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.rating > 0 && (
                      <>
                        {formData.rating}점 / 5점
                        {formData.rating === 5 && ' 🌟'}
                        {formData.rating === 4 && ' 😊'}
                        {formData.rating === 3 && ' 😐'}
                        {formData.rating === 2 && ' 😕'}
                        {formData.rating === 1 && ' 😞'}
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  리뷰 제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={`${selectedReviewType?.title}의 제목을 입력해주세요`}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 리뷰 *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="구체적인 경험과 느낀 점을 자세히 알려주세요. 다른 사람들에게 도움이 되는 정보를 포함해주세요."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  최소 50자 이상 작성해주세요 ({formData.content.length}/50)
                </p>
              </div>

              {/* 이미지 업로드 (선택사항) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Image className="w-4 h-4 inline mr-1" aria-label="Upload image icon" />
                  사진 첨부 (선택사항)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
    <div className="w-12 h-12 text-gray-400 mx-auto mb-2 flex items-center justify-center">
                📷
              </div>
<p className="text-gray-600 text-sm">
                    사진을 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    JPG, PNG 파일만 가능 (최대 5MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 태그 및 완성 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* 태그 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  태그 추가
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="관련 태그를 입력하세요"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-yellow-600 hover:text-yellow-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 리뷰 요약 */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                <h4 className="font-semibold text-gray-900 mb-3">리뷰 요약</h4>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {selectedReviewType && (
                      <>
                        <selectedReviewType.icon className={`w-5 h-5 ${selectedReviewType.iconColor}`} />
                        <span className="font-medium">{selectedReviewType.title}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= formData.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      {formData.rating}점
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">제목:</span> {formData.title || '미입력'}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">내용:</span> {formData.content.length}자 작성됨
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">태그:</span> {formData.tags.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* 주의사항 */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h5 className="font-medium text-blue-900 mb-1">리뷰 작성 팁</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 구체적이고 솔직한 경험을 공유해주세요</li>
                      <li>• 다른 사람들에게 도움이 되는 정보를 포함해주세요</li>
                      <li>• 정중하고 건설적인 피드백을 남겨주세요</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <div>
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                이전
              </button>
            )}
          </div>

          <div>
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={
                  (currentStep === 2 && (!formData.rating || !formData.title || formData.content.length < 50))
                }
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.rating || !formData.title || formData.content.length < 50}
                className="px-8 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '리뷰 작성 중...' : '⭐ 리뷰 게시하기'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}