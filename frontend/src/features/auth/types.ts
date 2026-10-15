export {};
export type SigninInput = { email: string; password: string };

export type SignupInput = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};
export type ForgotPasswordInput = { email: string };
export type ResetPasswordInput = { token: string; password: string; confirmPassword: string };
export type ChangePasswordInput = { oldPassword: string; newPassword: string; confirmNewPassword: string };

export type ApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
  accessToken?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: "INTERNAL" | "CUSTOMER";
};

export type SigninResponse = ApiResponse<{ user: AuthUser }>;
