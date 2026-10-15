import prisma from "../config/prisma.client.js";
import {
  AccountStatus,
  GetAllUserDetails,
  SORTABLE_COLUMNS,
  SortableColumn,
} from "../types/user.types.js";
import { EditUserProfileSchema } from "../types/auth.types.js";
import { AppError } from "../utils/errors/AppError.js";
import { sanitizeString } from "../utils/helpers/common.helper.js";
import { Prisma, User } from "../database/generated/prisma/client.js";
import { getDataFromRedis, saveDataInRedis } from "../utils/redis/redis.utils.js";
import { REDIS_USER_PERMISSIONS_KEY } from "../../../shared/constants/redis/redis.constant.js";
import {
  CUSTOMER_ADMIN_GROUP_NAME,
  CUSTOMER_USER_GROUP_NAME,
  SALES_USER_GROUP_NAME,
  USER_PERMISSION_CACHE_TTL,
} from "../../../shared/constants/app.constant.js";
import { CustomerMappingRoleScope } from "../../../shared/constants/customerRoleScope.constant.js";

const CUSTOMER_CONTEXT_PERMISSION_RULES = [
  { type: "prefix", value: "customer-admin:" },
  { type: "prefix", value: "customer:" },
  { type: "prefix", value: "businessEntity:" },
] as const;

export const editUserDetailsService = async (userId: string, updateData: EditUserProfileSchema) => {
  // Validating if user exists and is active
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  if (!existingUser.accountActive) {
    throw new AppError("Your account is disabled. Please contact administrator.", 403);
  }

  const updateFields: Partial<EditUserProfileSchema> = {};

  if (sanitizeString(updateData?.firstName)) {
    updateFields.firstName = sanitizeString(updateData.firstName) as string;
  }

  if (sanitizeString(updateData.lastName)) {
    updateFields.lastName = sanitizeString(updateData.lastName) as string;
  }

  if (sanitizeString(updateData.profileImageUrl)) {
    updateFields.profileImageUrl = updateData.profileImageUrl as string;
  }

  if (Object.keys(updateFields).length === 0) {
    throw new AppError("Incorrect payload. Nothing to update", 400);
  }

  // Updating user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateFields,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
    },
  });

  return {
    ...updatedUser,
  };
};

export const softDeleteUserService = async (userId: string) => {
  // Checking if user exists and is not already deleted
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    throw new AppError("User not found or already deleted", 404);
  }

  // Soft delete: Setting deletedAt timestamp
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      deletedAt: new Date(),
      accountActive: false,
    },
  });

  // Revoke all refresh tokens for this user
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revoked: false,
    },
    data: {
      revoked: true,
    },
  });

  return true;
};

export const getAllUsersService = async ({
  email,
  name,
  status,
  page = 1,
  limit = 20,
  groups,
  sortBy = "createdAt",
  orderBy = "desc",
}: GetAllUserDetails) => {
  const skip = (page - 1) * limit;
  const filter: Prisma.UserWhereInput = {};

  if (email) {
    filter.email = {
      contains: email,
      mode: "insensitive",
    };
  }

  if (name) {
    filter.OR = [
      { firstName: { contains: name, mode: "insensitive" } },
      { lastName: { contains: name, mode: "insensitive" } },
    ];
  }

  if (status !== null && status !== undefined) {
    filter.accountActive = status;
  }

  if (groups && groups.length) {
    filter.userGroup = {
      some: {
        groupId: {
          in: groups, // array of group IDs
        },
      },
    };
  }

  const sortColumn =
    sortBy && SORTABLE_COLUMNS[sortBy as SortableColumn]
      ? SORTABLE_COLUMNS[sortBy as SortableColumn]
      : "createdAt";

  const sortOrder: Prisma.SortOrder = orderBy === "asc" || orderBy === "desc" ? orderBy : "desc";

  // Total Row
  const total = await prisma.user.count({
    where: { ...filter, deletedAt: null },
  });

  const users = await prisma.user.findMany({
    where: { ...filter, deletedAt: null },
    skip,
    take: limit,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      accountActive: true,
      userGroup: {
        select: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      [sortColumn]: sortOrder,
    },
  });

  const formattedUsers = users.map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    accountActive: user.accountActive,
    groups: user.userGroup.map(({ group }) => group),
  }));

  const hasMore = page * limit < total;

  return {
    total,
    hasMore,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    users: formattedUsers,
  };
};

