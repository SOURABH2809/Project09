import prisma from "../config/prisma.client.js";
import { AppError } from "../utils/errors/AppError.js";
import { invalidateUserPermissionCacheService } from "./permission.service.js";
import { checkRedundancyFilter, formatRedundancyName } from "./shared.utils.js";

export const createUserGroupService = async (
  userId: string,
  name: string,
  normalizedName: string,
  description: string | null,
) => {
  const formattedName = formatRedundancyName(name || normalizedName || "");

  const existingGroup = await prisma.userGroup.findFirst({
    where: {
      OR: checkRedundancyFilter([formattedName]),
    },
  });

  if (existingGroup) {
    throw new AppError("User group name already exists.", 409);
  }

  try {
    await prisma.userGroup.create({
      data: {
        name: formattedName,
        normalizedName: formattedName,
        createdById: userId,
        description,
      },
      select: {
        id: true,
        name: true,
        normalizedName: true,
        description: true,
      },
    });

    return { message: "User group created successfully." };
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new AppError("User group name already exists.", 409);
    }
    throw error;
  }
};

export const assignUsersToGroupService = async (groupToAssign: string, users: string[]) => {
  if (!Array.isArray(users) || users.length === 0) {
    throw new AppError("No users provided.", 400);
  }

  const group = await prisma.userGroup.findUnique({
    where: { id: groupToAssign },
  });

  if (!group) {
    throw new AppError("Group not found.", 404);
  }

  const existingUsers = await prisma.user.findMany({
    where: { id: { in: users } },
    select: { id: true },
  });

  if (existingUsers.length !== users.length) {
    throw new AppError("One or more users are invalid.", 400);
  }

  // Fetch current users of the group
  const currentUserMappings = await prisma.userGroupMap.findMany({
    where: { groupId: groupToAssign },
    select: { userId: true },
  });

  const currentUserIds = currentUserMappings.map((u) => u.userId);
  const newUserIds = users;

  // Calculate added & removed users
  const addedUserIds = newUserIds.filter((id) => !currentUserIds.includes(id));

  const removedUserIds = currentUserIds.filter((id) => !newUserIds.includes(id));

  const mappings = newUserIds.map((userId) => ({
    userId,
    groupId: groupToAssign,
  }));

  // Replace mappings
  await prisma.$transaction([
    prisma.userGroupMap.deleteMany({
      where: { groupId: groupToAssign },
    }),
    prisma.userGroupMap.createMany({
      data: mappings,
      skipDuplicates: true,
    }),
  ]);

  // Invalidate permission cache
  await invalidateUserPermissionCacheService([...addedUserIds, ...removedUserIds]);

  return {
    message: "Users assigned to group successfully.",
  };
};

export const updateUserGroupService = async (
  groupId: string,
  userId: string,
  data: {
    name?: string;
    normalizedName?: string;
    description?: string | null;
  },
) => {
  const formattedName = formatRedundancyName(data.name || data.normalizedName || "");

  const conflictingGroup = await prisma.userGroup.findFirst({
    where: {
      id: { not: groupId },
      OR: checkRedundancyFilter([formattedName]),
    },
  });

  if (conflictingGroup) {
    throw new AppError("User group name already exists.", 409);
  }

  try {
    await prisma.userGroup.update({
      where: { id: groupId },
      data: {
        ...(data.name || data.normalizedName
          ? {
              name: formattedName,
              normalizedName: formattedName,
            }
          : {}),
        ...(data.description !== undefined && { description: data.description }),
        updatedById: userId,
      },
    });

    return { message: "User group updated successfully." };
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new AppError("User group name already exists.", 409);
    }
    if (error.code === "P2025") {
      throw new AppError("User group not found.", 404);
    }
    throw error;
  }
};

export const deleteUserGroupService = async (groupId: string) => {
  try {
    const users = await getAllUsersOfGroup(groupId);
    const ids = users.map((user) => user.id);

    await prisma.$transaction([
      prisma.userGroupMap.deleteMany({
        where: { groupId },
      }),
      prisma.userGroup.delete({
        where: { id: groupId },
      }),
    ]);

    await invalidateUserPermissionCacheService(ids);
  } catch (error: any) {
    if (error?.code === "P2025") {
      throw new AppError("Group not found", 404);
    }
    throw error;
  }

  return { message: "User group deleted successfully." };
};

export const getAllUserGroupsService = async () => {
  return prisma.userGroup.findMany({
    orderBy: { name: "asc" },
  });
};

export const getUserGroupWithUsersService = async (groupId: string) => {
  const group = await prisma.userGroup.findUnique({
    where: { id: groupId },
    include: {
      userGroupMap: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!group) {
    throw new AppError("Group not found.");
  }
  const { userGroupMap, ...rest } = group;

  const users = userGroupMap.map((group) => group.user);
  return { ...rest, users };
};

export const removeUserFromGroupService = async (userId: string, groupId: string) => {
  await prisma.userGroupMap.delete({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  });

  return { message: "User removed from group successfully." };
};

export const assignRolesToGroupService = async (groupToAssign: string, roles: string[]) => {
  const group = await prisma.userGroup.findUnique({
    where: { id: groupToAssign },
  });

  if (!group) {
    throw new AppError("Group does not exist.", 404);
  }

  roles = [...new Set(roles)];

  const existingRoles = await prisma.userRoles.findMany({
    where: { id: { in: roles } },
    select: { id: true },
  });

  if (existingRoles.length !== roles.length) {
    throw new AppError("One or more role IDs are invalid.", 400);
  }

  await prisma.$transaction([
    prisma.userGroupRoleMap.deleteMany({
      where: { groupId: groupToAssign },
    }),
    prisma.userGroupRoleMap.createMany({
      data: roles.map((roleId: string) => ({
        groupId: groupToAssign,
        roleId,
      })),
      skipDuplicates: true,
    }),
  ]);

  const users = await getAllUsersOfGroup(groupToAssign);
  const ids = users.map((user) => user.id);
  await invalidateUserPermissionCacheService(ids);
  return { message: "Roles assigned successfully." };
};

export const getRolesOfGroupService = async (groupId: string) => {
  const roles = await prisma.userGroupRoleMap.findMany({
    where: { groupId },
    select: {
      role: {
        select: {
          id: true,
          name: true,
          normalizedName: true,
        },
      },
    },
  });

  return roles.map(({ role }) => role);
};

export const getAllUsersOfGroup = async (groupId: string) => {
  return prisma.user.findMany({
    where: {
      userGroup: {
        some: {
          groupId,
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
};

export const getAllUserIdsOfGroupByName = async (groupName: string) => {
  const group = await prisma.userGroup.findUnique({
    where: {
      normalizedName: groupName,
    },
    select: {
      id: true,
    },
  });

  if (!group) return [];

  const groupUsers = await prisma.userGroupMap.findMany({
    where: {
      groupId: group.id,
      user: {
        deletedAt: null,
        accountActive: true,
      },
    },
    select: {
      userId: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  const groupUsersDetails = groupUsers.map((u) => {
    return { id: u.userId, email: u.user.email };
  });
  return groupUsersDetails;
};
