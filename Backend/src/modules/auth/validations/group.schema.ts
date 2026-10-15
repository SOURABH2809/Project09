import { z } from "zod";

const nameRegex = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;

export const createUserGroupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Group name is required")
      .max(50, "Group name must be less than 50 characters")
      .regex(nameRegex, {
        message: "Invalid format for group name",
      }),

    description: z.string().max(255).optional().nullable(),
  }),
});

export const assignUsersToGroupSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Invalid groupId format"),
  }),
  body: z.object({
    users: z.array(z.string().uuid("Invalid userId")).min(1, "At least one user must be assigned"),
  }),
});

export const updateUserGroupSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Invalid groupId format"),
  }),
  body: z
    .object({
      name: z
        .string()
        .max(50, "Group name must be less than 50 characters")
        .regex(nameRegex, {
          message: "Invalid format for group name",
        })
        .optional(),
      description: z.string().max(255).optional().nullable(),
    })
    .refine((data) => data.name !== undefined || data.description !== undefined, {
      message: "At least one field must be updated",
    }),
});

export const deleteUserGroupSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Invalid groupId format"),
  }),
});

export const getUserGroupWithUsersSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Invalid groupId format"),
  }),
});

export const assignRolesToGroupSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Invalid groupId format"),
  }),
  body: z.object({
    roles: z.array(z.string().uuid("Invalid roleId")).min(1, "At least one role must be assigned"),
  }),
});

export const getRolesOfGroupSchema = z.object({
  params: z.object({
    groupId: z.string().uuid("Invalid groupId format"),
  }),
});
