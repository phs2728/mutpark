"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Users,
  ChefHat,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
} from "lucide-react";

interface Recipe {
  id: number;
  title: string;
  description?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  cookingTime: number;
  servings: number;
  mainImageUrl?: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit?: string;
    isEssential: boolean;
  }>;
  steps: Array<{
    stepNumber: number;
    title?: string;
    description: string;
    imageUrl?: string;
    duration?: number;
    tips?: string;
  }>;
}

interface MobileRecipeViewerProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function MobileRecipeViewer({ recipe, onClose }: MobileRecipeViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [viewMode, setViewMode] = useState<"ingredients" | "cooking">("ingredients");

  // 타이머 관리
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            // 타이머 완료 알림
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  // 음성 읽기 기능
  const speakText = (text: string) => {
    if (speechEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startStepTimer = (duration: number) => {
    setTimer(duration * 60); // 분을 초로 변환
    setIsTimerRunning(true);
  };

  const toggleStepCompletion = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY": return "text-green-600";
      case "MEDIUM": return "text-yellow-600";
      case "HARD": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const currentStepData = recipe.steps[currentStep];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
          {recipe.title}
        </h1>
        <button
          onClick={() => setSpeechEnabled(!speechEnabled)}
          className={`p-2 rounded-full ${speechEnabled ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
        >
          {speechEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
        </button>
      </div>

      {/* 모드 선택 탭 */}
      <div className="bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setViewMode("ingredients")}
          className={`flex-1 py-3 px-4 text-center font-medium ${
            viewMode === "ingredients"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
        >
          재료 준비
        </button>
        <button
          onClick={() => setViewMode("cooking")}
          className={`flex-1 py-3 px-4 text-center font-medium ${
            viewMode === "cooking"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
        >
          요리 과정
        </button>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === "ingredients" ? (
          <div className="p-4">
            {/* 레시피 기본 정보 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {recipe.cookingTime}분
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {recipe.servings}인분
                  </div>
                  <div className={`flex items-center ${getDifficultyColor(recipe.difficulty)}`}>
                    <ChefHat className="h-4 w-4 mr-1" />
                    {recipe.difficulty === "EASY" ? "쉬움" :
                     recipe.difficulty === "MEDIUM" ? "보통" : "어려움"}
                  </div>
                </div>
              </div>
              {recipe.description && (
                <p className="text-gray-700 text-sm">{recipe.description}</p>
              )}
            </div>

            {/* 재료 목록 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">준비 재료</h3>
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center flex-1">
                      <span className="font-medium text-gray-900">
                        {ingredient.name}
                      </span>
                      {!ingredient.isEssential && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          선택
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600 font-medium">
                      {ingredient.quantity} {ingredient.unit || ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 요리 시작 버튼 */}
            <div className="mt-8 pb-4">
              <button
                onClick={() => {
                  setViewMode("cooking");
                  if (speechEnabled) {
                    speakText(`요리를 시작합니다. ${recipe.steps[0].description}`);
                  }
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                요리 시작하기
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* 타이머 영역 */}
            {timer > 0 && (
              <div className="bg-orange-50 border-b border-orange-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="font-semibold text-orange-800">
                      타이머: {formatTime(timer)}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700"
                    >
                      {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setTimer(0);
                        setIsTimerRunning(false);
                      }}
                      className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 현재 단계 */}
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  단계 {currentStep + 1} / {recipe.steps.length}
                </h3>
                <button
                  onClick={() => toggleStepCompletion(currentStep)}
                  className="flex items-center space-x-2"
                >
                  {completedSteps.has(currentStep) ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">완료</span>
                </button>
              </div>

              {currentStepData && (
                <div>
                  {currentStepData.title && (
                    <h4 className="text-xl font-semibold mb-3 text-gray-900">
                      {currentStepData.title}
                    </h4>
                  )}

                  {currentStepData.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={currentStepData.imageUrl}
                        alt={`단계 ${currentStep + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-800 leading-relaxed text-lg">
                      {currentStepData.description}
                    </p>
                  </div>

                  {currentStepData.duration && (
                    <div className="mb-4">
                      <button
                        onClick={() => startStepTimer(currentStepData.duration!)}
                        className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-medium hover:bg-orange-200 transition-colors"
                      >
                        <Clock className="h-4 w-4 inline mr-2" />
                        {currentStepData.duration}분 타이머 시작
                      </button>
                    </div>
                  )}

                  {currentStepData.tips && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <h5 className="font-medium text-blue-800 mb-2">💡 요리 팁</h5>
                      <p className="text-blue-700">{currentStepData.tips}</p>
                    </div>
                  )}

                  {speechEnabled && (
                    <button
                      onClick={() => speakText(currentStepData.description)}
                      className="mt-4 w-full bg-blue-100 text-blue-800 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                    >
                      <Volume2 className="h-4 w-4 inline mr-2" />
                      음성으로 듣기
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 네비게이션 버튼 */}
            <div className="bg-white border-t border-gray-200 p-4 flex space-x-4">
              <button
                onClick={() => {
                  if (currentStep > 0) {
                    setCurrentStep(currentStep - 1);
                    if (speechEnabled) {
                      speakText(recipe.steps[currentStep - 1].description);
                    }
                  }
                }}
                disabled={currentStep === 0}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 inline mr-2" />
                이전 단계
              </button>
              <button
                onClick={() => {
                  if (currentStep < recipe.steps.length - 1) {
                    setCurrentStep(currentStep + 1);
                    if (speechEnabled) {
                      speakText(recipe.steps[currentStep + 1].description);
                    }
                  }
                }}
                disabled={currentStep === recipe.steps.length - 1}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                다음 단계
                <ArrowRight className="h-4 w-4 inline ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 진행률 표시 */}
      {viewMode === "cooking" && (
        <div className="bg-white border-t border-gray-200 p-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>진행률</span>
            <span>{Math.round(((currentStep + 1) / recipe.steps.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / recipe.steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}