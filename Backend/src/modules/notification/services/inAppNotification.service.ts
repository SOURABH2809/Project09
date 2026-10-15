import { AppError } from "../../../shared/utils/errors/AppError.js";
import prisma from "../config/prisma.client.js";
import { Prisma } from "../database/generated/prisma/client.js";
import { GetAllInAppNotificationsParams } from "../types/inAppNotification.js";

export const getAllInAppNotificationsService = async ({
  userId,
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  orderBy = "asc",
  isRead,
  type,
  severity,
  title,
}: GetAllInAppNotificationsParams) => {
  if (limit > 50 || limit <= 0) {
    limit = 50;
  }
  if (page < 1) {
    page = 1;
  }
  const skip = (page - 1) * limit;

  const filter: Prisma.InAppNotificationWhereInput = {
    userId,
    deletedAt: null, // soft delete support
  };

  if (isRead !== undefined) {
    filter.read = isRead;
  }

  if (type) {
    filter.type = type;
  }

  if (title) {
    filter.title = {
      contains: title,
      mode: "insensitive",
    };
  }

  if (severity) {
    filter.severity = severity;
  }

  const sortColumn: keyof Prisma.InAppNotificationOrderByWithRelationInput = sortBy
    ? sortBy
    : "createdAt";

  const sortOrder: Prisma.SortOrder = orderBy === "asc" || orderBy === "desc" ? orderBy : "asc";

  // Total count
  const total = await prisma.inAppNotification.count({
    where: filter,
  });

  const notifications = await prisma.inAppNotification.findMany({
    where: filter,
    skip,
    take: limit,
    orderBy: {
      [sortColumn]: sortOrder,
    },
    select: {
      id: true,
      title: true,
      severity: true,
      message: true,
      type: true,
      read: true,
      createdAt: true,
    },
  });

  const hasMore = page * limit < total;

  return {
    message: "In-app notifications retrieved successfully",
    data: {
      total,
      hasMore,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      notifications,
    },
  };
};

export const markAsReadInAppNotificationService = async (
  userId: string,
  notificationIds: string[],
) => {
  // Ensure all notifications exists
  await ensureAllNotificationsBelongToUser(userId, notificationIds);

  // Mark as read
  const result = await prisma.inAppNotification.updateMany({
    where: {
      id: { in: notificationIds },
      userId,
    },
    data: {
      read: true,
    },
  });

  return { message: "Notifications marked as read successfully" };
};

export const markAsUnreadInAppNotificationService = async (
  userId: string,
  notificationIds: string[],
) => {
  // Ensure all notifications exists
  await ensureAllNotificationsBelongToUser(userId, notificationIds);

  // Mark as unread
  await prisma.inAppNotification.updateMany({
    where: {
      id: { in: notificationIds },
      userId,
    },
    data: {
      read: false,
    },
  });

  return { message: "Notifications marked as unread successfully" };
};

export const markAllAsReadInAppNotificationService = async (userId: string) => {
  await prisma.inAppNotification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });

  return { message: "All notifications marked as read successfully" };
};

export const markAllAsUnreadInAppNotificationService = async (userId: string) => {
  await prisma.inAppNotification.updateMany({
    where: {
      userId,
      read: true,
    },
    data: {
      read: false,
    },
  });

  return { message: "All notifications marked as unread successfully" };
};

export const deleteInAppNotificationService = async (userId: string, notificationIds: string[]) => {
  // Ensure all notifications exists
  await ensureAllNotificationsBelongToUser(userId, notificationIds);

  // Soft delete notifications
  await prisma.inAppNotification.updateMany({
    where: {
      id: { in: notificationIds },
      userId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return { message: "Notifications deleted successfully" };
};

export const restoreInAppNotificationService = async (
  userId: string,
  notificationIds: string[],
) => {
  // Ensure all notifications exists
  await ensureAllNotificationsBelongToUser(userId, notificationIds, false);

  // Restore notifications
  await prisma.inAppNotification.updateMany({
    where: {
      id: { in: notificationIds },
      userId,
    },
    data: {
      deletedAt: null,
    },
  });

  return { message: "Notifications restored successfully" };
};

export const ensureAllNotificationsBelongToUser = async (
  userId: string,
  notificationIds: string[],
  excludeDeleted: boolean = true,
) => {
  const notificationIdsSet = new Set(notificationIds);

  const where: Prisma.InAppNotificationWhereInput = {
    id: { in: notificationIds },
    userId,
  };

  if (excludeDeleted) {
    where.deletedAt = null;
  }

  const existingNotifications = await prisma.inAppNotification.findMany({
    where,
    select: { id: true },
  });

  const existingNotificationIdsSet = new Set(existingNotifications.map((n) => n.id));

  const missingNotificationIds = [...notificationIdsSet].filter(
    (id) => !existingNotificationIdsSet.has(id),
  );

  if (missingNotificationIds.length > 0) {
    throw new AppError(`One or more notifications not found or do not belong to user`);
  }
};
