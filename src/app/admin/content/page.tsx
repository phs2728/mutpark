"use client";

import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import Link from "next/link";
import {
  FileText,
  Image,
  Layout,
  Globe,
  Edit,
  Plus,
  Eye,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";

const contentAreas = [
  {
    id: "banners",
    title: "배너 관리",
    description: "홈페이지 메인 배너 및 프로모션 배너를 관리합니다.",
    icon: Image,
    href: "/admin/content/banners",
    stats: { total: 8, active: 5, draft: 3 },
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "pages",
    title: "페이지 관리",
    description: "정적 페이지와 정책 페이지를 관리합니다.",
    icon: Layout,
    href: "/admin/content/pages",
    stats: { total: 12, active: 10, draft: 2 },
    color: "bg-green-100 text-green-600",
  },
  {
    id: "announcements",
    title: "공지사항",
    description: "사이트 공지사항과 업데이트 소식을 관리합니다.",
    icon: FileText,
    href: "/admin/content/announcements",
    stats: { total: 15, active: 12, draft: 3 },
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "translations",
    title: "다국어 콘텐츠",
    description: "다국어 번역 콘텐츠를 관리합니다.",
    icon: Globe,
    href: "/admin/content/translations",
    stats: { total: 245, active: 220, draft: 25 },
    color: "bg-orange-100 text-orange-600",
  },
];

const recentActivities = [
  {
    id: "1",
    type: "banner",
    action: "생성",
    title: "겨울 할인 이벤트 배너",
    user: "김관리자",
    timestamp: "2025-01-23T10:30:00Z",
  },
  {
    id: "2",
    type: "page",
    action: "수정",
    title: "개인정보처리방침",
    user: "박편집자",
    timestamp: "2025-01-23T09:15:00Z",
  },
  {
    id: "3",
    type: "announcement",
    action: "발행",
    title: "신규 배송 서비스 안내",
    user: "이운영자",
    timestamp: "2025-01-22T16:45:00Z",
  },
  {
    id: "4",
    type: "translation",
    action: "번역",
    title: "상품 카테고리 (터키어)",
    user: "번역팀",
    timestamp: "2025-01-22T14:20:00Z",
  },
];

export default function AdminContent() {
  const { permissions } = useAdminAuth();

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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">콘텐츠 관리</h1>
          <p className="mt-2 text-gray-600">
            웹사이트의 모든 콘텐츠를 중앙에서 관리합니다.
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 mr-3">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {contentAreas.reduce((sum, area) => sum + area.stats.total, 0)}
              </div>
              <div className="text-sm text-gray-600">총 콘텐츠</div>
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
                {contentAreas.reduce((sum, area) => sum + area.stats.active, 0)}
              </div>
              <div className="text-sm text-gray-600">활성 콘텐츠</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100 mr-3">
              <Edit className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {contentAreas.reduce((sum, area) => sum + area.stats.draft, 0)}
              </div>
              <div className="text-sm text-gray-600">임시보관</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 mr-3">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">4</div>
              <div className="text-sm text-gray-600">오늘 수정</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contentAreas.map((area) => {
          const Icon = area.icon;
          return (
            <Link
              key={area.id}
              href={area.href}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${area.color} mr-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {area.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{area.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{area.stats.total}</div>
                  <div className="text-xs text-gray-500">전체</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{area.stats.active}</div>
                  <div className="text-xs text-gray-500">활성</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600">{area.stats.draft}</div>
                  <div className="text-xs text-gray-500">임시보관</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-white">
                    {activity.type === 'banner' && <Image className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'page' && <Layout className="h-4 w-4 text-green-600" />}
                    {activity.type === 'announcement' && <FileText className="h-4 w-4 text-purple-600" />}
                    {activity.type === 'translation' && <Globe className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      <span className="text-blue-600">{activity.action}</span> • {activity.title}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <User className="h-3 w-3 mr-1" />
                      {activity.user}
                      <span className="mx-2">•</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatTimestamp(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/admin/content/banners/new"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600 group-hover:text-blue-600">새 배너</div>
            </div>
          </Link>

          <Link
            href="/admin/content/pages/new"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600 group-hover:text-green-600">새 페이지</div>
            </div>
          </Link>

          <Link
            href="/admin/content/announcements/new"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600 group-hover:text-purple-600">새 공지사항</div>
            </div>
          </Link>

          <Link
            href="/admin/content/translations"
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group"
          >
            <div className="text-center">
              <Globe className="h-8 w-8 text-gray-400 group-hover:text-orange-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-600 group-hover:text-orange-600">번역 관리</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}