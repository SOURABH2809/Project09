"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";

type UserType = "INTERNAL" | "CUSTOMER";

export default function ProtectedRouteGuard({
  children,
  requiredUserType,
}: {
  children: ReactNode;
  requiredUserType: UserType;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const redirectToSignin = () => {
      window.localStorage.removeItem("accessToken");
      router.replace("/signin");
    };

    const verifyUser = async () => {
      try {
        let response;
        try {
          response = await apiClient.get<{ data?: { user?: { userType?: string } } }>("/auth/me");
        } catch {
          const refreshResponse = await apiClient.post<{ data?: { accessToken?: string } }>(
            "/auth/refresh",
          );
          const accessToken = refreshResponse.data.data?.accessToken;
          if (!accessToken) throw new Error("Session expired");
          window.localStorage.setItem("accessToken", accessToken);
          response = await apiClient.get<{ data?: { user?: { userType?: string } } }>("/auth/me");
        }

        const userType = response.data.data?.user?.userType?.toUpperCase();
        if (userType !== requiredUserType) {
          router.replace(userType === "INTERNAL" ? "/admin-panel" : "/home");
          return;
        }

        setChecking(false);
      } catch {
        redirectToSignin();
      }
    };

    verifyUser();
  }, [requiredUserType, router]);

  if (checking) return null;
  return <>{children}</>;
}
