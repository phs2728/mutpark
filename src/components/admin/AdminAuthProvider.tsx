"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminUser, AdminPermissions, getAdminPermissions } from "@/lib/admin-auth";

interface AdminAuthContextType {
  user: AdminUser | null;
  permissions: AdminPermissions | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Admin user data:", data.user);
        const permissions = getAdminPermissions(data.user.role);
        console.log("Admin permissions:", permissions);
        setUser(data.user);
        setPermissions(permissions);
      } else {
        // 로그인 페이지가 아닌 경우에만 리다이렉트
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
        setUser(null);
        setPermissions(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      if (pathname !== "/admin/login") {
        router.push("/admin/login");
      }
      setUser(null);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setPermissions(null);
      router.push("/admin/login");
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // 로그인 페이지는 인증 없이 렌더링
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminAuthContext.Provider value={{ user, permissions, loading, logout }}>
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">인증 확인 중...</p>
          </div>
        </div>
      ) : !user ? (
        null // 리다이렉트 처리 중
      ) : (
        children
      )}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}