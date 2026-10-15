"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api/client";
import { signupSchema } from "@/features/auth/schemas";
import { useSignupMutation } from "@/features/auth/hooks";
import { toast } from "react-toastify";

export default function SignupForm() {
  const router = useRouter();
  const signupMutation = useSignupMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = signupSchema.safeParse({
      email: formData.get("email"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!result.success) {
      setValidationMessage(result.error.issues[0]?.message ?? "Please check the form.");
      toast.error(result.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setValidationMessage(null);
    setSuccessMessage(null);

    try {
      await signupMutation.mutateAsync(result.data);
      setSuccessMessage("Account created successfully. Redirecting to sign in…");
      toast.success("Account created successfully.");
      window.setTimeout(() => router.push("/signin"), 1200);
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your details to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" aria-label="Signup form">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="signup-first-name" className="mb-2 block text-sm font-medium text-slate-700">
                First name
              </label>
              <input
                id="signup-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="First name"
              />
            </div>

            <div>
              <label htmlFor="signup-last-name" className="mb-2 block text-sm font-medium text-slate-700">
                Last name
              </label>
              <input
                id="signup-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-slate-700">
              Work email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Create a password"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700">
                {showPassword ? "◉" : "◌"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="signup-confirm-password" className="mb-2 block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Repeat your password"
              />
              <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700">
                {showConfirmPassword ? "◉" : "◌"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {signupMutation.isPending ? "Creating account…" : "Create account"}
          </button>
          {signupMutation.isError && (
            <p role="alert" className="text-sm text-red-600">
              {getApiErrorMessage(signupMutation.error)}
            </p>
          )}
          {validationMessage && <p role="alert" className="text-sm text-red-600">{validationMessage}</p>}
          {successMessage && <p role="status" className="text-sm text-emerald-600">{successMessage}</p>}
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
