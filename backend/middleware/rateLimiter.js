// ========== IN-MEMORY RATE LIMITER MIDDLEWARE ==========
// Protects sensitive routes against brute-force and spam

const hits = new Map();

// Clean up expired IP logs every 5 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of hits.entries()) {
    if (now > data.resetTime) {
      hits.delete(ip);
    }
  }
}, 5 * 60 * 1000);
if (cleanupTimer.unref) cleanupTimer.unref();

module.exports = function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const max = options.max || 15; // 15 requests per window default
  const message = options.message || 'Trop de requêtes, veuillez réessayer ultérieurement.';

  return function rateLimiter(req, res, next) {
    // Disable rate limiter during automated testing
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = hits.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      record.count += 1;
    }

    hits.set(ip, record);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json({ error: message });
    }

    next();
  };
};
