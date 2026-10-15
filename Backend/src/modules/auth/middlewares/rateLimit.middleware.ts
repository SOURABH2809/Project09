import { Request, Response, NextFunction } from "express";
import { getDataFromRedis, saveDataInRedis } from "../utils/redis/redis.utils.js";
import { AppError } from "../utils/errors/AppError.js";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  message?: string;
}

//  Rate limiting middleware for CA operations

export const rateLimitMiddleware = (config: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { windowMs, maxRequests, keyPrefix, message } = config;
      const userId = req.user?.userId;
      const customerId = req.params?.customerId;

      if (!userId || !customerId) {
        return next();
      }

      // Create a unique key for this user-customer combination
      const key = `${keyPrefix}:${userId}:${customerId}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get current request count from Redis
      const requestData = await getDataFromRedis(key, true);
      let requests: number[] = requestData ? (requestData as number[]) : [];

      // Filter out requests outside the current window
      requests = requests.filter((timestamp) => timestamp > windowStart);

      // Check if limit exceeded
      if (requests.length >= maxRequests) {
        throw new AppError(
          message ||
            `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`,
          429,
        );
      }

      // Add current request timestamp
      requests.push(now);

      // Save updated request count back to Redis
      // Set expiry to window duration to auto-cleanup
      await saveDataInRedis(
        key,
        requests,
        Math.ceil(windowMs / 1000),
        "Failed to save rate limit data",
        true,
      );

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Rate limit configurations for different CA operations
 */
export const rateLimitConfigs = {
  // User creation: 10 users per minute
  createUser: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyPrefix: "ratelimit:create_user",
    message: "Rate limit exceeded for user creation. Maximum 10 users per minute.",
  },

  // Password reset: 5 resets per minute
  passwordReset: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    keyPrefix: "ratelimit:password_reset",
    message: "Rate limit exceeded for password reset. Maximum 5 resets per minute.",
  },

  // Role assignment: 20 assignments per minute
  roleAssignment: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    keyPrefix: "ratelimit:role_assignment",
    message: "Rate limit exceeded for role assignment. Maximum 20 assignments per minute.",
  },

  // Group assignment: 20 assignments per minute
  groupAssignment: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    keyPrefix: "ratelimit:group_assignment",
    message: "Rate limit exceeded for group assignment. Maximum 20 assignments per minute.",
  },

  // General API calls: 100 requests per minute
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: "ratelimit:general",
    message: "Rate limit exceeded. Maximum 100 requests per minute.",
  },

  deleteUser: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: "ratelimit:delete_user",
    message: "Rate limit exceeded. Maximum 100 requests per minute.",
  },

  updateUser: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: "ratelimit:update_user",
    message: "Rate limit exceeded. Maximum 100 requests per minute.",
  },
};
