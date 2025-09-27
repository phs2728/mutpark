"use client";

import { useState } from "react";
import { LazyImage } from "@/components/ui/LazyImage";
import { resolveImageUrl } from "@/lib/imagekit";

interface ProductImageGalleryProps {
  images: Array<{
    url: string;
    altText?: string;
  }>;
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // 이미지가 없는 경우 기본 이미지 사용
  const displayImages = images.length > 0 ? images : [{ url: "", altText: productName }];

  const mainImage = resolveImageUrl(displayImages[selectedImage]?.url, { width: 800, quality: 85 });
  const thumbnailImages = displayImages.map((img, index) => ({
    ...img,
    url: resolveImageUrl(img.url, { width: 120, quality: 75 }),
    isSelected: index === selectedImage
  }));

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
    setIsZoomed(false);
  };

  const handleMainImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleImageClick(index);
    }
  };

  return (
    <div className="space-y-4">
      {/* 메인 이미지 */}
      <div className="relative">
        <div
          className={`relative bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in transition-all duration-300 ${
            isZoomed ? "cursor-zoom-out" : ""
          }`}
          style={{ height: isZoomed ? "600px" : "400px" }}
          onClick={handleMainImageClick}
        >
          {mainImage ? (
            <LazyImage
              src={mainImage}
              alt={displayImages[selectedImage]?.altText || productName}
              fill
              sizes={isZoomed ? "100vw" : "(min-width: 1024px) 50vw, 100vw"}
              className={`object-cover transition-transform duration-300 ${
                isZoomed ? "scale-150 cursor-move" : "hover:scale-105"
              }`}
              priority={selectedImage === 0}
              placeholder="blur"
              quality={85}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 bg-gray-100">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">{productName}</p>
              </div>
            </div>
          )}
        </div>

        {/* 확대/축소 버튼 */}
        {mainImage && (
          <button
            onClick={handleMainImageClick}
            className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-colors duration-200"
            aria-label={isZoomed ? "축소하기" : "확대하기"}
          >
            {isZoomed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-3" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            )}
          </button>
        )}

        {/* 이미지 카운터 */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {selectedImage + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* 썸네일 이미지들 */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {thumbnailImages.map((img, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                img.isSelected
                  ? "ring-2 ring-red-500 ring-offset-2"
                  : "hover:ring-2 hover:ring-gray-300"
              }`}
              aria-label={`이미지 ${index + 1} 선택`}
            >
              {img.url ? (
                <LazyImage
                  src={img.url}
                  alt={img.altText || `${productName} 이미지 ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                  placeholder="blur"
                  quality={75}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}