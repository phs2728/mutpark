"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

export default function AdminRoot() {
  const router = useRouter();
  const { user, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // 관리자가 로그인되어 있으면 대시보드로 리다이렉트
        router.replace("/admin/dashboard");
      } else {
        // 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
        router.replace("/admin/login");
      }
    }
  }, [user, loading, router]);

  // 로딩 중이거나 리다이렉트 중일 때 표시할 화면
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">관리자 페이지로 이동 중...</p>
      </div>
    </div>
  );
}