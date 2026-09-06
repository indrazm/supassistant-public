export const env = {
  get redisUrl(): string {
    const url = process.env.REDIS_URL;
    return url && url.length > 0 ? url : "redis://127.0.0.1:6379";
  },
};
