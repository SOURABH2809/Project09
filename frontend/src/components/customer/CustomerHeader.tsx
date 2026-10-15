"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";

export default function CustomerHeader() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/home" className="text-xl font-bold tracking-tight text-indigo-600">
          Storefront
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/home" className="hover:text-indigo-600">Home</Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              className="hover:text-indigo-600"
            >
              My profile
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full z-10 mt-3 w-44 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                <LogoutButton className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" />
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
