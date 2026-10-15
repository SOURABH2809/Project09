"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";

const publicRoutes = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/change-password",
  "/unauthorized",
];

export default function GlobalRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const [checking, setChecking] = useState(!isPublicRoute);

  useEffect(() => {
    if (isPublicRoute) {
      setChecking(false);
      return;
    }

    setChecking(true);

    const verifySession = async () => {
      try {
        let response;
        try {
          response = await apiClient.get<{ data?: { user?: { userType?: string } } }>("/auth/me");
        } catch {
          const refreshed = await apiClient.post<{ data?: { accessToken?: string } }>("/auth/refresh");
          const token = refreshed.data.data?.accessToken;
          if (!token) throw new Error("Session expired");
          window.localStorage.setItem("accessToken", token);
          response = await apiClient.get<{ data?: { user?: { userType?: string } } }>("/auth/me");
        }

        const userType = response.data.data?.user?.userType?.toUpperCase();
        if (pathname.startsWith("/admin-panel") && userType !== "INTERNAL") {
          router.replace("/home");
          return;
        }
        if (pathname.startsWith("/home") && userType !== "CUSTOMER") {
          router.replace("/admin-panel");
          return;
        }
        setChecking(false);
      } catch {
        window.localStorage.removeItem("accessToken");
        router.replace("/signin");
      }
    };

    verifySession();
  }, [isPublicRoute, pathname, router]);

  if (checking) return null;
  return <>{children}</>;
}
