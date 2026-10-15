import {
  InAppNotificationSeverity,
  InAppNotificationType,
} from "../database/generated/prisma/enums.js";

export interface GetAllInAppNotificationsParams {
  userId: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt";
  orderBy?: "asc" | "desc";
  isRead?: boolean;
  type?: InAppNotificationType;
  title?: string;
  severity?: InAppNotificationSeverity;
}