// Restore a soft-deleted user by userId service
export const restoreDeletedUserService = async (userId: string) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Check if user is actually deleted
  if (user.deletedAt === null) {
    throw new AppError("User is not deleted", 400);
  }

  // Restore user
  const restoredUser = await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: null,
      accountActive: true, // Reactivate account
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      accountActive: true,
    },
  });

  return restoredUser;
};

// Service to update user account status (activate/deactivate)
export const updateUserAccountStatusService = async (userId: string, status: AccountStatus) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });

  // Validate user existence
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const accountActive = status === AccountStatus.ACTIVE;

  // Check if status is already the same (avoid unnecessary DB write)
  if (user.accountActive === accountActive) {
    return { accountActive };
  }

  await prisma.$transaction([
    // Update account status
    prisma.user.update({
      where: { id: userId },
      data: { accountActive },
    }),

    // If deactivating, revoke all tokens
    ...(accountActive
      ? []
      : [
          prisma.refreshToken.updateMany({
            where: { userId },
            data: { revoked: true },
          }),
        ]),
  ]);

  return { accountActive };
};

export const assignGroupsToUserService = async (userToAssign: string, groups: string[]) => {
  if (!groups.length) {
    throw new AppError("No groups provided.");
  }

  // Validate user exists
  const user = await prisma.user.findUnique({
    where: { id: userToAssign },
  });

  if (!user) {
    throw new AppError("User not found.");
  }

  // Validate groups exist
  const existingGroups = await prisma.userGroup.findMany({
    where: {
      id: { in: groups },
    },
    select: { id: true },
  });

  if (existingGroups.length !== groups.length) {
    throw new AppError("One or more user groups are invalid.");
  }

  const mappings = groups.map((groupId) => ({
    userId: userToAssign,
    groupId: groupId,
  }));

  await prisma.$transaction(async (tx) => {
    // Delete all User Group Mapping for user
    await tx.userGroupMap.deleteMany({
      where: {
        userId: userToAssign,
      },
    });

    // Create Mapping
    await tx.userGroupMap.createMany({
      data: mappings,
      skipDuplicates: true,
    });
  });

  return {
    message: "Groups assigned to user successfully.",
  };
};

