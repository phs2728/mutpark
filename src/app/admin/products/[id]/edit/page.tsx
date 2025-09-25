"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Package,
  Upload,
  X,
  Plus,
  Save,
  ArrowLeft,
} from "lucide-react";

interface ProductTranslation {
  language: string;
  name: string;
  description: string;
}

interface ProductFormData {
  sku: string;
  baseName: string;
  baseDescription: string;
  price: number;
  currency: string;
  stock: number;
  halalCertified: boolean;
  spiceLevel: number | null;
  weightGrams: number | null;
  imageUrl: string;
  brand: string;
  category: string;
  expiryDate: string;
  translations: ProductTranslation[];
}

const CATEGORIES = [
  { value: "Sauce", label: "소스/양념" },
  { value: "SideDish", label: "반찬" },
  { value: "InstantFood", label: "인스턴트 식품" },
  { value: "Grain", label: "곡물" },
  { value: "Snack", label: "과자" },
  { value: "Beverage", label: "음료" },
  { value: "Frozen", label: "냉동식품" },
  { value: "Fresh", label: "신선식품" },
];

const LANGUAGES = [
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

export default function EditProduct() {
  const { permissions } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState<ProductFormData>({
    sku: "",
    baseName: "",
    baseDescription: "",
    price: 0,
    currency: "TRY",
    stock: 0,
    halalCertified: false,
    spiceLevel: null,
    weightGrams: null,
    imageUrl: "",
    brand: "",
    category: "",
    expiryDate: "",
    translations: [
      { language: "ko", name: "", description: "" },
      { language: "tr", name: "", description: "" },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 기존 상품 데이터 로드
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoadingProduct(true);

        // 모의 상품 데이터 (실제로는 API에서 가져와야 함)
        const mockProductData = {
          id: parseInt(productId),
          sku: "KFOOD-GOCHUJANG-500G",
          baseName: "고추장 500g",
          baseDescription: "칼칼한 매운맛이 매력적인 전통 고추장입니다.",
          price: 189.9,
          currency: "TRY",
          stock: 120,
          halalCertified: true,
          spiceLevel: 3,
          weightGrams: 500,
          imageUrl: "https://images.unsplash.com/photo-1589308078055-079332f0c816?auto=format&fit=crop&w=800&q=80",
          brand: "CJ",
          category: "Sauce",
          expiryDate: "2025-12-31",
          translations: [
            { language: "ko", name: "고추장 500g", description: "칼칼한 매운맛이 매력적인 전통 고추장입니다." },
            { language: "tr", name: "Gochujang 500g", description: "Farklı yemeklerde kullanılabilen geleneksel Kore biber ezmesi." },
          ],
        };

        // 실제 API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));

        setFormData(mockProductData);
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoadingProduct(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  if (!permissions?.canManageProducts) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">상품 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleTranslationChange = (index: number, field: keyof ProductTranslation, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: prev.translations.map((translation, i) =>
        i === index ? { ...translation, [field]: value } : translation
      ),
    }));
  };

  const addTranslation = () => {
    const availableLanguages = LANGUAGES.filter(
      lang => !formData.translations.some(t => t.language === lang.code)
    );

    if (availableLanguages.length > 0) {
      setFormData(prev => ({
        ...prev,
        translations: [
          ...prev.translations,
          { language: availableLanguages[0].code, name: "", description: "" },
        ],
      }));
    }
  };

  const removeTranslation = (index: number) => {
    if (formData.translations.length > 1) {
      setFormData(prev => ({
        ...prev,
        translations: prev.translations.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sku.trim()) newErrors.sku = "SKU는 필수입니다";
    if (!formData.baseName.trim()) newErrors.baseName = "상품명은 필수입니다";
    if (!formData.brand.trim()) newErrors.brand = "브랜드는 필수입니다";
    if (!formData.category) newErrors.category = "카테고리는 필수입니다";
    if (formData.price <= 0) newErrors.price = "가격은 0보다 커야 합니다";
    if (formData.stock < 0) newErrors.stock = "재고는 0 이상이어야 합니다";

    // 번역 검증
    formData.translations.forEach((translation, index) => {
      if (!translation.name.trim()) {
        newErrors[`translation_${index}_name`] = "번역된 상품명은 필수입니다";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 실제 API 호출

      // 모의 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000));

      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.flag || "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">상품 편집</h1>
            <p className="mt-1 text-gray-600">상품 정보를 수정합니다. (상품 ID: {productId})</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "basic"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              기본 정보
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("translations")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "translations"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              번역 정보
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "details"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              상세 정보
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.sku ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="KFOOD-PRODUCT-001"
                  />
                  {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품명 *
                  </label>
                  <input
                    type="text"
                    value={formData.baseName}
                    onChange={(e) => handleInputChange("baseName", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.baseName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="상품명을 입력하세요"
                  />
                  {errors.baseName && <p className="text-red-500 text-sm mt-1">{errors.baseName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    브랜드 *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.brand ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="브랜드명을 입력하세요"
                  />
                  {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.category ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">카테고리를 선택하세요</option>
                    {CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격 *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 pr-12 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors.price ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <span className="text-gray-500 text-sm">TRY</span>
                    </div>
                  </div>
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    재고 수량 *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.stock ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품 설명
                </label>
                <textarea
                  rows={4}
                  value={formData.baseDescription}
                  onChange={(e) => handleInputChange("baseDescription", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="상품에 대한 상세 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품 이미지 URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="상품 미리보기"
                      className="w-32 h-32 object-cover rounded-md border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "translations" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">다국어 번역</h3>
                <button
                  type="button"
                  onClick={addTranslation}
                  disabled={formData.translations.length >= LANGUAGES.length}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  번역 추가
                </button>
              </div>

              <div className="space-y-6">
                {formData.translations.map((translation, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getLanguageFlag(translation.language)}</span>
                        <h4 className="text-md font-medium text-gray-900">
                          {getLanguageName(translation.language)}
                        </h4>
                      </div>
                      {formData.translations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTranslation(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          번역된 상품명 *
                        </label>
                        <input
                          type="text"
                          value={translation.name}
                          onChange={(e) => handleTranslationChange(index, "name", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`translation_${index}_name`] ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder="번역된 상품명을 입력하세요"
                        />
                        {errors[`translation_${index}_name`] && (
                          <p className="text-red-500 text-sm mt-1">{errors[`translation_${index}_name`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          번역된 설명
                        </label>
                        <textarea
                          rows={3}
                          value={translation.description}
                          onChange={(e) => handleTranslationChange(index, "description", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="번역된 상품 설명을 입력하세요"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    중량 (그램)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.weightGrams || ""}
                    onChange={(e) => handleInputChange("weightGrams", e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    매운맛 정도 (1-5)
                  </label>
                  <select
                    value={formData.spiceLevel || ""}
                    onChange={(e) => handleInputChange("spiceLevel", e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">매운맛 없음</option>
                    <option value="1">1 - 순한맛</option>
                    <option value="2">2 - 약간 매움</option>
                    <option value="3">3 - 보통 매움</option>
                    <option value="4">4 - 매움</option>
                    <option value="5">5 - 매우 매움</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    유통기한
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="halalCertified"
                    checked={formData.halalCertified}
                    onChange={(e) => handleInputChange("halalCertified", e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="halalCertified" className="ml-2 text-sm font-medium text-gray-700">
                    할랄 인증 상품
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                변경사항 저장
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}