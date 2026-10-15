import type { ReactNode } from "react";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CustomerHeader from "@/components/customer/CustomerHeader";
import ProtectedRouteGuard from "@/components/auth/ProtectedRouteGuard";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CustomerHeader />
      <ProtectedRouteGuard requiredUserType="CUSTOMER">
        <main className="flex-1">{children}</main>
      </ProtectedRouteGuard>
      <CustomerFooter />
    </div>
  );
}
