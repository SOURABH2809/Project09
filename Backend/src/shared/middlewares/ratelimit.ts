import { NextFunction, Request, Response } from "express";
import redis from "../config/redis.conf.js";

export interface RateLimitConfig {
  limit: number;
  window: number;
}

export interface RateLimitMiddlewareConfig extends RateLimitConfig {
  keyGenerator: (req: Request) => string;
}

export function rateLimitMiddleware(config: RateLimitMiddlewareConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = config.keyGenerator(req);

    const result = await rateLimit(key, {
      limit: config.limit,
      window: config.window,
    });

    if (!result.allowed) {
      return res.status(429).json({
        message: `Too many requests, Please try after ${result.retryAfter} sec.`,
        retryAfter: result.retryAfter,
      });
    }

    res.setHeader("X-RateLimit-Remaining", result.remaining);
    next();
  };
}

async function rateLimit(key: string, config: RateLimitConfig) {
  const redisKey = `ratelimit:${key}`;

  const current = await redis.incr(redisKey);

  if (current === 1) {
    // Set expirty at first time
    await redis.expire(redisKey, config.window);
  }

  if (current > config.limit) {
    // Limit exceeded
    const ttl = await redis.ttl(redisKey);
    return {
      allowed: false,
      remaining: 0,
      retryAfter: ttl,
    };
  }

  return {
    allowed: true,
    remaining: config.limit - current,
  };
}
