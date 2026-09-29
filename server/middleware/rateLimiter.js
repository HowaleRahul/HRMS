import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Increased for development
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  }
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased for development (was 100)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  }
});
