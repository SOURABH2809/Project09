"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <section className="max-w-lg text-center">
        <p className="text-8xl font-black tracking-tight text-indigo-600">404</p>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">
          The page you are looking for does not exist or may have been moved.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-8 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Go back
        </button>
      </section>
    </main>
  );
}
