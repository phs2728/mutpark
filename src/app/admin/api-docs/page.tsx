"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState } from "react";
import {
  Code,
  Book,
  Key,
  Globe,
  Copy,
  CheckCircle,
  Search,
  Filter,
  ExternalLink,
  Play,
  FileText,
  Shield,
  Zap,
  Database,
  Users,
  ShoppingCart,
  Package,
} from "lucide-react";

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  title: string;
  description: string;
  category: string;
  requiresAuth: boolean;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  example?: {
    request?: string;
    response: string;
  };
}

const methodColors = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-orange-100 text-orange-800',
  DELETE: 'bg-red-100 text-red-800',
  PATCH: 'bg-purple-100 text-purple-800',
};

const categories = [
  { id: 'all', label: '전체', icon: Globe },
  { id: 'auth', label: '인증', icon: Shield },
  { id: 'users', label: '사용자', icon: Users },
  { id: 'products', label: '상품', icon: Package },
  { id: 'orders', label: '주문', icon: ShoppingCart },
  { id: 'system', label: '시스템', icon: Database },
];

const apiEndpoints: APIEndpoint[] = [
  {
    id: '1',
    method: 'GET',
    path: '/api/auth/me',
    title: '현재 사용자 정보',
    description: '현재 로그인된 사용자의 정보를 반환합니다.',
    category: 'auth',
    requiresAuth: true,
    example: {
      response: `{
  "id": "user_123",
  "email": "user@example.com",
  "name": "홍길동",
  "role": "user",
  "createdAt": "2025-01-15T10:30:00Z"
}`
    }
  },
  {
    id: '2',
    method: 'POST',
    path: '/api/auth/login',
    title: '사용자 로그인',
    description: '이메일과 비밀번호로 사용자 인증을 수행합니다.',
    category: 'auth',
    requiresAuth: false,
    parameters: [
      { name: 'email', type: 'string', required: true, description: '사용자 이메일 주소' },
      { name: 'password', type: 'string', required: true, description: '사용자 비밀번호' },
      { name: 'remember', type: 'boolean', required: false, description: '로그인 상태 유지 여부' }
    ],
    example: {
      request: `{
  "email": "user@example.com",
  "password": "password123",
  "remember": true
}`,
      response: `{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "홍길동"
  }
}`
    }
  },
  {
    id: '3',
    method: 'GET',
    path: '/api/products',
    title: '상품 목록 조회',
    description: '상품 목록을 페이지네이션과 함께 조회합니다.',
    category: 'products',
    requiresAuth: false,
    parameters: [
      { name: 'page', type: 'number', required: false, description: '페이지 번호 (기본값: 1)' },
      { name: 'limit', type: 'number', required: false, description: '페이지당 항목 수 (기본값: 20)' },
      { name: 'category', type: 'string', required: false, description: '카테고리 필터' },
      { name: 'search', type: 'string', required: false, description: '검색 키워드' }
    ],
    example: {
      response: `{
  "products": [
    {
      "id": "prod_123",
      "name": "김치 500g",
      "price": 8500,
      "category": "김치류",
      "image": "https://...",
      "inStock": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}`
    }
  },
  {
    id: '4',
    method: 'POST',
    path: '/api/orders',
    title: '주문 생성',
    description: '새로운 주문을 생성합니다.',
    category: 'orders',
    requiresAuth: true,
    parameters: [
      { name: 'items', type: 'array', required: true, description: '주문 상품 배열' },
      { name: 'shippingAddress', type: 'object', required: true, description: '배송 주소 정보' },
      { name: 'paymentMethod', type: 'string', required: true, description: '결제 방법' }
    ],
    example: {
      request: `{
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "price": 8500
    }
  ],
  "shippingAddress": {
    "name": "홍길동",
    "phone": "+90 555 123 4567",
    "address": "Istanbul, Turkey",
    "postalCode": "34000"
  },
  "paymentMethod": "credit_card"
}`,
      response: `{
  "orderId": "order_789",
  "status": "pending",
  "total": 17000,
  "estimatedDelivery": "2025-01-25",
  "paymentUrl": "https://payment.iyzico.com/..."
}`
    }
  },
  {
    id: '5',
    method: 'GET',
    path: '/api/admin/users',
    title: '사용자 관리 (관리자)',
    description: '모든 사용자 목록을 조회합니다. (관리자 권한 필요)',
    category: 'users',
    requiresAuth: true,
    parameters: [
      { name: 'page', type: 'number', required: false, description: '페이지 번호' },
      { name: 'role', type: 'string', required: false, description: '역할 필터 (user, admin)' },
      { name: 'status', type: 'string', required: false, description: '상태 필터 (active, suspended)' }
    ],
    example: {
      response: `{
  "users": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "name": "홍길동",
      "role": "user",
      "status": "active",
      "lastLogin": "2025-01-20T15:30:00Z",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}`
    }
  },
  {
    id: '6',
    method: 'GET',
    path: '/api/system/health',
    title: '시스템 상태 확인',
    description: '시스템의 전반적인 상태를 확인합니다.',
    category: 'system',
    requiresAuth: true,
    example: {
      response: `{
  "status": "healthy",
  "timestamp": "2025-01-23T10:30:00Z",
  "uptime": 259200,
  "version": "1.0.0",
  "checks": [
    {
      "service": "database",
      "status": "healthy",
      "responseTime": 15
    },
    {
      "service": "iyzico",
      "status": "healthy",
      "responseTime": 245
    }
  ]
}`
    }
  }
];

