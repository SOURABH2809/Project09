import prisma from "../config/prisma.client.js";
import { Prisma } from "../database/generated/prisma/client.js";
import { AppError } from "../utils/errors/AppError.js";
import { REDIS_USER_LAST_CONTEXT_KEY } from "../../../shared/constants/redis/redis.constant.js";
import { getDataFromRedis, saveDataInRedis } from "../utils/redis/redis.utils.js";
import { LAST_USED_CONTEXT_TTL } from "../constants/auth.constant.js";

export const formatRedundancyName = (value: string) => {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("_");
};

// Redundancy filter helper for global role/group services.
export const checkRedundancyFilter = (values: Array<string | undefined | null>) => {
  const uniqueValues = new Set<string>();
  const filters: Array<
    | { name: { equals: string; mode: "insensitive" } }
    | { normalizedName: { equals: string; mode: "insensitive" } }
  > = [];

  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;

    const formatted = formatRedundancyName(trimmed);
    if (uniqueValues.has(formatted)) continue;

    uniqueValues.add(formatted);
    filters.push(
      { name: { equals: formatted, mode: "insensitive" } },
      { normalizedName: { equals: formatted, mode: "insensitive" } },
    );
  }

  return filters;
};

// CA DELETION REASSIGNMENT

export const reassignCADeletionAssetsService = async (
  customerId: string,
  deletedCAUserId: string,
  newOwnerId: string,
) => {
  // Reassign all roles created by the deleted CA to the new owner
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

  // Reassign all groups created by the deleted CA to the new owner
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

  // Reassign all role permissions created by the deleted CA
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

  // Reassign user role mappings assigned by the deleted CA
  await prisma.customerUserRoleMap.updateMany({
    where: {
      customerId,
      assignedById: deletedCAUserId,
    },
    data: {
      assignedById: newOwnerId,
    },
  });

  // Reassign user group mappings assigned by the deleted CA
  await prisma.customerUserGroupMap.updateMany({
    where: {
      customerId,
      assignedById: deletedCAUserId,
    },
    data: {
      assignedById: newOwnerId,
    },
  });

  // Reassign group role mappings assigned by the deleted CA
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

// CHANGE CUSTOMER ACTIVE CUSTOMER CONTEXT
export const changeActiveCustomerContextService = async (
  userId: string,
  newCustomerId: string | null,
) => {
  if (!newCustomerId) {
    // Try to get from Redis
    const lastUsedContextId = await getDataFromRedis<string>(
      `${REDIS_USER_LAST_CONTEXT_KEY}:${userId}`,
      true,
    );

    if (lastUsedContextId) {
      // Validate user still has access
      const mapping = await prisma.userCustomerMapping.findFirst({
        where: {
          userId,
          customerId: lastUsedContextId,
          isActive: true,
          deletedAt: null,
        },
      });
      if (mapping) {
        newCustomerId = lastUsedContextId;
      }
    }

    if (!newCustomerId) {
      // Select a default customer if newCustomerId is not provided or invalid in Redis
      const userCustomers = await prisma.userCustomerMapping.findMany({
        where: {
          userId,
          isActive: true,
          deletedAt: null,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (userCustomers.length === 0) {
        throw new AppError("User does not have access to any customers", 403);
      }
      newCustomerId = userCustomers[0].customerId; // Default to the first customer
    }
  }

  // Update the user's active customer context
  const userActiveCustomer = await prisma.userActiveCustomer.upsert({
    where: { userId },
    update: { customerId: newCustomerId },
    create: { userId, customerId: newCustomerId, updatedAt: new Date() },
    select: {
      customerId: true,
      updatedAt: true,
    },
  });

  // Persist the last used context in Redis asynchronously
  saveDataInRedis(
    `${REDIS_USER_LAST_CONTEXT_KEY}:${userId}`,
    newCustomerId,
    LAST_USED_CONTEXT_TTL, // Uses the TTL defined in environment
    "Failed to save last used context in Redis",
    true,
  );

  return userActiveCustomer;
};
