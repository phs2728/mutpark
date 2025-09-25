"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  ThumbsUp,
  MessageCircle,
  Calendar,
  User,
  Hash,
  X,
  Star,
  Clock,
  MapPin,
} from "lucide-react";

interface Report {
  id: number;
  reason: "SPAM" | "INAPPROPRIATE" | "HARASSMENT" | "COPYRIGHT" | "OTHER";
  description: string;
  reportedBy: {
    id: number;
    name: string;
    email: string;
  };
  reportedAt: string;
}

interface CommunityPost {
  id: number;
  title: string;
  content: string;
  type: "RECIPE" | "REVIEW" | "TIP" | "QUESTION";
  status: "PUBLISHED" | "DRAFT" | "HIDDEN" | "REPORTED";
  author: {
    id: number;
    name: string;
    email: string;
  };
  likesCount: number;
  commentsCount: number;
  reportsCount: number;
  reports?: Report[];
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  difficulty?: string;
  cookingTime?: number;
  rating?: number;
  reviewType?: string;
  location?: string;
}

const postTypeConfig = {
  RECIPE: { label: "레시피", color: "bg-green-100 text-green-800", icon: "🍳" },
  REVIEW: { label: "리뷰", color: "bg-blue-100 text-blue-800", icon: "⭐" },
  TIP: { label: "꿀팁", color: "bg-yellow-100 text-yellow-800", icon: "💡" },
  QUESTION: { label: "질문", color: "bg-purple-100 text-purple-800", icon: "❓" },
};

const statusConfig = {
  PUBLISHED: { label: "게시됨", color: "bg-green-100 text-green-800", icon: CheckCircle },
  DRAFT: { label: "임시저장", color: "bg-gray-100 text-gray-800", icon: MessageSquare },
  HIDDEN: { label: "숨김", color: "bg-red-100 text-red-800", icon: XCircle },
  REPORTED: { label: "신고됨", color: "bg-orange-100 text-orange-800", icon: Flag },
};

const reportReasonConfig = {
  SPAM: { label: "스팸/도배", color: "bg-red-100 text-red-800" },
  INAPPROPRIATE: { label: "부적절한 내용", color: "bg-orange-100 text-orange-800" },
  HARASSMENT: { label: "괴롭힘/혐오", color: "bg-purple-100 text-purple-800" },
  COPYRIGHT: { label: "저작권 침해", color: "bg-blue-100 text-blue-800" },
  OTHER: { label: "기타", color: "bg-gray-100 text-gray-800" },
};

