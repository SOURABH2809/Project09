import prisma from "../config/prisma.client.js";
import { AppError } from "../utils/errors/AppError.js";
import { Prisma } from "../database/generated/prisma/client.js";
import redis from "../../../shared/config/redis.conf.js";
import { REDIS_USER_PERMISSIONS_KEY } from "../../../shared/constants/redis/redis.constant.js";
import { UserPermissionsUpdateInput } from "../database/generated/prisma/models.js";
import { Module, PermissionAction, SubFeature } from "../types/permission.types.js";

export const createPermissionService = async (
  userId: string,
  name: string,
  normalizedName: string,
  description?: string | null,
) => {
  name = name.trim().toUpperCase();
  normalizedName = normalizedName.trim();

  try {
    // const permission = await prisma.userPermissions.create({
    //   data: {
    //     name,
    //     normalizedName,
    //     description: description || null,
    //     permissionCreatedById: userId,
    //   },
    // });
    // return {
    //   message: "Permission created successfully.",
    //   // data: permission,
    // };
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new AppError("Permission name or normalized name already exists.", 409);
    }
    throw error;
  }
};

export const getAllPermissionsService = async () => {
  return prisma.userPermissions.findMany({
    orderBy: { name: "asc" },
  });
};

export const getPermissionByIdService = async (permissionId: string) => {
  const permission = await prisma.userPermissions.findUnique({
    where: { id: permissionId },
  });

  if (!permission) {
    throw new AppError("Permission not found.", 404);
  }

  return permission;
};

export const updatePermissionService = async (
  permissionId: string,
  userId: string,
  name?: string | null,
  normalizedName?: string | null,
  description?: string | null,
) => {
  const permission = await prisma.userPermissions.findUnique({
    where: { id: permissionId },
  });

  if (!permission) {
    throw new AppError("Permission not found.", 404);
  }

  const data: Prisma.UserPermissionsUpdateInput = {};

  if (name) data.name = name.trim().toUpperCase();
  if (normalizedName) data.normalizedName = normalizedName.trim();
  if (description !== undefined) data.description = description;

  if (Object.keys(data).length === 0) {
    throw new AppError("No fields provided for update.", 400);
  }

  try {
    const updatedPermission = await prisma.userPermissions.update({
      where: { id: permissionId },
      data: {
        ...data,
        permissionUpdatedById: userId,
      } as UserPermissionsUpdateInput,
    });

    // Invalidate cache if normalizedName changed, as only storing normalizedName in cache
    if (normalizedName) {
      const affectedUsers = await getAllUsersAssociatedWithPermissions(permissionId);
      // Invalidate permission cache
      await invalidateUserPermissionCacheService(affectedUsers.map((u) => u.id));
    }

    return {
      message: "Permission updated successfully.",
      data: updatedPermission,
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new AppError("Permission name or normalized name already exists.", 409);
    }
    throw error;
  }
};

export const deletePermissionService = async (permissionId: string) => {
  const permission = await prisma.userPermissions.findUnique({
    where: { id: permissionId },
  });

  if (!permission) {
    throw new AppError("Permission not found.", 404);
  }

  const affectedRoles = await getAllUsersAssociatedWithPermissions(permissionId);
  const ids = affectedRoles.map((user) => user.id);

  await prisma.$transaction(async (tx) => {
    await tx.userPermissionRoleMap.deleteMany({
      where: { permissionId },
    });

    await tx.userPermissions.delete({
      where: { id: permissionId },
    });
  });

  await invalidateUserPermissionCacheService(ids);

  return {
    message: "Permission deleted successfully.",
  };
};

export const invalidateUserPermissionCacheService = async (userIds: string[]) => {
  if (!userIds || userIds.length === 0) return;

  const keys = userIds.map((userId) => `${REDIS_USER_PERMISSIONS_KEY}:${userId}`);

  try {
    await redis.del(keys);
  } catch (error) {
    // Not blocking
    console.warn("[CACHE] Failed to invalidate user permission cache for users: ", keys, error);
  }
};

export const getAllUsersAssociatedWithPermissions = async (permissionId: string | string[]) => {
  const permissionIds = Array.isArray(permissionId) ? permissionId : [permissionId];

  const users = await prisma.user.findMany({
    where: {
      userGroup: {
        some: {
          group: {
            groupRoleMap: {
              some: {
                role: {
                  userRolePermissions: {
                    some: {
                      permissionId: {
                        in: permissionIds,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    select: { id: true },
  });

  return users;
};

export const getAllPermissionsFeatureAndPageWiseService = async (): Promise<Module[]> => {
  const permissions = await prisma.userPermissions.findMany({
    orderBy: [
      { moduleName: "asc" },
      { pageKey: "asc" },
      { subFeatureKey: "asc" },
      { action: "asc" },
    ],
  });

  const structured: Record<
    string,
    {
      moduleKey: string;
      moduleName: string;
      pages: Record<
        string,
        {
          pageKey: string;
          pageName: string;
          resource: string;
          actions: PermissionAction[];
          subFeatures: Record<string, SubFeature>;
        }
      >;
    }
  > = {};

  for (const permission of permissions) {
    const { moduleName, pageKey, pageName, subFeatureKey, subFeatureName, normalizedName } =
      permission;

    const moduleKey = moduleName.toLowerCase();

    // derive resource from permission string
    const resource = permission.resourceName;

    // MODULE
    if (!structured[moduleKey]) {
      structured[moduleKey] = {
        moduleKey,
        moduleName,
        pages: {},
      };
    }

    const module = structured[moduleKey];

    // PAGE
    if (!module.pages[pageKey]) {
      module.pages[pageKey] = {
        pageKey: pageKey.toLowerCase(),
        pageName: pageName.replace(/-/g, " "),
        resource,
        actions: [],
        subFeatures: {},
      };
    }

    const page = module.pages[pageKey];

    const permissionData: PermissionAction = {
      id: permission.id,
      name: permission.name,
      normalizedName: permission.normalizedName,
      action: permission.action,
      description: permission.description,
    };

    // SUB FEATURE
    if (subFeatureKey) {
      if (!page.subFeatures[subFeatureKey]) {
        page.subFeatures[subFeatureKey] = {
          subFeatureKey: subFeatureKey.toLowerCase(),
          subFeatureName: subFeatureName?.replace(/-/g, " "),
          actions: [],
        };
      }

      page.subFeatures[subFeatureKey].actions.push(permissionData);
    } else {
      page.actions.push(permissionData);
    }
  }

  // Convert object → arrays (frontend friendly)
  return Object.values(structured).map((module) => ({
    moduleKey: module.moduleKey,
    moduleName: module.moduleName,
    pages: Object.values(module.pages).map((page) => ({
      ...page,
      subFeatures: Object.values(page.subFeatures),
    })),
  }));
};
