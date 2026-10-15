import type { ReactNode } from "react";
import AuthRouteGuard from "@/components/auth/AuthRouteGuard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthRouteGuard><main>{children}</main></AuthRouteGuard>;
}
