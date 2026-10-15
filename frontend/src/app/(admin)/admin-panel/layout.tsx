import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ProtectedRouteGuard from "@/components/auth/ProtectedRouteGuard";

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <ProtectedRouteGuard requiredUserType="INTERNAL">
        <main className="min-w-0 flex-1">{children}</main>
      </ProtectedRouteGuard>
    </div>
  );
}
