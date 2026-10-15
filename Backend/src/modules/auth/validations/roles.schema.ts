import { z } from "zod";

const nameRegex = /^[A-Za-z]+([ '-][A-Za-z]+)*$/;

export const addRoleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Role name is required")
      .max(50, "Role name is too long")
      .regex(nameRegex, {
        message: "Invalid format for role name",
      }),
    description: z.string().optional(),
  }),
});

export const assignRolesSchema = z.object({
  body: z.object({
    userToAssign: z.uuid(),

    roles: z.array(z.uuid()).min(1, "At least one role ID is required"),
  }),
});

export const deleteRoleSchema = z.object({
  params: z
    .object({
      roleId: z.uuid(),
    })
    .strict(),
});

export const editRoleSchema = z.object({
  params: z
    .object({
      roleId: z.uuid(),
    })
    .strict(),
  body: z
    .object({
      name: z
        .string()
        .min(1, "Role name is required")
        .max(50, "Role name is too long")
        .regex(nameRegex, {
          message: "Invalid format for role name",
        }),
      description: z.string().optional(),
    })
    .strict(),
});

export const getAllPermissionsOfRoleSchema = z.object({
  params: z.object({
    roleId: z.string().uuid("Invalid roleId format"),
  }),
});

export const assignPermissionsToRoleSchema = z.object({
  params: z.object({
    roleId: z.string().uuid("Invalid roleId format"),
  }),
});
