import {
  InAppNotificationSeverity,
  InAppNotificationType,
} from "../../modules/notification/database/generated/prisma/enums.js";

export interface InAppNotificationPayload {
  userIds: string[]; // Array of user IDs to receive the notification
  title: string;
  message: string;
  type: InAppNotificationType; // Type of notification
  severity: InAppNotificationSeverity; // severity level
  link?: string; // Optional link for the notification
  isRead?: boolean; // Optional flag to indicate if the notification has been read
  createdAt?: Date; // Optional timestamp for when the notification was created
}

export { InAppNotificationType, InAppNotificationSeverity };
