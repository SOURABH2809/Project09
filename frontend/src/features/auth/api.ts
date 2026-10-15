export {};
import { apiClient } from "@/lib/api/client";
import type { ApiResponse, SigninInput, SignupInput, SigninResponse, ForgotPasswordInput, ResetPasswordInput, ChangePasswordInput } from "./types";

export async function signin(input: SigninInput) {
  const response = await apiClient.post<SigninResponse>("/auth/signin", input);
  return response.data;
}

export async function signup(input: SignupInput) {
  const response = await apiClient.post<ApiResponse>("/auth/signup", input);
  return response.data;
}

export async function logout() {
  const response = await apiClient.post<ApiResponse>("/auth/logout");
  return response.data;
}
export async function forgotPassword(input: ForgotPasswordInput) { return (await apiClient.post<ApiResponse>("/auth/forgot-password", input)).data; }
export async function resetPassword(input: ResetPasswordInput) { return (await apiClient.post<ApiResponse>("/auth/reset-password", input)).data; }
export async function changePassword(input: ChangePasswordInput) { return (await apiClient.put<ApiResponse>("/auth/change-password", input)).data; }