export const getUsersPermissions = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const userGroupPermissions = await prisma.userGroupMap.findMany({
    where: {
      userId: user.id,
    },
    select: {
      group: {
        select: {
          groupRoleMap: {
            select: {
              role: {
                select: {
                  userRolePermissions: {
                    select: {
                      userPermissions: {
                        select: {
                          id: true,
                          name: true,
                          normalizedName: true,
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
    },
  });

  const formattedPermissions = userGroupPermissions.flatMap((ugm) =>
    ugm.group.groupRoleMap.flatMap((grm) =>
      grm.role.userRolePermissions.flatMap((rp) => rp.userPermissions),
    ),
  );

  // Remove duplicates based on normalizedName
  const uniquePermissions = Array.from(
    new Map(formattedPermissions.map((p) => [p.normalizedName, p])).values(),
  );

  // Only return normalized names
  return uniquePermissions.map((p) => p.normalizedName);
};

const getGlobalUserPermissionsAgainstCache = async (userId: string): Promise<string[]> => {
  try {
    const cacheKey = `${REDIS_USER_PERMISSIONS_KEY}:${userId}`;

    // cache first
    const cachedPermissions = await getDataFromRedis(
      cacheKey,
      true, // suppress error
    );

    if (cachedPermissions) {
      return cachedPermissions as string[];
    }

    // Fallback to DB
    const permissions = await getUsersPermissions(userId);

    // Cache result
    await saveDataInRedis(
      cacheKey,
      permissions,
      USER_PERMISSION_CACHE_TTL,
      "Failed to cache user permissions",
      true, // suppress error
    );

    return permissions;
  } catch (error) {
    console.log("[ERROR] Failed to get user permissions", error);
    throw new AppError("Internal server Error", 500);
  }
};

const getGlobalCustomerBaselinePermissions = async (roleName: string): Promise<string[]> => {
  const role = await prisma.userRoles.findUnique({
    where: {
      normalizedName: roleName,
    },
    select: {
      userRolePermissions: {
        where: {
          deletedAt: null,
        },
        select: {
          userPermissions: {
            select: {
              normalizedName: true,
            },
          },
        },
      },
    },
  });

  return (
    role?.userRolePermissions.map(
      (permissionMap) => permissionMap.userPermissions.normalizedName,
    ) ?? []
  );
};

const resolveGlobalCustomerBaselineRoleName = (
  roleScope?: string | null,
) => {
  if (roleScope === CustomerMappingRoleScope.CUSTOMER_ADMIN) {
    return CUSTOMER_ADMIN_GROUP_NAME;
  }

  if (roleScope === CustomerMappingRoleScope.CUSTOMER_USER) {
    return CUSTOMER_USER_GROUP_NAME;
  }

  return null;
};

const getCustomerScopedPermissions = async (
  userId: string,
  customerId: string,
): Promise<string[]> => {
  try {
    const cacheKey = `customer:permissions:${customerId}:${userId}`;

    const cachedPermissions = await getDataFromRedis(cacheKey, true);
    if (cachedPermissions) {
      return cachedPermissions as string[];
    }

    const mapping = await prisma.userCustomerMapping.findFirst({
      where: {
        userId,
        customerId,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, roleScope: true },
    });

    if (!mapping) {
      return [];
    }

    const baselineRoleName = resolveGlobalCustomerBaselineRoleName(mapping.roleScope);
    const baselinePermissions = baselineRoleName
      ? await getGlobalCustomerBaselinePermissions(baselineRoleName)
      : [];

    const directRolePermissions = await prisma.customerUserRoleMap.findMany({
      where: {
        userId,
        customerId,
      },
      select: {
        customerRole: {
          select: {
            customerRolePermissions: {
              select: {
                permission: {
                  select: {
                    normalizedName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const groupRolePermissions = await prisma.customerUserGroupMap.findMany({
      where: {
        userId,
        customerId,
      },
      select: {
        customerGroup: {
          select: {
            customerGroupRoleMaps: {
              select: {
                customerRole: {
                  select: {
                    customerRolePermissions: {
                      select: {
                        permission: {
                          select: {
                            normalizedName: true,
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
      },
    });

    const permissions = Array.from(
      new Set([
        ...directRolePermissions.flatMap((entry) =>
          entry.customerRole.customerRolePermissions.map(
            (permissionMap) => permissionMap.permission.normalizedName,
          ),
        ),
        ...groupRolePermissions.flatMap((entry) =>
          entry.customerGroup.customerGroupRoleMaps.flatMap((roleMap) =>
            roleMap.customerRole.customerRolePermissions.map(
              (permissionMap) => permissionMap.permission.normalizedName,
            ),
          ),
        ),
        ...baselinePermissions,
      ]),
    );

    await saveDataInRedis(
      cacheKey,
      permissions,
      USER_PERMISSION_CACHE_TTL,
      "Failed to cache customer permissions",
      true,
    );

    return permissions;
  } catch (error) {
    console.log("[ERROR] Failed to get customer scoped permissions", error);
    throw new AppError("Internal server Error", 500);
  }
};

export const getUserPermissionsAgainstCache = async (
  userId: string,
  customerId?: string,
): Promise<string[]> => {
  const globalPermissions = await getGlobalUserPermissionsAgainstCache(userId);

  if (!customerId) {
    return globalPermissions;
  }

  const customerScopedPermissions = await getCustomerScopedPermissions(userId, customerId);
  const filteredGlobalPermissions = globalPermissions.filter(
    (permission) =>
      !CUSTOMER_CONTEXT_PERMISSION_RULES.some((rule) =>
        rule.type === "prefix" ? permission.startsWith(rule.value) : permission === rule.value,
      ),
  );

  return Array.from(new Set([...filteredGlobalPermissions, ...customerScopedPermissions]));
};
export const getBasicDetailsOfUser = async (userId: string): Promise<Partial<User>> => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      accountActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      accountActive: true,
      deletedAt: true,
      email: true,
    },
  });

  if (!user) {
    throw new AppError("User Not Found", 404);
  }

  return user;
};

export const getGroupsOfUserService = async (userId: string) => {
  // Validate user exists
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const groups = await prisma.userGroup.findMany({
    where: {
      userGroupMap: {
        some: {
          userId,
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      normalizedName: true,
      description: true,
    },
  });

  return groups;
};
