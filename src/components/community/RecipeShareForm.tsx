"use client";

import { useState } from "react";
import Image from "next/image";

interface RecipeShareFormProps {
  onClose: () => void;
  onSubmit: (data: RecipeFormData) => void;
}

interface RecipeFormData {
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  cookingTime: number;
  servings: number;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
    isEssential: boolean;
  }>;
  instructions: string[];
  tips: string;
  tags: string[];
  mainImage?: File;
  koreanOrigin: boolean;
  turkeyAdapted: boolean;
}

const difficultyOptions = [
  { value: "EASY", label: "쉬움", color: "bg-green-100 text-green-700" },
  { value: "MEDIUM", label: "보통", color: "bg-yellow-100 text-yellow-700" },
  { value: "HARD", label: "어려움", color: "bg-red-100 text-red-700" },
];

export function RecipeShareForm({ onClose, onSubmit }: RecipeShareFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<RecipeFormData>({
    title: "",
    description: "",
    difficulty: "EASY",
    cookingTime: 30,
    servings: 2,
    ingredients: [{ name: "", quantity: "", unit: "", isEssential: true }],
    instructions: [""],
    tips: "",
    tags: [],
    koreanOrigin: false,
    turkeyAdapted: false,
  });

  const [currentTag, setCurrentTag] = useState("");

  const handleInputChange = (field: keyof RecipeFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (index: number, field: string, value: string | boolean) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", quantity: "", unit: "", isEssential: true }]
    }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }));
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, mainImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              레시피 공유하기
            </h2>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              단계 {step} / 4
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  기본 정보
                </h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    레시피 제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white"
                    placeholder="예: 터키에서 만드는 정통 김치찌개"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    레시피 설명 *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white"
                    placeholder="이 레시피에 대한 간단한 설명을 작성해주세요..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      난이도 *
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange("difficulty", e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white"
                    >
                      {difficultyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      조리시간 (분) *
                    </label>
                    <input
                      type="number"
                      value={formData.cookingTime}
                      onChange={(e) => handleInputChange("cookingTime", parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      인분 *
                    </label>
                    <input
                      type="number"
                      value={formData.servings}
                      onChange={(e) => handleInputChange("servings", parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.koreanOrigin}
                      onChange={(e) => handleInputChange("koreanOrigin", e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">한국 전통 레시피</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.turkeyAdapted}
                      onChange={(e) => handleInputChange("turkeyAdapted", e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">터키 현지화 레시피</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Ingredients */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  재료 정보
                </h3>

                <div className="space-y-4">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-900 dark:text-white"
                          placeholder="재료명"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={ingredient.quantity}
                          onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-900 dark:text-white"
                          placeholder="수량"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={ingredient.unit}
                          onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-900 dark:text-white"
                          placeholder="단위"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={ingredient.isEssential}
                            onChange={(e) => handleIngredientChange(index, "isEssential", e.target.checked)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">필수</span>
                        </label>
                        {formData.ingredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addIngredient}
                  className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  + 재료 추가
                </button>
              </div>
            )}

            {/* Step 3: Instructions */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  조리 과정
                </h3>

                <div className="space-y-4">
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={instruction}
                          onChange={(e) => handleInstructionChange(index, e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white"
                          placeholder={`${index + 1}단계 설명을 입력해주세요...`}
                          rows={3}
                          required
                        />
                      </div>
                      {formData.instructions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInstruction(index)}
                          className="flex-shrink-0 p-2 text-red-500 hover:text-red-700"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addInstruction}
                  className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  + 조리과정 추가
                </button>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    조리 팁 (선택사항)
                  </label>
                  <textarea
                    value={formData.tips}
                    onChange={(e) => handleInputChange("tips", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white"
                    placeholder="맛있게 만들기 위한 팁을 공유해주세요..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Image & Tags */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  사진 및 태그
                </h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    대표 사진
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6">
                    {previewImage ? (
                      <div className="relative">
                        <Image
                          src={previewImage}
                          alt="Recipe preview"
                          width={400}
                          height={300}
                          className="mx-auto rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            setFormData(prev => ({ ...prev, mainImage: undefined }));
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="mt-4">
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-slate-900 dark:text-white">
                              사진을 업로드하세요
                            </span>
                            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                              PNG, JPG, GIF up to 10MB
                            </span>
                          </label>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    태그
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white"
                      placeholder="태그를 입력하고 Enter를 누르세요"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-emerald-500 hover:text-emerald-700"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              이전
            </button>

            <div className="flex gap-2">
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  다음
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? "저장 중..." : "레시피 공유하기"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}