export default function AdminAPIDocs() {
  const { permissions } = useAdminAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredEndpoints = apiEndpoints.filter(endpoint => {
    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory;
    const matchesSearch = endpoint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateCurlExample = (endpoint: APIEndpoint) => {
    let curl = `curl -X ${endpoint.method} \\
  "${window.location.origin}${endpoint.path}"`;

    if (endpoint.requiresAuth) {
      curl += ` \\
  -H "Authorization: Bearer YOUR_TOKEN"`;
    }

    if (endpoint.method !== 'GET' && endpoint.example?.request) {
      curl += ` \\
  -H "Content-Type: application/json" \\
  -d '${endpoint.example.request.replace(/\n\s*/g, '')}'`;
    }

    return curl;
  };

  if (!permissions?.canViewAPI) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">API 문서 조회 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API 문서</h1>
          <p className="mt-2 text-gray-600">
            MutPark API의 엔드포인트와 사용법을 확인하세요.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <a
            href="/api/swagger"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Swagger 문서
          </a>
        </div>
      </div>

      {/* API Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 mr-3">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{apiEndpoints.length}</div>
              <div className="text-sm text-gray-600">총 엔드포인트</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100 mr-3">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {apiEndpoints.filter(e => e.requiresAuth).length}
              </div>
              <div className="text-sm text-gray-600">인증 필요</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 mr-3">
              <Book className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">v1.0</div>
              <div className="text-sm text-gray-600">API 버전</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API 탐색</h3>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="엔드포인트 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const count = category.id === 'all'
                  ? apiEndpoints.length
                  : apiEndpoints.filter(e => e.category === category.id).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 mr-2" />
                      {category.label}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Authentication Info */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <Key className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">인증 안내</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    인증이 필요한 API는 Authorization 헤더에 Bearer 토큰을 포함해야 합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredEndpoints.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-600">다른 검색어나 카테고리를 시도해보세요.</p>
              </div>
            ) : (
              filteredEndpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${methodColors[endpoint.method]}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {endpoint.path}
                      </code>
                      {endpoint.requiresAuth && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          <Key className="h-3 w-3 mr-1" />
                          인증 필요
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedEndpoint(selectedEndpoint?.id === endpoint.id ? null : endpoint)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {selectedEndpoint?.id === endpoint.id ? '접기' : '상세보기'}
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{endpoint.title}</h3>
                  <p className="text-gray-600 mb-4">{endpoint.description}</p>

                  {selectedEndpoint?.id === endpoint.id && (
                    <div className="border-t border-gray-200 pt-4 space-y-4">
                      {/* Parameters */}
                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">매개변수</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">타입</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">필수</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {endpoint.parameters.map((param, index) => (
                                  <tr key={index}>
                                    <td className="px-3 py-2 text-sm font-mono text-gray-900">{param.name}</td>
                                    <td className="px-3 py-2 text-sm text-gray-600">{param.type}</td>
                                    <td className="px-3 py-2 text-sm">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        param.required
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {param.required ? '필수' : '선택'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* cURL Example */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">cURL 예제</h4>
                          <button
                            onClick={() => copyToClipboard(generateCurlExample(endpoint), `curl-${endpoint.id}`)}
                            className="flex items-center text-xs text-blue-600 hover:text-blue-700"
                          >
                            {copiedCode === `curl-${endpoint.id}` ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                복사됨
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                복사
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                          {generateCurlExample(endpoint)}
                        </pre>
                      </div>

                      {/* Request Example */}
                      {endpoint.example?.request && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900">요청 예제</h4>
                            <button
                              onClick={() => copyToClipboard(endpoint.example!.request!, `req-${endpoint.id}`)}
                              className="flex items-center text-xs text-blue-600 hover:text-blue-700"
                            >
                              {copiedCode === `req-${endpoint.id}` ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  복사됨
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  복사
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto border">
                            {endpoint.example.request}
                          </pre>
                        </div>
                      )}

                      {/* Response Example */}
                      {endpoint.example?.response && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900">응답 예제</h4>
                            <button
                              onClick={() => copyToClipboard(endpoint.example!.response, `res-${endpoint.id}`)}
                              className="flex items-center text-xs text-blue-600 hover:text-blue-700"
                            >
                              {copiedCode === `res-${endpoint.id}` ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  복사됨
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  복사
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto border">
                            {endpoint.example.response}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}