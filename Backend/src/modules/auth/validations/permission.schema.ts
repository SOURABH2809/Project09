import { z } from "zod";

export const createPermissionSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Permission name is required").max(100),

    normalizedName: z.string().min(1, "Normalized name is required").max(100),

    description: z.string().max(255).optional().nullable(),
  }),
});

export const getPermissionByIdSchema = z.object({
  params: z.object({
    permissionId: z.string().uuid("Invalid permissionId format"),
  }),
});

export const updatePermissionSchema = z.object({
  params: z.object({
    permissionId: z.string().uuid("Invalid permissionId format"),
  }),
  body: z
    .object({
      name: z.string().min(1).max(100).optional(),

      normalizedName: z.string().min(1).max(100).optional(),

      description: z.string().max(255).optional().nullable(),
    })
    .refine(
      (data) =>
        data.name !== undefined ||
        data.normalizedName !== undefined ||
        data.description !== undefined,
      {
        message: "At least one field must be updated",
      },
    ),
});

export const deletePermissionSchema = z.object({
  params: z.object({
    permissionId: z.string().uuid("Invalid permissionId format"),
  }),
});
