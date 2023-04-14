import rateLimit from "express-rate-limit";

export const ratelimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1,
});
