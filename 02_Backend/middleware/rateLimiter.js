/**
 * Simple in-memory rate limiter (no external dependency).
 * For production, use `express-rate-limit` + Redis.
 */

const requestCounts = new Map();

/**
 * @param {number} maxRequests - Max requests allowed
 * @param {number} windowMs    - Time window in milliseconds
 */
const rateLimiter = (maxRequests = 10, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const key = `${ip}:${req.path}`;

    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, startTime: now });
      return next();
    }

    const record = requestCounts.get(key);

    // Reset window if expired
    if (now - record.startTime > windowMs) {
      record.count = 1;
      record.startTime = now;
      return next();
    }

    record.count++;

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((windowMs - (now - record.startTime)) / 1000) + 's',
      });
    }

    next();
  };
};

// Preset limiters
const authLimiter = rateLimiter(10, 15 * 60 * 1000);   // 10 req / 15 min
const strictLimiter = rateLimiter(5, 60 * 60 * 1000);   // 5 req / 1 hour

module.exports = { rateLimiter, authLimiter, strictLimiter };
