import express from "express";
import {
  deleteInAppNotificationController,
  getAllInAppNotificationsController,
  markAllAsReadInAppNotificationController,
  markAllAsUnreadInAppNotificationController,
  markAsReadInAppNotificationController,
  markAsUnreadInAppNotificationController,
  restoreInAppNotificationController,
} from "../controllers/inAppNotification.controller.js";
import { validateResource } from "../middlewares/validateResource.js";
import {
  getAllInAppNotificationsSchema,
  markAsReadInAppNotificationSchema,
} from "../validations/inAppNotification.schema.js";

const router = express.Router();

// Get all in-app notifications for current user
router.get(
  "/",
  validateResource(getAllInAppNotificationsSchema),

  getAllInAppNotificationsController,
);

// Mark specific notifications as read
router.patch(
  "/read",
  validateResource(markAsReadInAppNotificationSchema),

  markAsReadInAppNotificationController,
);

// Mark specific notifications as unread
router.patch(
  "/unread",
  validateResource(markAsReadInAppNotificationSchema),

  markAsUnreadInAppNotificationController,
);

// Mark all notifications as read
router.patch("/read-all", markAllAsReadInAppNotificationController);

// Mark all notifications as unread
router.patch("/unread-all", markAllAsUnreadInAppNotificationController);

// Delete specific notifications
router.delete(
  "/",
  validateResource(markAsReadInAppNotificationSchema),

  deleteInAppNotificationController,
);

// Restore specific notifications
router.patch(
  "/restore",
  validateResource(markAsReadInAppNotificationSchema),

  restoreInAppNotificationController,
);

export default router;
