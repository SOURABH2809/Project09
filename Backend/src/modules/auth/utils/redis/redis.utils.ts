import redis from "../../../../shared/config/redis.conf.js";
import { AppError } from "../errors/AppError.js";

const logRedisWarning = (msg: string, err: unknown) => {
  console.warn(`[REDIS] ${msg}`, {
    error: err instanceof Error ? err.message : err,
  });
};

// Save data in Redis with TTL

export const saveDataInRedis = async (
  key: string,
  data: unknown,
  ttlInSeconds: number,
  errorMsg = "Failed to save data in Redis",
  suppressError = false,
): Promise<boolean | undefined> => {
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlInSeconds);
    return true;
  } catch (err) {
    if (suppressError) {
      logRedisWarning(errorMsg, err);
      return;
    }
    throw new AppError("Internal Server Error", 500);
  }
};

// Get data from Redis
export const getDataFromRedis = async <T>(
  key: string,
  suppressError = false,
  errorMsg = "Failed to fetch data from Redis",
): Promise<T | null> => {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    if (suppressError) {
      logRedisWarning(errorMsg, err);
      return null;
    }
    throw new AppError("Internal Server Error", 500);
  }
};

// Delete key from Redis
export const deleteFromRedis = async (
  key: string,
  errorMsg = "Failed to delete Redis key",
  suppressError = false,
): Promise<void> => {
  try {
    await redis.del(key);
  } catch (err) {
    if (suppressError) {
      logRedisWarning(errorMsg, err);
      return;
    }
    throw new AppError("Internal Server Error", 500);
  }
};

// Check if key exists in Redis
export const existsInRedis = async (
  key: string,
  errorMsg = "Failed to check Redis key existence",
  suppressError = false,
): Promise<boolean> => {
  try {
    return (await redis.exists(key)) === 1;
  } catch (err) {
    if (suppressError) {
      logRedisWarning(errorMsg, err);
      return false;
    }
    throw new AppError("Internal Server Error", 500);
  }
};

// Get TTL of a key
export const getRedisTTL = async (
  key: string,
  errorMsg = "Failed to get Redis TTL",
  suppressError = false,
): Promise<number> => {
  try {
    return await redis.ttl(key);
  } catch (err) {
    if (suppressError) {
      logRedisWarning(errorMsg, err);
      return -1;
    }
    throw new AppError("Internal Server Error", 500);
  }
};
