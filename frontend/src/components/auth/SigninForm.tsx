"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api/client";
import { signinSchema } from "@/features/auth/schemas";
import { signin } from "@/features/auth/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

export default function SigninForm() {
  const router = useRouter();
  const signinMutation = useMutation({ mutationFn: signin });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = signinSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    try {
      const response = await signinMutation.mutateAsync(result.data);
      if (response.accessToken) window.localStorage.setItem("accessToken", response.accessToken);
      toast.success("Signed in successfully.");
      const userType = response.data?.user?.userType;
      router.replace(String(userType).toUpperCase() === "INTERNAL" ? "/admin-panel" : "/home");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Storefront
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to continue to your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" aria-label="Sign-in form">
          <div>
            <label htmlFor="signin-email" className="mb-2 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="signin-password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="signin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? "◉" : "◌"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={signinMutation.isPending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {signinMutation.isPending ? "Signing in…" : "Sign in"}
          </button>
          {signinMutation.isError && (
            <p role="alert" className="text-sm text-red-600">
              {getApiErrorMessage(signinMutation.error)}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
