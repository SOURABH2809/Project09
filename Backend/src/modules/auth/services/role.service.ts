import prisma from "../config/prisma.client.js";
import { Prisma } from "../database/generated/prisma/client.js";
import { UserUpdateInput } from "../database/generated/prisma/models.js";
import { AddRoleSchema, UserRoles, UserRolesSchema } from "../types/roles.types.js";
import { AppError } from "../utils/errors/AppError.js";
import { invalidateUserPermissionCacheService } from "./permission.service.js";
import { checkRedundancyFilter, formatRedundancyName } from "./shared.utils.js";
import {
  CUSTOMER_ADMIN_GROUP_NAME,
  CUSTOMER_SUPER_ADMIN_GROUP_NAME,
  CUSTOMER_USER_GROUP_NAME,
} from "../../../shared/constants/app.constant.js";
import { invalidateAllCustomerPermissionsCache } from "./customerAdmin.utils.js";

const GLOBAL_CUSTOMER_BASELINE_ROLE_NAMES = new Set([
  CUSTOMER_SUPER_ADMIN_GROUP_NAME,
  CUSTOMER_ADMIN_GROUP_NAME,
  CUSTOMER_USER_GROUP_NAME,
]);

export const addRoleService = async ({
  name,
  description,
  normalizedName,
  userId,
}: AddRoleSchema) => {
  const formattedName = formatRedundancyName(name || normalizedName || "");

  const existingRole = await prisma.userRoles.findFirst({
    where: {
      OR: checkRedundancyFilter([formattedName]),
    },
  });

  if (existingRole) {
    throw new AppError("Role already exists.", 409);
  }

  try {
    const role = await prisma.userRoles.create({
      data: {
        name: formattedName,
        normalizedName: formattedName,
        description,
        createdById: userId,
      },
      select: {
        id: true,
        name: true,
        normalizedName: true,
      },
    });

    return role;
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new AppError("Role already exists.", 409);
    }
    throw err;
  }
};

export const getRolesService = async (): Promise<UserRoles[]> => {
  const result = await prisma.userRoles.findMany({
    select: {
      id: true,
      name: true,
      normalizedName: true,
      description: true,
    },
  });

  return result;
};

export const assignPermissionsToRoleService = async (
  userId: string,
  roleToAssign: string,
  permissions: string[],
) => {
  const role = await prisma.userRoles.findUnique({
    where: { id: roleToAssign },
  });

  if (!role) {
    throw new AppError("Role to assign permissions does not exist.", 404);
  }

  // Remove duplicates
  permissions = [...new Set(permissions)];

  // Ensure all permissions IDs exist
  const existingPermissions = await prisma.userPermissions.findMany({
    where: { id: { in: permissions } },
    select: { id: true },
  });

  if (existingPermissions?.length !== permissions?.length) {
    throw new AppError("One or many permissions IDs are Invalid", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    // Delete previous permissions
    await tx.userPermissionRoleMap.deleteMany({
      where: {
        roleId: roleToAssign,
      },
    });

    // Assign new roles
    const assignments = await tx.userPermissionRoleMap.createMany({
      data: permissions.map((permissionId) => ({
        roleId: roleToAssign,
        permissionId,
        permissionMapCreatedById: userId,
      })),
      skipDuplicates: true,
    });

    // Invalidate User Permission from redis cache
    const users = await getUsersFromGroupsHavingRole(roleToAssign);
    const ids = users.map((user) => user.id);
    await invalidateUserPermissionCacheService(ids);

    return assignments;
  });

  if (GLOBAL_CUSTOMER_BASELINE_ROLE_NAMES.has(role.normalizedName)) {
    await invalidateAllCustomerPermissionsCache();
  }

  return {
    message: `Assigned ${result.count} ${result.count > 1 ? "permissions" : "permission"} successfully.`,
  };
};

export const getAllPermissionsOfRoleService = async (roleId: string) => {
  const role = await prisma.userRoles.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new AppError("Role not found", 404);
  }

  const rolePermissions = await prisma.userPermissionRoleMap.findMany({
    where: {
      roleId: roleId,
    },
    select: {
      userPermissions: {
        select: {
          id: true,
          name: true,
          normalizedName: true,
          description: true,
        },
      },
    },
  });

  return rolePermissions?.map((role) => role.userPermissions);
};

export const deleteRoleService = async (roleId: string) => {
  const role = await prisma.userRoles.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new AppError("Role not found", 404);
  }

  const ids = await prisma.$transaction(async (tx) => {
    // Affected users
    const users = await getUsersFromGroupsHavingRole(roleId);
    const ids = users.map((user) => user.id);

    // Delete all Group-Role mapping
    await tx.userGroupRoleMap.deleteMany({
      where: {
        roleId,
      },
    });

    // Delete all Permission-Role mapping
    await tx.userPermissionRoleMap.deleteMany({
      where: {
        roleId,
      },
    });

    // Delete role
    await tx.userRoles.delete({
      where: { id: roleId },
    });

    return ids;
  });

  await invalidateUserPermissionCacheService(ids);

  if (GLOBAL_CUSTOMER_BASELINE_ROLE_NAMES.has(role.normalizedName)) {
    await invalidateAllCustomerPermissionsCache();
  }

  return { message: "Role deleted successfully" };
};

export const editRoleService = async (
  roleId: string,
  userId: string,
  name?: string | null,
  normalizedName?: string | null,
  description?: string | null,
) => {
  const role = await prisma.userRoles.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new AppError("Role not found", 404);
  }

  const updatedFields: Prisma.UserRolesUpdateInput = {};

  const formattedName = formatRedundancyName(name || normalizedName || "");
  if (name || normalizedName) {
    updatedFields.name = formattedName;
    updatedFields.normalizedName = formattedName;
  }
  if (description !== undefined) updatedFields.description = description;

  if (Object.keys(updatedFields).length === 0) {
    throw new AppError("No fields provided for update", 400);
  }

  try {
    const conflictingRole = await prisma.userRoles.findFirst({
      where: {
        id: { not: roleId },
        OR: checkRedundancyFilter([formattedName]),
      },
    });

    if (conflictingRole) {
      throw new AppError("Role already exists.", 409);
    }

    const updatedRole = await prisma.userRoles.update({
      where: { id: roleId },
      data: {
        ...updatedFields,
        updatedById: userId,
      } as UserUpdateInput,
    });

    if (
      GLOBAL_CUSTOMER_BASELINE_ROLE_NAMES.has(role.normalizedName) ||
      GLOBAL_CUSTOMER_BASELINE_ROLE_NAMES.has(updatedRole.normalizedName)
    ) {
      await invalidateAllCustomerPermissionsCache();
    }

    return {
      message: "Role edited successfully",
      data: { role: updatedRole },
    };
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new AppError("Role already exists.", 409);
    }
    throw err;
  }
};

export const getUsersFromGroupsHavingRole = async (roleToAssigned: string) => {
  const affectedUsers = await prisma.user.findMany({
    where: {
      userGroup: {
        some: {
          group: {
            groupRoleMap: {
              some: {
                roleId: roleToAssigned,
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  return affectedUsers;
};
