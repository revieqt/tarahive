import IORedis, { RedisOptions } from "ioredis";

export const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || "redis",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
};

export const redis = new IORedis(redisOptions);

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

export default redis;