"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Eye,
  Filter,
  Download,
  MoreHorizontal,
  Upload,
  FileText,
  X,
} from "lucide-react";

interface Product {
  id: number;
  sku: string;
  baseName: string;
  price: number;
  currency: string;
  stock: number;
  category: string;
  brand: string;
  halalCertified: boolean;
  spiceLevel: number | null;
  freshnessStatus: "FRESH" | "NEAR_EXPIRY" | "EXPIRED";
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  translations?: {
    language: string;
    name: string;
    description?: string;
  }[];
}

const freshnessConfig = {
  FRESH: { label: "신선", color: "bg-green-100 text-green-800" },
  NEAR_EXPIRY: { label: "유통기한 임박", color: "bg-yellow-100 text-yellow-800" },
  EXPIRED: { label: "유통기한 만료", color: "bg-red-100 text-red-800" },
};

// Updated: 2025-09-23 - Ensuring bulk upload and action buttons are visible
export default function AdminProducts() {
  const { permissions } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [freshnessFilter, setFreshnessFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const productsPerPage = 20;

  // 모의 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: 1,
        sku: "KFOOD-GOCHUJANG-500G",
        baseName: "고추장 500g",
        price: 189.9,
        currency: "TRY",
        stock: 120,
        category: "Sauce",
        brand: "CJ",
        halalCertified: true,
        spiceLevel: 3,
        freshnessStatus: "FRESH",
        imageUrl: "https://images.unsplash.com/photo-1589308078055-079332f0c816?auto=format&fit=crop&w=800&q=80",
        createdAt: "2025-01-15T10:30:00Z",
        updatedAt: "2025-01-20T14:20:00Z",
        translations: [
          { language: "ko", name: "고추장 500g", description: "칼칼한 매운맛이 매력적인 전통 고추장입니다." },
          { language: "tr", name: "Gochujang 500g", description: "Farklı yemeklerde kullanılabilen geleneksel Kore biber ezmesi." },
        ],
      },
      {
        id: 2,
        sku: "KFOOD-KIMCHI-GLASSJAR",
        baseName: "전통 김치 1kg",
        price: 249.5,
        currency: "TRY",
        stock: 80,
        category: "SideDish",
        brand: "MutPark",
        halalCertified: true,
        spiceLevel: 4,
        freshnessStatus: "FRESH",
        imageUrl: "https://images.unsplash.com/photo-1604908176940-3d61aacd3b02?auto=format&fit=crop&w=800&q=80",
        createdAt: "2025-01-14T16:45:00Z",
        updatedAt: "2025-01-19T11:30:00Z",
        translations: [
          { language: "ko", name: "전통 김치 1kg", description: "터키 현지에서 직접 만들어 더욱 신선한 한국 김치" },
          { language: "tr", name: "Geleneksel Kimchi 1kg", description: "Yerel olarak hazırlanan taze Kore kimchisi." },
        ],
      },
      {
        id: 3,
        sku: "NONGSHIM-SHINRAMYUN-BLACK",
        baseName: "신라면 블랙 5입",
        price: 159.9,
        currency: "TRY",
        stock: 5,
        category: "InstantFood",
        brand: "농심",
        halalCertified: false,
        spiceLevel: 4,
        freshnessStatus: "NEAR_EXPIRY",
        imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
        createdAt: "2025-01-12T09:20:00Z",
        updatedAt: "2025-01-18T15:45:00Z",
      },
      {
        id: 4,
        sku: "KFOOD-SESAME-OIL-320ML",
        baseName: "참기름 320ml",
        price: 129.9,
        currency: "TRY",
        stock: 150,
        category: "Sauce",
        brand: "오뚜기",
        halalCertified: true,
        spiceLevel: 0,
        freshnessStatus: "FRESH",
        imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
        createdAt: "2025-01-10T13:15:00Z",
        updatedAt: "2025-01-17T10:20:00Z",
      },
      {
        id: 5,
        sku: "KFOOD-DOENJANG-1KG",
        baseName: "된장 1kg",
        price: 199.9,
        currency: "TRY",
        stock: 0,
        category: "Sauce",
        brand: "청정원",
        halalCertified: true,
        spiceLevel: 0,
        freshnessStatus: "FRESH",
        imageUrl: "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=800&q=80",
        createdAt: "2025-01-08T11:40:00Z",
        updatedAt: "2025-01-16T14:30:00Z",
      },
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

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

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.baseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "ALL" || product.category === categoryFilter;
    const matchesFreshness = freshnessFilter === "ALL" || product.freshnessStatus === freshnessFilter;

    return matchesSearch && matchesCategory && matchesFreshness;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "품절", color: "bg-red-100 text-red-800" };
    if (stock <= 10) return { label: "재고 부족", color: "bg-yellow-100 text-yellow-800" };
    return { label: "재고 충분", color: "bg-green-100 text-green-800" };
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  // 핸들러 함수들
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleEditProduct = (productId: number) => {
    window.location.href = `/admin/products/${productId}/edit`;
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert('상품이 삭제되었습니다.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];

      if (allowedTypes.includes(file.type)) {
        setUploadFile(file);
        setUploadStatus('idle');
      } else {
        alert('Excel (.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.');
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    // 모의 업로드 프로세스
    const simulateUpload = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          setUploadStatus('success');

          // 새로운 상품들을 추가 (실제로는 서버에서 파싱된 데이터)
          const newProducts = [
            {
              id: Date.now(),
              sku: "BULK-UPLOAD-001",
              baseName: "업로드된 상품 1",
              price: 299.9,
              currency: "TRY",
              stock: 50,
              category: "Bulk",
              brand: "업로드",
              halalCertified: true,
              spiceLevel: 2,
              freshnessStatus: "FRESH" as const,
              imageUrl: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ];

          setProducts(prev => [...prev, ...newProducts]);

          setTimeout(() => {
            setShowUploadModal(false);
            setUploadFile(null);
            setUploadProgress(0);
            setUploadStatus('idle');
          }, 2000);
        }
      }, 200);
    };

    simulateUpload();
  };

  const downloadTemplate = () => {
    // 템플릿 CSV 데이터 생성
    const csvContent = `SKU,상품명,가격,재고,카테고리,브랜드,할랄인증,매운맛정도,상품설명
TEMPLATE-001,상품명 예시,199.9,100,Sauce,브랜드명,true,3,상품 설명을 입력하세요
TEMPLATE-002,상품명 예시2,299.9,50,InstantFood,브랜드명2,false,1,상품 설명을 입력하세요`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
          <p className="mt-2 text-gray-600">
            총 {filteredProducts.length}개의 상품이 있습니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            템플릿 다운로드
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            대량 업로드
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            상품 추가
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="SKU, 상품명, 브랜드로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">전체 카테고리</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={freshnessFilter}
              onChange={(e) => setFreshnessFilter(e.target.value)}
            >
              <option value="ALL">전체 상태</option>
              <option value="FRESH">신선</option>
              <option value="NEAR_EXPIRY">유통기한 임박</option>
              <option value="EXPIRED">유통기한 만료</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  재고
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  업데이트
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.imageUrl}
                              alt={product.baseName}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.baseName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.sku}
                          </div>
                          <div className="text-xs text-gray-400">
                            {product.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price, product.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          {product.stock}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{product.category}</span>
                      <div className="flex items-center mt-1">
                        {product.halalCertified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1">
                            할랄
                          </span>
                        )}
                        {product.spiceLevel && product.spiceLevel > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            🌶️ {product.spiceLevel}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${freshnessConfig[product.freshnessStatus].color}`}>
                        {freshnessConfig[product.freshnessStatus].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(product.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="상품 보기"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="상품 편집"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="상품 삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {startIndex + 1}-{Math.min(startIndex + productsPerPage, filteredProducts.length)} / {filteredProducts.length}개 표시
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      currentPage === pageNum
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">총 상품</p>
              <p className="text-lg font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">품절 상품</p>
              <p className="text-lg font-bold text-gray-900">
                {products.filter(p => p.stock === 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">재고 부족</p>
              <p className="text-lg font-bold text-gray-900">
                {products.filter(p => p.stock > 0 && p.stock <= 10).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">유통기한 임박</p>
              <p className="text-lg font-bold text-gray-900">
                {products.filter(p => p.freshnessStatus === "NEAR_EXPIRY").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 대량 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">상품 대량 업로드</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Excel 또는 CSV 파일을 업로드하여 여러 상품을 한번에 등록할 수 있습니다.
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        파일을 선택하거나 드래그해서 놓으세요
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Excel (.xlsx, .xls) 또는 CSV 파일 지원
                    </p>
                  </div>
                </div>

                {uploadFile && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">{uploadFile.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {uploadStatus === 'uploading' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>업로드 중...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">업로드가 완료되었습니다!</p>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">업로드 중 오류가 발생했습니다.</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  취소
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploadStatus === 'uploading'}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                >
                  업로드
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상품 상세 보기 모달 */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">상품 상세 정보</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.baseName}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedProduct.baseName}</h4>
                  <p className="text-gray-600">{selectedProduct.sku}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">가격</label>
                    <p className="text-lg font-bold text-blue-600">
                      {formatPrice(selectedProduct.price, selectedProduct.currency)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">재고</label>
                    <p className="text-lg">{selectedProduct.stock}개</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">카테고리</label>
                    <p>{selectedProduct.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">브랜드</label>
                    <p>{selectedProduct.brand}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedProduct.halalCertified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      할랄 인증
                    </span>
                  )}
                  {selectedProduct.spiceLevel && selectedProduct.spiceLevel > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      🌶️ 매운맛 {selectedProduct.spiceLevel}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${freshnessConfig[selectedProduct.freshnessStatus].color}`}>
                    {freshnessConfig[selectedProduct.freshnessStatus].label}
                  </span>
                </div>

                {selectedProduct.translations && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">번역</label>
                    <div className="space-y-2">
                      {selectedProduct.translations.map((translation, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {translation.language.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{translation.name}</p>
                          {translation.description && (
                            <p className="text-sm text-gray-600 mt-1">{translation.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      handleEditProduct(selectedProduct.id);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    편집
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}