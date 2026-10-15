export {};
import { z } from "zod";

export const signinSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: z.email("Enter a valid email address"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain a special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const password = z.string().min(8).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/);
export const forgotPasswordSchema = z.object({ email: z.email("Enter a valid email address") });
export const resetPasswordSchema = z.object({ token: z.string().min(20), password, confirmPassword: z.string() }).refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export const changePasswordSchema = z.object({ oldPassword: z.string().min(1), newPassword: password, confirmNewPassword: z.string() }).refine((v) => v.newPassword === v.confirmNewPassword, { path: ["confirmNewPassword"], message: "Passwords do not match" });
