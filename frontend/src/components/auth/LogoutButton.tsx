"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/features/auth/api";
import { toast } from "react-toastify";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");
    } catch {
      // Clear the local session even when the server session has already expired.
      toast.info("Your local session was cleared.");
    } finally {
      window.localStorage.removeItem("accessToken");
      router.replace("/signin");
    }
  };

  return (
    <button type="button" onClick={handleLogout} className={className}>
      Log out
    </button>
  );
}
