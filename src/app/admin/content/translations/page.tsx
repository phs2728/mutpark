"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Globe,
  Languages,
  FileText,
  AlertCircle,
  Check,
  X,
  Save,
} from "lucide-react";

interface Translation {
  id: string;
  key: string;
  ko: string;
  en: string;
  tr: string;
  category: string;
  lastModified: string;
  modifiedBy: string;
  status: 'complete' | 'partial' | 'missing';
}

const mockTranslations: Translation[] = [
  {
    id: "1",
    key: "common.welcome",
    ko: "환영합니다",
    en: "Welcome",
    tr: "Hoş geldiniz",
    category: "common",
    lastModified: "2025-01-22T14:30:00Z",
    modifiedBy: "번역팀",
    status: "complete"
  },
  {
    id: "2",
    key: "auth.login",
    ko: "로그인",
    en: "Login",
    tr: "Giriş yap",
    category: "auth",
    lastModified: "2025-01-22T14:30:00Z",
    modifiedBy: "번역팀",
    status: "complete"
  },
  {
    id: "3",
    key: "product.addToCart",
    ko: "장바구니에 담기",
    en: "Add to Cart",
    tr: "Sepete ekle",
    category: "product",
    lastModified: "2025-01-22T14:30:00Z",
    modifiedBy: "번역팀",
    status: "complete"
  },
  {
    id: "4",
    key: "order.confirm",
    ko: "주문 확인",
    en: "Confirm Order",
    tr: "",
    category: "order",
    lastModified: "2025-01-20T10:15:00Z",
    modifiedBy: "개발팀",
    status: "partial"
  },
  {
    id: "5",
    key: "payment.processing",
    ko: "결제 처리 중",
    en: "",
    tr: "",
    category: "payment",
    lastModified: "2025-01-21T16:45:00Z",
    modifiedBy: "개발팀",
    status: "missing"
  },
];

const categories = [
  { value: 'all', label: '전체 카테고리' },
  { value: 'common', label: '공통' },
  { value: 'auth', label: '인증' },
  { value: 'product', label: '상품' },
  { value: 'order', label: '주문' },
  { value: 'payment', label: '결제' },
  { value: 'user', label: '사용자' },
  { value: 'admin', label: '관리자' },
];

