"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

interface UploadProgress {
  [key: string]: number;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeInMB = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  className = "",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `지원되지 않는 파일 형식입니다. (${acceptedTypes.join(", ")})`;
    }

    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `파일 크기가 너무 큽니다. (최대 ${maxSizeInMB}MB)`;
    }

    return null;
  };

  const uploadToImageKit = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("folder", "products");

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: percentComplete
          }));
        }
      });

      xhr.addEventListener("load", () => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });

        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url);
          } catch (error) {
            reject(new Error("Invalid response format"));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
        reject(new Error("Upload failed"));
      });

      xhr.open("POST", "/api/upload/image");
      xhr.send(formData);
    });
  };

  const handleFiles = async (files: FileList) => {
    setError(null);

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (fileArray.length > remainingSlots) {
      setError(`최대 ${maxImages}개까지만 업로드할 수 있습니다.`);
      return;
    }

    // 파일 유효성 검사
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setUploading(true);

    try {
      const uploadPromises = fileArray.map(uploadToImageKit);
      const uploadedUrls = await Promise.all(uploadPromises);

      onImagesChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error("Upload error:", error);
      setError("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [images, maxImages, onImagesChange]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow same file upload
    e.target.value = "";
  }, [images, maxImages, onImagesChange]);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          transition-colors duration-200 ease-in-out cursor-pointer
          ${isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
          ${uploading ? "pointer-events-none opacity-50" : ""}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          accept={acceptedTypes.join(",")}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <Upload className={`h-12 w-12 mb-4 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
          <p className="text-lg font-medium text-gray-900 mb-2">
            이미지를 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, WebP 파일 (최대 {maxSizeInMB}MB)
          </p>
          <p className="text-xs text-gray-400 mt-1">
            최대 {maxImages}개까지 업로드 가능 ({maxImages - images.length}개 남음)
          </p>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">업로드 중...</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {fileName}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", index.toString());
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                if (fromIndex !== index) {
                  reorderImages(fromIndex, index);
                }
              }}
            >
              <img
                src={imageUrl}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Image Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Main Image Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  대표
                </div>
              )}

              {/* Order Number */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      {images.length > 0 && (
        <div className="text-sm text-gray-500 space-y-1">
          <p>• 첫 번째 이미지가 대표 이미지로 사용됩니다</p>
          <p>• 이미지를 드래그하여 순서를 변경할 수 있습니다</p>
          <p>• 이미지 위에 마우스를 올려 삭제 버튼을 확인하세요</p>
        </div>
      )}
    </div>
  );
}