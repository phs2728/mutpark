export type BannerStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';

export type BannerPosition = 'HEADER' | 'HERO' | 'SIDEBAR' | 'FOOTER' | 'MODAL' | 'FLOATING';

export interface Banner {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  position: BannerPosition;
  status: BannerStatus;
  startDate: string;
  endDate: string;
  deviceType?: string;
  priority: number;
  viewCount: number;
  clickCount: number;
  locale: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy?: number;
}

export interface BannerDisplayData {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  position: BannerPosition;
  status: BannerStatus;
  startDate: string;
  endDate: string;
  deviceType?: string;
  priority: number;
  viewCount: number;
  clickCount: number;
  locale: string;
}

export const BANNER_STATUS_OPTIONS = [
  { value: "ACTIVE" as const, label: "활성", color: "bg-green-100 text-green-800" },
  { value: "PAUSED" as const, label: "일시정지", color: "bg-gray-100 text-gray-800" },
  { value: "EXPIRED" as const, label: "만료", color: "bg-red-100 text-red-800" },
  { value: "DRAFT" as const, label: "초안", color: "bg-yellow-100 text-yellow-800" }
] as const;

export const BANNER_POSITION_OPTIONS = [
  { value: "HEADER" as const, label: "헤더", color: "bg-blue-100 text-blue-800" },
  { value: "HERO" as const, label: "메인 배너", color: "bg-purple-100 text-purple-800" },
  { value: "SIDEBAR" as const, label: "사이드바", color: "bg-green-100 text-green-800" },
  { value: "FOOTER" as const, label: "푸터", color: "bg-gray-100 text-gray-800" },
  { value: "MODAL" as const, label: "모달/팝업", color: "bg-orange-100 text-orange-800" },
  { value: "FLOATING" as const, label: "플로팅", color: "bg-red-100 text-red-800" }
] as const;