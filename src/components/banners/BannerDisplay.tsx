"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { BannerDisplayData } from "@/types/banner";

interface BannerDisplayProps {
  position: BannerDisplayData['position'];
  locale?: string;
  deviceType?: 'all' | 'desktop' | 'mobile' | 'tablet';
  className?: string;
  maxItems?: number;
}

export function BannerDisplay({
  position,
  locale = 'tr',
  deviceType = 'all',
  className = '',
  maxItems = 3
}: BannerDisplayProps) {
  const [banners, setBanners] = useState<BannerDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [closedBanners, setClosedBanners] = useState<Set<number>>(new Set());

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        position,
        status: 'ACTIVE',
        _t: Date.now().toString()
      });

      const response = await fetch(`/api/banners?${params}`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }

      const data = await response.json();
      setBanners(data.banners || []);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [position]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners, locale]);

  // Force refresh every 30 seconds to catch status changes
  useEffect(() => {
    const interval = setInterval(fetchBanners, 30000);
    return () => clearInterval(interval);
  }, [fetchBanners]);

  const handleBannerClick = async (bannerId: number, linkUrl?: string) => {
    // Track click
    try {
      await fetch(`/api/banners/${bannerId}/click`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error tracking banner click:', error);
    }

    // Navigate if linkUrl exists
    if (linkUrl) {
      window.location.href = linkUrl;
    }
  };

  const handleCloseBanner = (bannerId: number) => {
    setClosedBanners(prev => new Set([...prev, bannerId]));
  };

  // Filter banners by device type and active status
  const activeBanners = banners
    .filter(banner => {
      // Check if banner is closed
      if (closedBanners.has(banner.id)) return false;

      // Check device type
      if (deviceType !== 'all' && banner.deviceType && banner.deviceType !== 'all' && banner.deviceType !== deviceType) {
        return false;
      }

      // Check date range
      const now = new Date();
      const start = new Date(banner.startDate);
      const end = new Date(banner.endDate);

      return now >= start && now <= end;
    })
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxItems);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-32"></div>
      </div>
    );
  }

  if (activeBanners.length === 0) {
    // For HERO position, show fallback content if no banners
    if (position === 'HERO') {
      // Hide the fallback hero section via CSS
      if (typeof window !== 'undefined') {
        const fallback = document.querySelector('.hero-fallback');
        if (fallback) {
          (fallback as HTMLElement).style.display = 'block';
        }
      }
    }
    return null;
  }

  // If we have HERO banners, hide the fallback
  if (position === 'HERO' && typeof window !== 'undefined') {
    const fallback = document.querySelector('.hero-fallback');
    if (fallback) {
      (fallback as HTMLElement).style.display = 'none';
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {activeBanners.map((banner) => (
        <BannerItem
          key={banner.id}
          banner={banner}
          position={position}
          onClose={() => handleCloseBanner(banner.id)}
          onClick={() => handleBannerClick(banner.id, banner.linkUrl)}
        />
      ))}
    </div>
  );
}

interface BannerItemProps {
  banner: BannerDisplayData;
  position: BannerDisplayData['position'];
  onClose: () => void;
  onClick: () => void;
}

function BannerItem({ banner, position, onClose, onClick }: BannerItemProps) {
  const getBannerStyles = () => {
    switch (position) {
      case 'HEADER':
        return 'bg-blue-600 text-white py-2 px-4 text-center text-sm';
      case 'HERO':
        return 'relative overflow-hidden rounded-xl shadow-lg';
      case 'SIDEBAR':
        return 'bg-white border border-gray-200 rounded-lg shadow-sm p-4';
      case 'FOOTER':
        return 'bg-gray-100 border-t border-gray-200 py-4 px-6 text-center';
      case 'MODAL':
        return 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
      case 'FLOATING':
        return 'fixed bottom-4 right-4 z-40 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4';
      default:
        return 'bg-white border border-gray-200 rounded-lg p-4';
    }
  };

  const getCloseButtonStyles = () => {
    switch (position) {
      case 'MODAL':
      case 'FLOATING':
        return 'absolute top-2 right-2 p-1 bg-gray-100 hover:bg-gray-200 rounded-full';
      case 'HEADER':
        return 'ml-2 p-1 hover:bg-blue-700 rounded-full';
      default:
        return 'absolute top-2 right-2 p-1 bg-gray-100 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity';
    }
  };

  const renderBannerContent = () => {
    const content = (
      <div className={`group relative ${getBannerStyles()}`}>
        {/* Close button for closable banners */}
        {(position === 'MODAL' || position === 'FLOATING' || position === 'HEADER') && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className={getCloseButtonStyles()}
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Banner content based on position */}
        {position === 'HEADER' && (
          <div className="flex items-center justify-center">
            <span>{banner.title}</span>
          </div>
        )}

        {position === 'HERO' && (
          <>
            <div className="relative h-64 md:h-80">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">{banner.title}</h2>
                  {banner.description && (
                    <p className="text-lg md:text-xl mb-6 opacity-90">{banner.description}</p>
                  )}
                  {banner.linkUrl && (
                    <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                      자세히 보기
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {(position === 'SIDEBAR' || position === 'FOOTER' || position === 'FLOATING') && (
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{banner.title}</h3>
              {banner.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{banner.description}</p>
              )}
            </div>
          </div>
        )}

        {position === 'MODAL' && (
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <div className="text-center">
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{banner.title}</h3>
              {banner.description && (
                <p className="text-gray-600 mb-4">{banner.description}</p>
              )}
              {banner.linkUrl && (
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 transition-colors">
                  자세히 보기
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );

    // Wrap with Link if linkUrl exists and it's not a modal (modal has its own button)
    if (banner.linkUrl && position !== 'MODAL') {
      return (
        <Link
          href={banner.linkUrl}
          onClick={(e) => {
            e.preventDefault();
            onClick();
          }}
          className="block"
        >
          {content}
        </Link>
      );
    }

    // For modals, handle click on the button
    if (position === 'MODAL') {
      return (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {content}
        </div>
      );
    }

    return (
      <div
        onClick={onClick}
        className={banner.linkUrl ? 'cursor-pointer' : ''}
      >
        {content}
      </div>
    );
  };

  return renderBannerContent();
}