import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors/AppError.js";
import {
  startImpersonationService,
  exitImpersonationService,
} from "../services/impersonate.service.js";
import { verifyAccessToken } from "../utils/encryption/jwt.js";

// Admin user impersonates another user
export const impersonateLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.body;
    const adminId = req.user.userId;
    const adminEmail = req.user?.email;
    const isImpersonating = req.isImpersonating;

    if (isImpersonating) {
      throw new AppError("Already impersonating another user", 400);
    }

    if (!adminId) {
      throw new AppError("Unauthorized - admin ID not found", 401);
    }

    // Start impersonation session
    const result = await startImpersonationService(adminId, userId, adminEmail);

    return res.status(200).json({
      success: true,
      message: "Impersonation started successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Admin exits the impersonation and returns to admin token
export const exitImpersonationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("No token provided", 401);
    }

    // Verify and decode the token
    const decodedToken = verifyAccessToken(token);

    // Exit impersonation
    const { token: newToken } = await exitImpersonationService(decodedToken);

    return res.status(200).json({
      success: true,
      message: "Exited impersonation successfully",
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
