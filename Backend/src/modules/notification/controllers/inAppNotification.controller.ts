import { NextFunction, Request, Response } from "express";
import {
  deleteInAppNotificationService,
  getAllInAppNotificationsService,
  markAllAsReadInAppNotificationService,
  markAllAsUnreadInAppNotificationService,
  markAsReadInAppNotificationService,
  markAsUnreadInAppNotificationService,
  restoreInAppNotificationService,
} from "../services/inAppNotification.service.js";
import { successResponse } from "../utils/response-handling/response.utils.js";
import {
  InAppNotificationSeverity,
  InAppNotificationType,
  Prisma,
} from "../database/generated/prisma/client.js";

export const getAllInAppNotificationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const { page, limit, isRead, orderBy, severity, title, type } = req.query;

    const result = await getAllInAppNotificationsService({
      userId,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 50,
      isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
      sortBy: "createdAt",
      orderBy: orderBy ? (orderBy as Prisma.SortOrder) : "asc",
      severity: severity ? (severity as InAppNotificationSeverity) : undefined,
      title: title as string | undefined,
      type: type as InAppNotificationType | undefined,
    });

    return res.status(200).json(successResponse(result.message, result.data));
  } catch (error) {
    next(error);
  }
};

export const markAsReadInAppNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const { notificationIds } = req.body;
    const result = await markAsReadInAppNotificationService(userId, notificationIds);
    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const markAllAsReadInAppNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const result = await markAllAsReadInAppNotificationService(userId);
    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const markAsUnreadInAppNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const { notificationIds } = req.body;
    const result = await markAsUnreadInAppNotificationService(userId, notificationIds);
    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const markAllAsUnreadInAppNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const result = await markAllAsUnreadInAppNotificationService(userId);
    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const deleteInAppNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const { notificationIds } = req.body;
    const result = await deleteInAppNotificationService(userId, notificationIds);

    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const restoreInAppNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const { notificationIds } = req.body;
    const result = await restoreInAppNotificationService(userId, notificationIds);
    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};
