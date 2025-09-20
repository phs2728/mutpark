'use client';

import { useState } from 'react';
import { X, Plus, Minus, Clock, Users, ChefHat, Tag } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  isEssential: boolean;
  productId?: number;
}

interface Instruction {
  id: string;
  step: number;
  description: string;
  imageUrl?: string;
  tips?: string;
}

interface RecipeFormData {
  title: string;
  content: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  cookingTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  mainImageUrl?: string;
  images: string[];
  tags: string[];
  [key: string]: unknown;
}

interface RecipeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecipeFormData) => Promise<void>;
}

export default function RecipeForm({ isOpen, onClose, onSubmit }: RecipeFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    content: '',
    difficulty: 'EASY',
    cookingTime: 30,
    servings: 4,
    ingredients: [{ id: '1', name: '', quantity: '', unit: '', isEssential: true }],
    instructions: [{ id: '1', step: 1, description: '' }],
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
      console.error('Error submitting recipe:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
      unit: '',
      isEssential: true
    };
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
  };

  const removeIngredient = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addInstruction = () => {
    const newInstruction: Instruction = {
      id: Date.now().toString(),
      step: formData.instructions.length + 1,
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, newInstruction]
    }));
  };

  const removeInstruction = (id: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter(inst => inst.id !== id)
        .map((inst, index) => ({ ...inst, step: index + 1 }))
    }));
  };

  const updateInstruction = (id: string, field: keyof Instruction, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map(inst =>
        inst.id === id ? { ...inst, [field]: value } : inst
      )
    }));
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

  const steps = [
    { number: 1, title: '기본 정보', icon: ChefHat },
    { number: 2, title: '재료', icon: Plus },
    { number: 3, title: '조리 과정', icon: Clock },
    { number: 4, title: '완성', icon: Tag }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">레시피 공유하기</h2>
            <p className="text-gray-600 mt-1">나만의 특별한 한국 요리 레시피를 공유해보세요</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    ${isActive ? 'bg-red-500 text-white' :
                      isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isActive ? 'text-red-600' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Step 1: 기본 정보 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  레시피 제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="예: 엄마표 김치찌개"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  레시피 소개
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="이 레시피의 특별한 점이나 만들게 된 계기를 알려주세요"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    난이도 *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'EASY' | 'MEDIUM' | 'HARD' }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="EASY">쉬움 😊</option>
                    <option value="MEDIUM">보통 🤔</option>
                    <option value="HARD">어려움 😅</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    조리시간 (분) *
                  </label>
                  <input
                    type="number"
                    value={formData.cookingTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, cookingTime: parseInt(e.target.value) || 0 }))}
                    min="5"
                    max="480"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    인분 *
                  </label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 0 }))}
                    min="1"
                    max="20"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 재료 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">재료 목록</h3>
                <button
                  onClick={addIngredient}
                  className="flex items-center px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  재료 추가
                </button>
              </div>

              {formData.ingredients.map((ingredient) => (
                <div key={ingredient.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="재료명"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      type="text"
                      placeholder="양"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(ingredient.id, 'quantity', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      type="text"
                      placeholder="단위"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={ingredient.isEssential}
                        onChange={(e) => updateIngredient(ingredient.id, 'isEssential', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">필수</span>
                    </label>
                  </div>
                  {formData.ingredients.length > 1 && (
                    <button
                      onClick={() => removeIngredient(ingredient.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 3: 조리 과정 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">조리 과정</h3>
                <button
                  onClick={addInstruction}
                  className="flex items-center px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  단계 추가
                </button>
              </div>

              {formData.instructions.map((instruction) => (
                <div key={instruction.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-semibold">
                      {instruction.step}
                    </div>
                    <div className="flex-1 space-y-3">
                      <textarea
                        placeholder="조리 과정을 자세히 설명해주세요"
                        value={instruction.description}
                        onChange={(e) => updateInstruction(instruction.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <input
                        type="text"
                        placeholder="팁이나 주의사항 (선택사항)"
                        value={instruction.tips || ''}
                        onChange={(e) => updateInstruction(instruction.id, 'tips', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    {formData.instructions.length > 1 && (
                      <button
                        onClick={() => removeInstruction(instruction.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: 완성 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">태그 설정</h3>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="태그 입력 (예: 매운맛, 김치, 찌개)"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 요약 */}
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                <h4 className="font-semibold text-gray-900 mb-2">레시피 요약</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">제목:</span> {formData.title || '미입력'}
                  </div>
                  <div>
                    <span className="text-gray-600">난이도:</span> {formData.difficulty}
                  </div>
                  <div>
                    <span className="text-gray-600">시간:</span> {formData.cookingTime}분
                  </div>
                  <div>
                    <span className="text-gray-600">인분:</span> {formData.servings}명분
                  </div>
                  <div>
                    <span className="text-gray-600">재료:</span> {formData.ingredients.length}개
                  </div>
                  <div>
                    <span className="text-gray-600">단계:</span> {formData.instructions.length}개
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                이전
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 1 && (!formData.title || !formData.cookingTime || !formData.servings)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.title}
                className="px-8 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '공유 중...' : '🍳 레시피 공유하기'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}