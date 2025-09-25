"use client";

import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminAuthProvider>
      <div className="admin-layout bg-gray-50 flex h-screen overflow-hidden">
        <div className="admin-sidebar flex-shrink-0">
          <AdminSidebar />
        </div>
        <div className="admin-main-content flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="admin-content flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}