const statuses = {
  complete: { label: '완료', color: 'bg-green-100 text-green-800', icon: Check },
  partial: { label: '부분 완료', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  missing: { label: '누락', color: 'bg-red-100 text-red-800', icon: X },
};

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

export default function TranslationsPage() {
  const { permissions } = useAdminAuth();
  const [translations, setTranslations] = useState<Translation[]>(mockTranslations);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Translation>>({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTranslation, setNewTranslation] = useState({
    key: '',
    ko: '',
    en: '',
    tr: '',
    category: 'common'
  });

  const filteredTranslations = translations.filter(translation => {
    const matchesSearch =
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.ko.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.tr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === "all" || translation.category === filterCategory;
    const matchesStatus = filterStatus === "all" || translation.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const startEditing = (translation: Translation) => {
    setEditingId(translation.id);
    setEditingData(translation);
  };

  const saveEditing = () => {
    if (editingId && editingData) {
      setTranslations(prev => prev.map(t =>
        t.id === editingId
          ? {
              ...t,
              ...editingData,
              lastModified: new Date().toISOString(),
              modifiedBy: "관리자",
              status: getTranslationStatus(editingData as Translation)
            }
          : t
      ));
      setEditingId(null);
      setEditingData({});
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  const deleteTranslation = (id: string) => {
    if (confirm('이 번역을 삭제하시겠습니까?')) {
      setTranslations(prev => prev.filter(t => t.id !== id));
    }
  };

  const addNewTranslation = () => {
    if (!newTranslation.key.trim()) {
      alert('키를 입력해주세요');
      return;
    }

    const newId = (translations.length + 1).toString();
    const translation: Translation = {
      id: newId,
      key: newTranslation.key,
      ko: newTranslation.ko,
      en: newTranslation.en,
      tr: newTranslation.tr,
      category: newTranslation.category,
      lastModified: new Date().toISOString(),
      modifiedBy: "관리자",
      status: getTranslationStatus({
        ko: newTranslation.ko,
        en: newTranslation.en,
        tr: newTranslation.tr
      } as Translation)
    };

    setTranslations(prev => [...prev, translation]);
    setNewTranslation({ key: '', ko: '', en: '', tr: '', category: 'common' });
    setShowNewForm(false);
  };

  const getTranslationStatus = (translation: Translation): 'complete' | 'partial' | 'missing' => {
    const hasKo = translation.ko?.trim();
    const hasEn = translation.en?.trim();
    const hasTr = translation.tr?.trim();

    if (hasKo && hasEn && hasTr) return 'complete';
    if (hasKo || hasEn || hasTr) return 'partial';
    return 'missing';
  };

  const exportTranslations = () => {
    const data = translations.map(t => ({
      key: t.key,
      korean: t.ko,
      english: t.en,
      turkish: t.tr,
      category: t.category
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translations.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const total = translations.length;
    const complete = translations.filter(t => t.status === 'complete').length;
    const partial = translations.filter(t => t.status === 'partial').length;
    const missing = translations.filter(t => t.status === 'missing').length;

    return { total, complete, partial, missing };
  };

  const stats = getStats();

  if (!permissions?.canManageContent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Languages className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
          <h1 className="text-2xl font-bold text-gray-900">번역 관리</h1>
          <p className="mt-2 text-gray-600">
            다국어 번역을 관리하고 편집합니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={exportTranslations}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            가져오기
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 번역 추가
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 mr-3">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">총 번역</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100 mr-3">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.complete}</div>
              <div className="text-sm text-gray-600">완료</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100 mr-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.partial}</div>
              <div className="text-sm text-gray-600">부분 완료</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-red-100 mr-3">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.missing}</div>
              <div className="text-sm text-gray-600">누락</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="키 또는 번역 내용 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
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
              <option value="complete">완료</option>
              <option value="partial">부분 완료</option>
              <option value="missing">누락</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          총 {filteredTranslations.length}개의 번역 (전체 {translations.length}개 중)
        </div>
      </div>

      {/* New Translation Form */}
      {showNewForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">새 번역 추가</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">키 *</label>
              <input
                type="text"
                value={newTranslation.key}
                onChange={(e) => setNewTranslation(prev => ({ ...prev, key: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: common.welcome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={newTranslation.category}
                onChange={(e) => setNewTranslation(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.slice(1).map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {languages.map((lang) => (
              <div key={lang.code}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang.flag} {lang.name}
                </label>
                <input
                  type="text"
                  value={newTranslation[lang.code as keyof typeof newTranslation]}
                  onChange={(e) => setNewTranslation(prev => ({
                    ...prev,
                    [lang.code]: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`${lang.name} 번역`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowNewForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={addNewTranslation}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* Translations Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">번역 목록</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  키
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  🇰🇷 한국어
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  🇺🇸 English
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  🇹🇷 Türkçe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTranslations.map((translation) => {
                const statusConfig = statuses[translation.status];
                const isEditing = editingId === translation.id;

                return (
                  <tr key={translation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>
                        {translation.key}
                        <div className="text-xs text-gray-500">{translation.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingData.ko || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, ko: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        translation.ko || <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingData.en || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, en: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        translation.en || <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingData.tr || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, tr: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        translation.tr || <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <statusConfig.icon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEditing}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(translation)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteTranslation(translation.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTranslations.length === 0 && (
          <div className="p-6 text-center">
            <Languages className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">번역이 없습니다</h3>
            <p className="text-gray-600 mb-4">검색 조건에 맞는 번역을 찾을 수 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}