export default function AdminCommunity() {
  const { permissions } = useAdminAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [expandedContent, setExpandedContent] = useState(false);
  const postsPerPage = 15;

  // 모의 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    const mockPosts: CommunityPost[] = [
      {
        id: 1,
        title: "터키에서 만드는 정통 김치찌개",
        content: "터키에서 구할 수 있는 재료들로 맛있는 김치찌개를 만드는 방법을 공유해요! 현지 슈퍼마켓에서 쉽게 찾을 수 있는 재료들을 사용했습니다...",
        type: "RECIPE",
        status: "PUBLISHED",
        author: {
          id: 1,
          name: "김터키",
          email: "kimturkey@example.com",
        },
        likesCount: 24,
        commentsCount: 8,
        reportsCount: 0,
        tags: ["김치찌개", "터키현지화", "쉬운레시피", "한식"],
        difficulty: "MEDIUM",
        cookingTime: 45,
        publishedAt: "2025-01-15T10:30:00Z",
        createdAt: "2025-01-15T10:30:00Z",
        updatedAt: "2025-01-20T14:20:00Z",
      },
      {
        id: 2,
        title: "신라면 블랙 후기",
        content: "드디어 찾았던 신라면 블랙! 맛이 정말 진하고 좋아요. 터키에서 이런 맛을 느낄 수 있다니 감동입니다...",
        type: "REVIEW",
        status: "PUBLISHED",
        author: {
          id: 2,
          name: "이스탄불김씨",
          email: "istanbulkim@example.com",
        },
        likesCount: 15,
        commentsCount: 12,
        reportsCount: 0,
        tags: ["라면", "농심", "추천", "후기"],
        rating: 5,
        reviewType: "PRODUCT",
        publishedAt: "2025-01-14T15:20:00Z",
        createdAt: "2025-01-14T15:20:00Z",
        updatedAt: "2025-01-19T11:30:00Z",
      },
      {
        id: 3,
        title: "터키에서 한국 재료 구하는 꿀팁",
        content: "아시안 마켓 외에도 일반 슈퍼마켓에서 구할 수 있는 대체 재료들과 온라인 쇼핑몰 정보를 정리했어요!",
        type: "TIP",
        status: "PUBLISHED",
        author: {
          id: 3,
          name: "앙카라한국인",
          email: "ankarakorean@example.com",
        },
        likesCount: 35,
        commentsCount: 22,
        reportsCount: 0,
        tags: ["꿀팁", "쇼핑", "재료구하기", "터키", "한식재료"],
        publishedAt: "2025-01-13T12:45:00Z",
        createdAt: "2025-01-13T12:45:00Z",
        updatedAt: "2025-01-18T16:10:00Z",
      },
      {
        id: 4,
        title: "터키에서 떡 만들기 가능할까요?",
        content: "한국 떡이 너무 먹고 싶은데 터키에서 만들 수 있는 방법이 있을까요? 쌀가루는 어디서 구할 수 있는지...",
        type: "QUESTION",
        status: "PUBLISHED",
        author: {
          id: 1,
          name: "김터키",
          email: "kimturkey@example.com",
        },
        likesCount: 12,
        commentsCount: 8,
        reportsCount: 0,
        tags: ["떡", "쌀가루", "한국간식", "만들기"],
        publishedAt: "2025-01-09T11:20:00Z",
        createdAt: "2025-01-09T11:20:00Z",
        updatedAt: "2025-01-15T09:30:00Z",
      },
      {
        id: 5,
        title: "이스탄불 한식당 '서울키친' 후기",
        content: `이스탄불에 새로 생긴 한식당 '서울키친'에 다녀왔어요! 정말 대박 맛집이에요!!!

📍 위치: 베식타시 중심가 (지하철역에서 도보 5분)
⏰ 영업시간: 11:00-23:00 (연중무휴)
💰 가격: 김치찌개 85리라, 불고기 120리라

진짜 한국에서 먹던 그 맛 그대로에요! 특히 김치찌개는 신김치로 끓여서 더 맛있었습니다. 사장님도 한국분이시고 정말 친절하세요.

메뉴 추천:
1. 김치찌개 ⭐⭐⭐⭐⭐ (강력추천!)
2. 불고기 ⭐⭐⭐⭐
3. 비빔밥 ⭐⭐⭐⭐
4. 잡채 ⭐⭐⭐

터키 현지인들도 많이 오더라구요!
주말에는 웨이팅이 있으니 미리 예약하고 가세요~

연락처: +90 212 XXX XXXX
🚗 주차 가능, 💳 카드 결제 가능

이스탄불 한인분들께 꼭 추천드려요! 한국 음식 그리워할 때 가기 딱 좋은 곳입니다. 다음에는 가족들과 함께 가려고 해요!`,
        type: "REVIEW",
        status: "REPORTED",
        author: {
          id: 1,
          name: "김터키",
          email: "kimturkey@example.com",
        },
        likesCount: 28,
        commentsCount: 15,
        reportsCount: 2,
        reports: [
          {
            id: 1,
            reason: "INAPPROPRIATE",
            description: "연락처와 구체적인 위치 정보를 노출하여 개인정보 보호에 문제가 있습니다. 또한 과도한 이모티콘 사용과 과장된 표현이 포함되어 있어 신뢰성이 떨어집니다.",
            reportedBy: {
              id: 4,
              name: "이스탄불사람",
              email: "istanbul@example.com",
            },
            reportedAt: "2025-01-16T10:30:00Z",
          },
          {
            id: 2,
            reason: "SPAM",
            description: "명백한 상업적 홍보 목적의 게시물입니다. 연락처, 가격, 위치 등 광고성 정보가 과도하게 포함되어 있으며, 실제 이용 후기라기보다는 마케팅 목적으로 작성된 것으로 보입니다.",
            reportedBy: {
              id: 5,
              name: "터키현지인",
              email: "local@example.com",
            },
            reportedAt: "2025-01-17T14:45:00Z",
          },
        ],
        tags: ["한식당", "이스탄불", "맛집", "추천"],
        rating: 4,
        reviewType: "PLACE",
        location: "이스탄불 베식타스",
        publishedAt: "2025-01-11T19:30:00Z",
        createdAt: "2025-01-11T19:30:00Z",
        updatedAt: "2025-01-17T14:45:00Z",
      },
    ];

    // 더 많은 모의 데이터 생성
    const additionalPosts = Array.from({ length: 25 }, (_, i) => ({
      id: i + 6,
      title: `커뮤니티 게시물 ${i + 1}`,
      content: `게시물 내용 ${i + 1}...`,
      type: ["RECIPE", "REVIEW", "TIP", "QUESTION"][Math.floor(Math.random() * 4)] as CommunityPost["type"],
      status: ["PUBLISHED", "DRAFT", "HIDDEN", "REPORTED"][Math.floor(Math.random() * 4)] as CommunityPost["status"],
      author: {
        id: Math.floor(Math.random() * 3) + 1,
        name: `사용자 ${i + 1}`,
        email: `user${i + 1}@example.com`,
      },
      likesCount: Math.floor(Math.random() * 50),
      commentsCount: Math.floor(Math.random() * 20),
      reportsCount: Math.floor(Math.random() * 5),
      tags: [`태그${i + 1}`, "한식", "터키"],
      publishedAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    setTimeout(() => {
      setPosts([...mockPosts, ...additionalPosts]);
      setLoading(false);
    }, 1000);
  }, []);

  if (!permissions?.canManageCommunity) {
    // 임시로 권한 체크를 비활성화 - ADMIN 사용자는 모두 접근 가능
    if (false) { // permissions?.canManageContent 대신 false로 설정하여 우선 접근 허용
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h3>
            <p className="text-gray-600">커뮤니티 관리 권한이 필요합니다.</p>
          </div>
        </div>
      );
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "ALL" || post.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || post.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const displayedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = (postId: number, newStatus: CommunityPost["status"]) => {
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, status: newStatus, updatedAt: new Date().toISOString() } : post
    ));
  };

  const handleViewPost = (post: CommunityPost) => {
    setSelectedPost(post);
    setShowPostModal(true);
    setExpandedContent(false); // 모달 열 때마다 초기화
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
          <h1 className="text-2xl font-bold text-gray-900">커뮤니티 관리</h1>
          <p className="mt-2 text-gray-600">
            총 {filteredPosts.length}개의 게시물이 있습니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setStatusFilter(statusFilter === "REPORTED" ? "ALL" : "REPORTED")}
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
              statusFilter === "REPORTED"
                ? "border-orange-500 text-orange-700 bg-orange-50"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            <Flag className="h-4 w-4 mr-2" />
            {statusFilter === "REPORTED" ? "전체 게시물 보기" : `신고된 게시물 (${posts.filter(p => p.status === "REPORTED").length})`}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">게시됨</p>
              <p className="text-lg font-bold text-gray-900">
                {posts.filter(p => p.status === "PUBLISHED").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flag className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">신고됨</p>
              <p className="text-lg font-bold text-gray-900">
                {posts.filter(p => p.status === "REPORTED").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">임시저장</p>
              <p className="text-lg font-bold text-gray-900">
                {posts.filter(p => p.status === "DRAFT").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">숨김</p>
              <p className="text-lg font-bold text-gray-900">
                {posts.filter(p => p.status === "HIDDEN").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ThumbsUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">총 좋아요</p>
              <p className="text-lg font-bold text-gray-900">
                {posts.reduce((sum, p) => sum + p.likesCount, 0)}
              </p>
            </div>
          </div>
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
                placeholder="제목, 내용, 작성자로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">전체 유형</option>
              <option value="RECIPE">레시피</option>
              <option value="REVIEW">리뷰</option>
              <option value="TIP">꿀팁</option>
              <option value="QUESTION">질문</option>
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">전체 상태</option>
              <option value="PUBLISHED">게시됨</option>
              <option value="DRAFT">임시저장</option>
              <option value="HIDDEN">숨김</option>
              <option value="REPORTED">신고됨</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  게시물
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  활동
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedPosts.map((post) => {
                const StatusIcon = statusConfig[post.status].icon;
                return (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-lg">
                          {postTypeConfig[post.type].icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {post.title}
                            </h4>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${postTypeConfig[post.type].color}`}>
                              {postTypeConfig[post.type].label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {post.content}
                          </p>
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                                >
                                  <Hash className="h-2 w-2 mr-0.5" />
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-xs text-gray-400">+{post.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {post.author.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {post.author.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[post.status].color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[post.status].label}
                        </span>
                        {post.reportsCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Flag className="h-3 w-3 mr-1" />
                            신고 {post.reportsCount}건
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {post.likesCount}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {post.commentsCount}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(post.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewPost(post)}
                          className="text-blue-600 hover:text-blue-900"
                          title="게시물 상세 보기"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {post.status === "PUBLISHED" && (
                          <button
                            onClick={() => handleStatusChange(post.id, "HIDDEN")}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}

                        {post.status === "HIDDEN" && (
                          <button
                            onClick={() => handleStatusChange(post.id, "PUBLISHED")}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        {post.status === "REPORTED" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(post.id, "PUBLISHED")}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(post.id, "HIDDEN")}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {post.status === "DRAFT" && (
                          <button
                            onClick={() => handleStatusChange(post.id, "PUBLISHED")}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
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
              {startIndex + 1}-{Math.min(startIndex + postsPerPage, filteredPosts.length)} / {filteredPosts.length}개 표시
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

      {/* Post Detail Modal */}
      {showPostModal && selectedPost && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">게시물 상세 정보</h3>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {postTypeConfig[selectedPost.type].icon}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{selectedPost.title}</h1>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${postTypeConfig[selectedPost.type].color}`}>
                        {postTypeConfig[selectedPost.type].label}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedPost.status].color}`}>
                        {statusConfig[selectedPost.status].label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(selectedPost.createdAt)}
                  </div>
                  {selectedPost.publishedAt && (
                    <div className="mt-1">게시: {formatDate(selectedPost.publishedAt)}</div>
                  )}
                </div>
              </div>

              {/* Author Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">작성자 정보</h4>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{selectedPost.author.name}</div>
                    <div className="text-sm text-gray-500">{selectedPost.author.email}</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">게시물 내용</h4>
                  {selectedPost.content.length > 200 && (
                    <button
                      onClick={() => setExpandedContent(!expandedContent)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {expandedContent ? "간략히 보기" : "전체 내용 보기"}
                    </button>
                  )}
                </div>
                <div className={`prose prose-sm max-w-none transition-all duration-300 ${
                  !expandedContent && selectedPost.content.length > 200 ? "max-h-32 overflow-hidden relative" : ""
                }`}>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                  {!expandedContent && selectedPost.content.length > 200 && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
                {selectedPost.status === "REPORTED" && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">신고된 내용</p>
                        <p className="text-yellow-700 mt-1">
                          이 게시물은 {selectedPost.reportsCount}건의 신고를 받았습니다.
                          위 내용을 검토하여 커뮤니티 가이드라인 위반 여부를 판단해주세요.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info based on type */}
              {selectedPost.type === "RECIPE" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPost.difficulty && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">난이도</div>
                      <div className="text-lg font-semibold text-yellow-800">
                        {selectedPost.difficulty === "EASY" && "쉬움"}
                        {selectedPost.difficulty === "MEDIUM" && "보통"}
                        {selectedPost.difficulty === "HARD" && "어려움"}
                      </div>
                    </div>
                  )}
                  {selectedPost.cookingTime && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">조리시간</div>
                      <div className="text-lg font-semibold text-blue-800 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {selectedPost.cookingTime}분
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedPost.type === "REVIEW" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPost.rating && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">평점</div>
                      <div className="flex items-center text-lg font-semibold text-yellow-800">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        {selectedPost.rating}/5
                      </div>
                    </div>
                  )}
                  {selectedPost.location && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">위치</div>
                      <div className="text-lg font-semibold text-green-800 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedPost.location}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {selectedPost.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">태그</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center text-blue-600 mb-1">
                    <ThumbsUp className="h-5 w-5" />
                  </div>
                  <div className="text-lg font-bold text-blue-900">{selectedPost.likesCount}</div>
                  <div className="text-sm text-blue-700">좋아요</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center text-green-600 mb-1">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="text-lg font-bold text-green-900">{selectedPost.commentsCount}</div>
                  <div className="text-sm text-green-700">댓글</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center text-red-600 mb-1">
                    <Flag className="h-5 w-5" />
                  </div>
                  <div className="text-lg font-bold text-red-900">{selectedPost.reportsCount}</div>
                  <div className="text-sm text-red-700">신고</div>
                </div>
              </div>

              {/* Reports Section */}
              {selectedPost.reportsCount > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <Flag className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-orange-800">
                      이 게시물에 {selectedPost.reportsCount}건의 신고가 접수되었습니다.
                    </span>
                  </div>

                  {selectedPost.reports && selectedPost.reports.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-orange-900">신고 상세 내역:</h5>
                      {selectedPost.reports.map((report, index) => (
                        <div key={report.id} className="bg-white border border-orange-200 rounded-md p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${reportReasonConfig[report.reason].color}`}>
                                {reportReasonConfig[report.reason].label}
                              </span>
                              <span className="text-xs text-gray-500">
                                신고 #{report.id}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(report.reportedAt)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-700 mb-2">
                            {report.description}
                          </p>

                          <div className="flex items-center text-xs text-gray-500">
                            <User className="h-3 w-3 mr-1" />
                            신고자: {report.reportedBy.name} ({report.reportedBy.email})
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              {/* Status Change Buttons */}
              {selectedPost.status === "PUBLISHED" && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedPost.id, "HIDDEN");
                    setShowPostModal(false);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  숨기기
                </button>
              )}

              {selectedPost.status === "HIDDEN" && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedPost.id, "PUBLISHED");
                    setShowPostModal(false);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  게시하기
                </button>
              )}

              {selectedPost.status === "REPORTED" && (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedPost.id, "PUBLISHED");
                      setShowPostModal(false);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    승인
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedPost.id, "HIDDEN");
                      setShowPostModal(false);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    숨기기
                  </button>
                </>
              )}

              {selectedPost.status === "DRAFT" && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedPost.id, "PUBLISHED");
                    setShowPostModal(false);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  게시하기
                </button>
              )}

              <button
                onClick={() => setShowPostModal(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}