"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState } from "react";
import {
  Layout,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Calendar,
  Search,
  Filter,
  FileText,
  Shield,
  Info,
  Mail,
  Truck,
  CreditCard,
} from "lucide-react";

interface Page {
  id: string;
  title: string;
  slug: string;
  type: 'static' | 'policy' | 'help' | 'landing';
  status: 'published' | 'draft' | 'archived';
  language: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  viewCount: number;
  lastModifiedBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

const mockPages: Page[] = [
  {
    id: "1",
    title: "개인정보처리방침",
    slug: "privacy-policy",
    type: "policy",
    status: "published",
    language: "ko",
    content: "개인정보처리방침 내용...",
    metaTitle: "개인정보처리방침 | MutPark",
    metaDescription: "MutPark의 개인정보 수집 및 이용에 대한 정책입니다.",
    viewCount: 3247,
    lastModifiedBy: "박편집자",
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-01-22T14:30:00Z",
    publishedAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "2",
    title: "이용약관",
    slug: "terms-of-service",
    type: "policy",
    status: "published",
    language: "ko",
    content: "이용약관 내용...",
    metaTitle: "이용약관 | MutPark",
    metaDescription: "MutPark 서비스 이용에 관한 약관입니다.",
    viewCount: 2156,
    lastModifiedBy: "김법무팀",
    createdAt: "2025-01-10T09:15:00Z",
    updatedAt: "2025-01-15T11:20:00Z",
    publishedAt: "2025-01-10T10:15:00Z",
  },
  {
    id: "3",
    title: "배송 및 반품 정책",
    slug: "shipping-returns",
    type: "policy",
    status: "published",
    language: "ko",
    content: "배송 및 반품 정책 내용...",
    metaTitle: "배송 및 반품 정책 | MutPark",
    metaDescription: "상품 배송과 반품/교환에 관한 정책을 확인하세요.",
    viewCount: 1834,
    lastModifiedBy: "이운영팀",
    createdAt: "2025-01-12T10:30:00Z",
    updatedAt: "2025-01-20T16:45:00Z",
    publishedAt: "2025-01-12T11:00:00Z",
  },
  {
    id: "4",
    title: "About Us",
    slug: "about-us",
    type: "static",
    status: "published",
    language: "en",
    content: "About MutPark company...",
    metaTitle: "About Us | MutPark",
    metaDescription: "Learn about MutPark's mission to bring Korean food to Turkey.",
    viewCount: 987,
    lastModifiedBy: "Content Team",
    createdAt: "2025-01-08T14:20:00Z",
    updatedAt: "2025-01-18T09:15:00Z",
    publishedAt: "2025-01-08T15:00:00Z",
  },
  {
    id: "5",
    title: "자주 묻는 질문",
    slug: "faq",
    type: "help",
    status: "published",
    language: "ko",
    content: "FAQ 내용...",
    metaTitle: "자주 묻는 질문 | MutPark",
    metaDescription: "MutPark 이용 시 자주 묻는 질문과 답변입니다.",
    viewCount: 4521,
    lastModifiedBy: "고객지원팀",
    createdAt: "2025-01-05T11:10:00Z",
    updatedAt: "2025-01-21T13:25:00Z",
    publishedAt: "2025-01-05T12:00:00Z",
  },
  {
    id: "6",
    title: "겨울 특가 이벤트",
    slug: "winter-sale-2025",
    type: "landing",
    status: "draft",
    language: "ko",
    content: "겨울 특가 이벤트 랜딩페이지 내용...",
    metaTitle: "겨울 특가 이벤트 | MutPark",
    metaDescription: "따뜻한 한국 음식으로 겨울을 맞이하세요! 최대 30% 할인",
    viewCount: 0,
    lastModifiedBy: "마케팅팀",
    createdAt: "2025-01-20T10:00:00Z",
    updatedAt: "2025-01-22T15:30:00Z",
  },
];

const pageTypes = {
  static: { label: '정적 페이지', color: 'bg-blue-100 text-blue-800', icon: Layout },
  policy: { label: '정책 페이지', color: 'bg-green-100 text-green-800', icon: Shield },
  help: { label: '도움말', color: 'bg-purple-100 text-purple-800', icon: Info },
  landing: { label: '랜딩 페이지', color: 'bg-orange-100 text-orange-800', icon: FileText },
};

const statuses = {
  published: { label: '발행됨', color: 'bg-green-100 text-green-800' },
  draft: { label: '임시보관', color: 'bg-yellow-100 text-yellow-800' },
  archived: { label: '보관됨', color: 'bg-gray-100 text-gray-800' },
};

const languages = {
  ko: { label: '한국어', flag: '🇰🇷' },
  en: { label: 'English', flag: '🇺🇸' },
  tr: { label: 'Türkçe', flag: '🇹🇷' },
};

export default function AdminPages() {
  const { permissions } = useAdminAuth();
  const [pages, setPages] = useState<Page[]>(mockPages);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || page.type === filterType;
    const matchesStatus = filterStatus === "all" || page.status === filterStatus;
    const matchesLanguage = filterLanguage === "all" || page.language === filterLanguage;

    return matchesSearch && matchesType && matchesStatus && matchesLanguage;
  });

  const togglePageStatus = (pageId: string) => {
    setPages(prev => prev.map(page =>
      page.id === pageId
        ? {
            ...page,
            status: page.status === 'published' ? 'draft' : 'published' as const,
            publishedAt: page.status === 'draft' ? new Date().toISOString() : page.publishedAt
          }
        : page
    ));
  };

  const deletePage = (pageId: string) => {
    if (confirm('이 페이지를 삭제하시겠습니까?')) {
      setPages(prev => prev.filter(page => page.id !== pageId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getPreviewUrl = (page: Page) => {
    return `/${page.language}/pages/${page.slug}`;
  };

  if (!permissions?.canManageContent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Layout className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">콘텐츠 관리 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">페이지 관리</h1>
          <p className="mt-2 text-gray-600">
            정적 페이지, 정책 페이지, 도움말 등을 관리합니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <a
            href="/admin/content/pages/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 페이지 추가
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 mr-3">
              <Layout className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{pages.length}</div>
              <div className="text-sm text-gray-600">총 페이지</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100 mr-3">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {pages.filter(p => p.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">발행된 페이지</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 mr-3">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(pages.map(p => p.language)).size}
              </div>
              <div className="text-sm text-gray-600">지원 언어</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-orange-100 mr-3">
              <Eye className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {pages.reduce((sum, page) => sum + page.viewCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">총 조회수</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="제목 또는 슬러그 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">페이지 유형</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체 유형</option>
              <option value="static">정적 페이지</option>
              <option value="policy">정책 페이지</option>
              <option value="help">도움말</option>
              <option value="landing">랜딩 페이지</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체 상태</option>
              <option value="published">발행됨</option>
              <option value="draft">임시보관</option>
              <option value="archived">보관됨</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">언어</label>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체 언어</option>
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          총 {filteredPages.length}개의 페이지 (전체 {pages.length}개 중)
        </div>
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">페이지 목록</h3>
        </div>

        {filteredPages.length === 0 ? (
          <div className="p-6 text-center">
            <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">페이지가 없습니다</h3>
            <p className="text-gray-600 mb-4">새로운 페이지를 추가해보세요.</p>
            <a
              href="/admin/content/pages/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              첫 번째 페이지 추가
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPages.map((page) => {
              const typeConfig = pageTypes[page.type];
              const statusConfig = statuses[page.status];
              const languageConfig = languages[page.language as keyof typeof languages];
              const TypeIcon = typeConfig.icon;

              return (
                <div key={page.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${typeConfig.color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{page.title}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
                            {typeConfig.label}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {languageConfig?.flag} {languageConfig?.label}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-mono">/{page.slug}</span>
                        </div>

                        {page.metaDescription && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {page.metaDescription}
                          </p>
                        )}

                        <div className="flex items-center space-x-6 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            조회수: {page.viewCount.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            수정: {formatDate(page.updatedAt)}
                          </div>
                          <div>
                            수정자: {page.lastModifiedBy}
                          </div>
                          {page.publishedAt && (
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              발행: {formatDate(page.publishedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {page.status === 'published' && (
                        <a
                          href={getPreviewUrl(page)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          미리보기
                        </a>
                      )}
                      <button
                        onClick={() => togglePageStatus(page.id)}
                        className={`inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium ${
                          page.status === 'published'
                            ? 'text-red-700 bg-red-50 hover:bg-red-100'
                            : 'text-green-700 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {page.status === 'published' ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            비공개
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            발행
                          </>
                        )}
                      </button>
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Edit className="h-4 w-4 mr-1" />
                        편집
                      </button>
                      <button
                        onClick={() => deletePage(page.id)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Templates */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 템플릿</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group">
            <div className="text-center">
              <Shield className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600 group-hover:text-blue-600">개인정보처리방침</div>
              <div className="text-xs text-gray-500">법적 필수 페이지</div>
            </div>
          </button>

          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group">
            <div className="text-center">
              <Truck className="h-8 w-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600 group-hover:text-green-600">배송 정책</div>
              <div className="text-xs text-gray-500">배송/반품 안내</div>
            </div>
          </button>

          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group">
            <div className="text-center">
              <Info className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600 group-hover:text-purple-600">FAQ</div>
              <div className="text-xs text-gray-500">자주 묻는 질문</div>
            </div>
          </button>

          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group">
            <div className="text-center">
              <Layout className="h-8 w-8 text-gray-400 group-hover:text-orange-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600 group-hover:text-orange-600">회사 소개</div>
              <div className="text-xs text-gray-500">About Us 페이지</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}