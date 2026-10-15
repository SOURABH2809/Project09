import z from "zod";
import { PAGINATION_RANGE } from "../constants/user.constant.js";
import { AccountStatus } from "../types/user.types.js";

const nameRegex = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;

export const getAllUserSchema = z.object({
  query: z
    .object({
      email: z.string().optional(),
      name: z.string().optional(),
      status: z.enum(["true", "false"]).default("true").optional(),
      page: z
        .string()
        .regex(/^[1-9]\d*$/)
        .transform(Number)
        .optional(),
      limit: z.enum(PAGINATION_RANGE).transform(Number).optional(),
      groups: z
        .string()
        .transform((val) => val.split(",").map((v) => v.trim()))
        .refine((arr) => arr.length > 0, "At least one group id is required")
        .refine(
          (arr) => arr.every((id) => z.uuid().safeParse(id).success),
          "One or more group ids are invalid UUIDs",
        )
        .optional(),
      sortBy: z.enum(["createdAt", "email", "firstName", "lastName", "accountActive"]).optional(),

      orderBy: z.enum(["asc", "desc"]).optional(),
    })
    .strict(),
});

export const updateAccountStatusSchema = z.object({
  params: z.object({
    userId: z.string().uuid("Invalid user ID"),
  }),
  body: z.object({
    status: z.nativeEnum(AccountStatus, {
      // Using nativeEnum
      message: "Status must be 'active' or 'inactive'",
    }),
  }),
});

export const editUserProfileSchema = z.object({
  body: z
    .object({
      firstName: z
        .string()
        .min(1, "First name is required")
        .max(50, "First name is too long")
        .regex(nameRegex, {
          message: "Invalid format for first name",
        })
        .optional(),
      lastName: z
        .string()
        .min(1, "Last name is required")
        .max(50, "Last name is too long")
        .regex(nameRegex, {
          message: "Invalid format for last name",
        })
        .optional(),
      profileImageUrl: z.string().url().optional().or(z.literal("")),
    })
    .refine(
      (data) =>
        data.firstName !== undefined ||
        data.lastName !== undefined ||
        data.profileImageUrl !== undefined,
      {
        message: "At least one field must be provided",
      },
    )
    .strict(),
  query: z.object({}).strict().optional(),
  params: z.object({}).strict().optional(),
});

export const editUserProfileByAdminSchema = z.object({
  params: z.object({
    userId: z.string().uuid("Invalid user ID"),
  }),
  body: z
    .object({
      firstName: z
        .string()
        .max(50, "First name is too long")
        .regex(nameRegex, {
          message: "Invalid format for first name",
        })
        .optional(),
      lastName: z
        .string()
        .max(50, "Last name is too long")
        .regex(nameRegex, {
          message: "Invalid format for last name",
        })
        .optional(),
      // TODO: change profileImageUrl to file
      profileImageUrl: z.string().optional().or(z.literal("")),
    })
    .refine(
      (data) =>
        data.firstName !== undefined ||
        data.lastName !== undefined ||
        data.profileImageUrl !== undefined,
      {
        message: "At least one field must be provided",
      },
    ),
});

export const deleteUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid("Invalid user ID"),
  }),
});

export const restoreUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid("Invalid user ID"),
  }),
});

export const assignGroupsToUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid("Invalid userId format"),
  }),
  body: z.object({
    groups: z
      .array(z.string().uuid("Invalid group id"))
      .min(1, "At least one group must be provided"),
  }),
});

export const getGroupsOfUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid("Invalid userId format"),
  }),
});
