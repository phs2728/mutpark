"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Globe,
  FileText,
  Shield,
  Info,
  Layout,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";

interface PageFormData {
  title: string;
  slug: string;
  type: 'static' | 'policy' | 'help' | 'landing';
  status: 'published' | 'draft';
  language: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

const pageTypes = {
  static: { label: '정적 페이지', color: 'bg-blue-100 text-blue-800', icon: Layout },
  policy: { label: '정책 페이지', color: 'bg-green-100 text-green-800', icon: Shield },
  help: { label: '도움말', color: 'bg-purple-100 text-purple-800', icon: Info },
  landing: { label: '랜딩 페이지', color: 'bg-orange-100 text-orange-800', icon: FileText },
};

const languages = [
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

const pageTemplates = {
  'privacy-policy': {
    title: '개인정보처리방침',
    slug: 'privacy-policy',
    type: 'policy' as const,
    content: `# 개인정보처리방침

## 1. 개인정보의 처리 목적
MutPark는 다음의 목적을 위하여 개인정보를 처리합니다.

### 회원가입 및 관리
- 회원 가입의사 확인
- 회원제 서비스 제공에 따른 본인 식별·인증
- 회원자격 유지·관리
- 서비스 부정이용 방지

### 재화 또는 서비스 제공
- 물품배송
- 서비스 제공
- 계약서, 청구서 발송
- 콘텐츠 제공
- 맞춤서비스 제공

## 2. 개인정보의 처리 및 보유 기간
개인정보는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 처리·보유합니다.

## 3. 정보주체와 법정대리인의 권리·의무 및 그 행사방법
정보주체는 개인정보보호법 제35조에 따른 개인정보의 열람 청구를 할 수 있습니다.`,
    metaTitle: '개인정보처리방침 | MutPark',
    metaDescription: 'MutPark의 개인정보 수집 및 이용에 대한 정책을 확인하세요.',
    keywords: ['개인정보', '처리방침', '프라이버시', '개인정보보호']
  },
  'terms-of-service': {
    title: '이용약관',
    slug: 'terms-of-service',
    type: 'policy' as const,
    content: `# 이용약관

## 제1조 (목적)
이 약관은 MutPark가 운영하는 온라인 쇼핑몰에서 제공하는 서비스와 이를 이용하는 회원의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

## 제2조 (정의)
이 약관에서 사용하는 용어의 정의는 다음과 같습니다.

1. "쇼핑몰"이란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 또는 용역을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.

2. "이용자"란 "쇼핑몰"에 접속하여 이 약관에 따라 "쇼핑몰"이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.

## 제3조 (약관의 명시와 개정)
"쇼핑몰"은 이 약관의 내용과 상호 및 대표자 성명, 영업소 소재지 주소, 전화번호, 모사전송번호, 전자우편주소, 사업자등록번호, 통신판매업신고번호 등을 이용자가 쉽게 알 수 있도록 온라인 서비스 초기화면에 게시합니다.`,
    metaTitle: '이용약관 | MutPark',
    metaDescription: 'MutPark 서비스 이용에 관한 약관을 확인하세요.',
    keywords: ['이용약관', '서비스 약관', '온라인 쇼핑몰', '이용조건']
  },
  'shipping-returns': {
    title: '배송 및 반품 정책',
    slug: 'shipping-returns',
    type: 'policy' as const,
    content: `# 배송 및 반품 정책

## 배송 정보

### 배송 지역
- 터키 전 지역 배송 가능
- 일부 도서 지역은 추가 배송료가 발생할 수 있습니다.

### 배송 시간
- 평일 오후 2시 이전 주문 시 당일 출고
- 일반 배송: 1-3일 소요
- 특급 배송: 24시간 이내 배송 (추가 요금)

### 배송 요금
- 50TL 이상 주문 시 무료 배송
- 50TL 미만 주문 시 배송료 10TL

## 반품 및 교환

### 반품 가능 기간
- 상품 수령일로부터 7일 이내
- 단, 냉동/냉장 식품은 당일 반품만 가능

### 반품 조건
- 상품이 훼손되지 않은 경우
- 포장이 개봉되지 않은 경우
- 고객 변심에 의한 반품 시 배송료 고객 부담

### 교환 절차
1. 고객센터 연락 (교환 신청)
2. 상품 반송
3. 검수 후 새 상품 발송`,
    metaTitle: '배송 및 반품 정책 | MutPark',
    metaDescription: '상품 배송과 반품/교환에 관한 정책을 확인하세요.',
    keywords: ['배송', '반품', '교환', '배송료', '배송정책']
  },
  'faq': {
    title: '자주 묻는 질문',
    slug: 'faq',
    type: 'help' as const,
    content: `# 자주 묻는 질문

## 주문 관련

### Q: 주문은 어떻게 하나요?
A: 원하는 상품을 장바구니에 담고 결제를 진행하시면 됩니다. 회원가입 없이도 주문이 가능합니다.

### Q: 주문 취소는 언제까지 가능한가요?
A: 상품 발송 전까지 마이페이지에서 취소 가능합니다. 발송 후에는 반품 절차를 거쳐야 합니다.

## 배송 관련

### Q: 배송은 얼마나 걸리나요?
A: 일반 배송은 1-3일, 특급 배송은 24시간 이내 배송됩니다.

### Q: 배송 추적은 어떻게 하나요?
A: 주문 완료 후 제공되는 운송장 번호로 배송 상태를 확인할 수 있습니다.

## 결제 관련

### Q: 어떤 결제 수단을 사용할 수 있나요?
A: 신용카드, 체크카드, 은행 이체, PayPal 등을 지원합니다.

### Q: 결제가 실패했습니다. 어떻게 해야 하나요?
A: 카드 한도나 잔액을 확인하고, 문제가 지속되면 고객센터로 연락해 주세요.`,
    metaTitle: '자주 묻는 질문 | MutPark',
    metaDescription: 'MutPark 이용 시 자주 묻는 질문과 답변을 확인하세요.',
    keywords: ['FAQ', '자주 묻는 질문', '고객지원', '도움말']
  },
  'about-us': {
    title: 'About Us',
    slug: 'about-us',
    type: 'static' as const,
    content: `# About MutPark

## Our Mission
MutPark is dedicated to bringing the authentic taste of Korean cuisine to Turkey. We carefully source and deliver premium Korean food products to help you enjoy traditional Korean flavors at home.

## Our Story
Founded with a passion for Korean culture and cuisine, MutPark began as a small initiative to bridge the gap between Korean and Turkish communities through food. Today, we're proud to serve customers across Turkey with the finest selection of Korean ingredients and products.

## What We Offer
- **Authentic Korean Ingredients**: Fresh and traditional Korean food products
- **Quick Delivery**: Fast and reliable delivery across Turkey
- **Quality Assurance**: Every product is carefully selected for quality
- **Cultural Bridge**: Connecting Korean and Turkish communities through food

## Our Values
- **Authenticity**: We source genuine Korean products
- **Quality**: Only the best products reach our customers
- **Community**: Building bridges between cultures
- **Service**: Exceptional customer experience

## Contact Us
We'd love to hear from you! Whether you have questions about our products or need help with your order, our team is here to help.

**Email**: info@mutpark.com
**Phone**: +90 XXX XXX XXXX
**Address**: Istanbul, Turkey`,
    metaTitle: 'About Us | MutPark',
    metaDescription: 'Learn about MutPark\'s mission to bring Korean food to Turkey.',
    keywords: ['about us', 'company', 'korean food', 'mission', 'story']
  }
};

export default function NewPage() {
  const { permissions } = useAdminAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    type: 'static',
    status: 'draft',
    language: 'ko',
    content: '',
    metaTitle: '',
    metaDescription: '',
    keywords: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'URL 슬러그를 입력해주세요';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = '슬러그는 영문 소문자, 숫자, 하이픈만 사용 가능합니다';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요';
    }

    if (!formData.metaTitle.trim()) {
      newErrors.metaTitle = 'SEO 제목을 입력해주세요';
    }

    if (!formData.metaDescription.trim()) {
      newErrors.metaDescription = 'SEO 설명을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Here you would normally save to your backend

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to pages list
      router.push('/admin/content/pages');
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      metaTitle: prev.metaTitle || `${title} | MutPark`
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const useTemplate = (templateKey: string) => {
    const template = pageTemplates[templateKey as keyof typeof pageTemplates];
    if (template) {
      setFormData(prev => ({
        ...prev,
        ...template,
        keywords: template.keywords || []
      }));
    }
  };

  if (!permissions?.canManageContent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">콘텐츠 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로 가기
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">새 페이지 만들기</h1>
            <p className="text-gray-600">새로운 페이지를 작성하고 발행하세요.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            미리보기
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                저장
              </>
            )}
          </button>
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 템플릿</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {Object.entries(pageTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => useTemplate(key)}
              className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                  {template.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                페이지 제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="페이지 제목을 입력하세요"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL 슬러그 *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.slug ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="url-slug"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.slug}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                URL: /{formData.language}/pages/{formData.slug || 'url-slug'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                페이지 유형
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PageFormData['type'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(pageTypes).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                언어
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                발행 상태
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PageFormData['status'] }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">임시보관</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PageFormData['status'] }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">즉시 발행</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">페이지 내용</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={20}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Markdown 형식으로 내용을 작성하세요..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.content}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Markdown 문법을 사용할 수 있습니다. # 제목, **굵게**, *기울임* 등
            </p>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO 설정</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO 제목 *
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.metaTitle ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="검색 엔진에 표시될 제목"
                maxLength={60}
              />
              {errors.metaTitle && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.metaTitle}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.metaTitle.length}/60 글자 (권장: 50-60자)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO 설명 *
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.metaDescription ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="검색 엔진에 표시될 설명"
                maxLength={160}
              />
              {errors.metaDescription && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.metaDescription}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.metaDescription.length}/160 글자 (권장: 120-160자)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                키워드
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="키워드를 입력하고 Enter를 누르세요"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                페이지 저장
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}