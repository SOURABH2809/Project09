import { Redis }  from "ioredis";

const  REDIS_HOST = process.env.REDIS_HOST
const  REDIS_PORT = process.env.REDIS_PORT

if(!REDIS_HOST || !REDIS_PORT) {
  throw new Error("Redis configurations not provided");
}

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD
});

redis.on("connect", () => console.log("[REDIS]: Connected to Redis"));
redis.on("error", (err: any) => console.error("[REDIS]: Redis error", err));

export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const result = await redis.ping();
    return result === "PONG";
  } catch {
    return false;
  }
};

export default redis;
