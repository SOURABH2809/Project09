import z from "zod";
import {
  InAppNotificationSeverity,
  InAppNotificationType,
} from "../database/generated/prisma/enums.js";

export const markAsReadInAppNotificationSchema = z.object({
  body: z
    .object({
      notificationIds: z
        .array(z.string().uuid("Invalid notification ID format"))
        .nonempty("At least one notification ID is required"),
    })
    .strict(),
});

export const getAllInAppNotificationsSchema = z.object({
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
      isRead: z.string().optional(),
      orderBy: z.enum(["asc", "desc"]).optional(),
      severity: z.enum(InAppNotificationSeverity).optional(),
      title: z.string().optional(),
      type: z.enum(InAppNotificationType).optional(),
    })
    .strict(),
});

export const InAppNotificationSchema = z.object({
  body: z
    .object({
      notificationIds: z
        .array(z.string().uuid("Invalid notification ID format"))
        .nonempty("At least one notification ID is required"),
    })
    .strict(),
});
