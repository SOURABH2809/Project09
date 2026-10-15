"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";

export default function AuthRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const accessToken = window.localStorage.getItem("accessToken");
    if (!accessToken) {
      setChecking(false);
      return;
    }

    const redirectFromMe = () =>
      apiClient.get<{ data?: { user?: { userType?: string } }; user?: { userType?: string } }>("/auth/me").then(({ data }) => {
        const user = data.data?.user ?? data.user;
        router.replace(String(user?.userType).toUpperCase() === "INTERNAL" ? "/admin-panel" : "/home");
      });

    redirectFromMe().catch(async () => {
      try {
        const { data } = await apiClient.post<{ data?: { accessToken?: string } }>("/auth/refresh");
        const refreshedToken = data.data?.accessToken;
        if (!refreshedToken) throw new Error("Refresh token unavailable");
        window.localStorage.setItem("accessToken", refreshedToken);
        await redirectFromMe();
      } catch {
        window.localStorage.removeItem("accessToken");
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) return null;
  return <>{children}</>;
}
