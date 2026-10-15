import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errors/AppError.js";
import { JwtPayload } from "../types/auth.js";
import { PASSWORD_EXPIRY_DURATION_MS } from "../constants/app.constant.js";
import redis from "../config/redis.conf.js";
import { SESSION_TTL } from "../../modules/auth/constants/auth.constant.js";
import { errorResponse } from "../utils/request-handling/response.utils.js";

const IMPERSONATION_SESSION_PREFIX = "impersonation:session:";
const IMPERSONATION_SESSION_TTL = 30 * 60; // 30 minutes in seconds

export const validateAuthentication = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) throw new AppError("Unauthorized", 401);

  const token = authHeader.split(" ")[1];

  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

  if (!ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not configured");
  }

  let payload: JwtPayload;

  // Verify JWT
  try {
    payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
  } catch (err) {
    console.error("JWT Error:", err);
    throw new AppError("Invalid or expired token", 401);
  }

  if ((payload?.redisBound && !payload?.sid) || !payload?.userId || !payload.email) {
    throw new AppError("Unauthorized", 401);
  }

  // Handle impersonation session validation
  if (payload.impersonation?.active) {
    const sessionKey = `${IMPERSONATION_SESSION_PREFIX}${payload.impersonation.sessionId}`;

    try {
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        throw new AppError("Impersonation session expired", 401);
      }

      if (!payload.actor) {
        throw new AppError("Invalid impersonation token - missing actor information", 401);
      }

      // Refresh session TTL
      await redis.expire(sessionKey, IMPERSONATION_SESSION_TTL);

      // Attach additional context for impersonation
      req.impersonationData = {
        impersonatedUserId: payload.userId,
        impersonatedUserEmail: payload.email,
        sessionId: payload.impersonation.sessionId,
        impersonatingUserId: payload.actor.id,
        impersonatingUserEmail: payload?.actor.email,
      };

      req.isImpersonating = true;

      req.user = payload;
      return next();
    } catch (err) {
      if (err instanceof AppError) throw err;
      console.error("Error validating impersonation session:", err);
      throw new AppError("Impersonation session validation failed", 401);
    }
  } else {
    req.isImpersonating = false;
    req.impersonationData = null;
  }

  const needsReset = checkPasswordResetRequired(
    payload.passwordChangedAt,
    payload.passwordResetRequired,
  );

  if (needsReset) {
    return res.status(403).json({
      success: false,
      code: "PASSWORD_RESET_REQUIRED",
      message: "Password reset required due to organization security policy.",
      passwordResetRequired: true,
    });
  }

  const sessionKey = `session:${payload.sid}`;

  try {
    const ttl = await redis.ttl(sessionKey);

    // Session expired due to inactivity
    if (payload?.redisBound && ttl === -2) {
      return res.status(401).json(errorResponse("Your session has expired due to inactivity."));
    }

    // Refresh sliding TTL
    await redis.expire(sessionKey, SESSION_TTL);
  } catch (err) {
    // Redis is NOT auth authority, Allow request, log infra issue
    console.warn("Redis unavailable, skipping inactivity check", {
      error: err instanceof Error ? err.message : err,
    });
  }

  req.user = payload;
  return next();
};

// Helper function to determine if password reset is required
const checkPasswordResetRequired = (
  passwordChangedAt: number | undefined,
  passwordResetRequired: boolean | undefined,
): boolean => {
  if (passwordResetRequired) {
    return true;
  }

  if (!passwordChangedAt) {
    return false;
  }

  const passwordAge = Date.now() - passwordChangedAt;
  return passwordAge > PASSWORD_EXPIRY_DURATION_MS;
};
