import { z } from "zod";

const nameRegex = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").min(5),

    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name is too long")
      .regex(nameRegex, {
        message: "Invalid format for first name",
      }),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name is too long")
      .regex(nameRegex, {
        message: "Invalid format for last name",
      }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string(),
    profileImage: z.string().optional(),

    customerId: z.uuid("Invalid customerId format").optional(),
    customerName: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const signinSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").min(5),

    password: z.string().min(1, "Password is required"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const checkExistingAccountSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(20, "Token must be at least 20 characters"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(12, "Password must be at most 12 characters")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
        .refine((val) => !/\s/.test(val), {
          message: "Password must not contain spaces",
        }),

      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      oldPassword: z.string().min(1, "Old password is required"),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters")
        .max(12, "New password must be at most 12 characters")
        .regex(/[a-z]/, "New password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
        .regex(/[0-9]/, "New password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "New password must contain at least one special character")
        .refine((val) => !/\s/.test(val), {
          message: "New password must not contain spaces",
        }),
      confirmNewPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "Passwords do not match",
      path: ["confirmNewPassword"],
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
      message: "New password cannot be the same as your current password",
      path: ["newPassword"],
    }),
});

export const impersonateLoginSchema = z.object({
  body: z.object({
    userId: z.string().uuid("Invalid userId format"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const exitImpersonationSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
