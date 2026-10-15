import prisma from "../config/prisma.client.js";
import { Prisma, UserType } from "../database/generated/prisma/client.js";
import { AppError } from "../utils/errors/AppError.js";
import { deleteFromRedis } from "../utils/redis/redis.utils.js";
import redis from "../../../shared/config/redis.conf.js";

// TODO: Move to shared constants
const REDIS_CUSTOMER_PERMISSIONS_KEY = "customer:permissions";

export const invalidateUserPermissionsCache = async (userId: string, customerId: string) => {
  try {
    const cacheKey = `${REDIS_CUSTOMER_PERMISSIONS_KEY}:${customerId}:${userId}`;
    await deleteFromRedis(cacheKey, "Failed to invalidate user permissions cache", true);
  } catch (error) {
    console.log("[ERROR] Failed to invalidate user permissions cache", error);
  }
};

export const invalidateCustomerPermissionsCache = async (customerId: string) => {
  try {
    const users = await prisma.userCustomerMapping.findMany({
      where: {
        customerId,
        isActive: true,
        deletedAt: null,
      },
      select: { userId: true },
    });

    await Promise.all(users.map((user) => invalidateUserPermissionsCache(user.userId, customerId)));
  } catch (error) {
    console.log("[ERROR] Failed to invalidate customer permissions cache", error);
  }
};

export const invalidateAllCustomerPermissionsCache = async () => {
  try {
    const keys = await redis.keys(`${REDIS_CUSTOMER_PERMISSIONS_KEY}:*`);
    if (keys.length) {
      await redis.del(keys);
    }
  } catch (error) {
    console.log("[ERROR] Failed to invalidate all customer permissions cache", error);
  }
};

export const getUserCustomerRoleNames = async (
  userId: string,
  customerId: string,
): Promise<string[]> => {
  if (!customerId) return [];

  try {
    const userRoles = await prisma.customerUserRoleMap.findMany({
      where: {
        userId,
        customerId,
      },
      include: {
        customerRole: {
          select: { name: true },
        },
      },
    });

    const userGroupRoles = await prisma.customerUserGroupMap.findMany({
      where: {
        userId,
        customerId,
      },
      include: {
        customerGroup: {
          include: {
            customerGroupRoleMaps: {
              include: {
                customerRole: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    const roleNames = new Set<string>();
    userRoles.forEach((ur) => roleNames.add(ur.customerRole.name));
    userGroupRoles.forEach((ugp) =>
      ugp.customerGroup.customerGroupRoleMaps.forEach((cgrm) =>
        roleNames.add(cgrm.customerRole.name),
      ),
    );

    return Array.from(roleNames);
  } catch (error) {
    console.log("[ERROR] Failed to get user customer role names", error);
    return [];
  }
};

export const reassignCADeletionAssetsService = async (
  customerId: string,
  deletedCAUserId: string,
  newOwnerId: string,
) => {
  await prisma.customerRole.updateMany({
    where: {
      customerId,
      createdById: deletedCAUserId,
      deletedAt: null,
    },
    data: {
      createdById: newOwnerId,
    },
  });

  await prisma.customerGroup.updateMany({
    where: {
      customerId,
      createdById: deletedCAUserId,
      deletedAt: null,
    },
    data: {
      createdById: newOwnerId,
    },
  });

  await prisma.customerRolePermission.updateMany({
    where: {
      createdById: deletedCAUserId,
      customerRole: {
        customerId,
      },
    },
    data: {
      createdById: newOwnerId,
    },
  });

  await prisma.customerUserRoleMap.updateMany({
    where: {
      customerId,
      assignedById: deletedCAUserId,
    },
    data: {
      assignedById: newOwnerId,
    },
  });

  await prisma.customerUserGroupMap.updateMany({
    where: {
      customerId,
      assignedById: deletedCAUserId,
    },
    data: {
      assignedById: newOwnerId,
    },
  });

  await prisma.customerGroupRoleMap.updateMany({
    where: {
      customerId,
      assignedById: deletedCAUserId,
    },
    data: {
      assignedById: newOwnerId,
    },
  });
};

export const getAccessibleCustomerScopeForCA = async (userId: string, customerId?: string) => {
  const adminCustomers = await prisma.customerAdmin.findMany({
    where: {
      userId,
      isActive: true,
      deletedAt: null,
    },
    select: {
      customerId: true,
    },
  });

  if (!adminCustomers.length) {
    throw new AppError("Only Customer Admin can perform this action", 403);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userType: true },
  });

  return {
    accessibleCustomerIds: adminCustomers.map((c) => c.customerId),
    isSuperAdmin: user?.userType === UserType.INTERNAL,
  };
};
