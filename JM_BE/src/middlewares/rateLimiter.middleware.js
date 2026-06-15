import rateLimit from 'express-rate-limit';

// Factory rate limiter dengan default JO-MOCK + format error konsisten (sendError-style).
//
// FITUR: limiter otomatis DI-SKIP saat development (NODE_ENV !== 'production'),
// supaya testing berulang (mis. submit register/login berkali-kali) tidak ke-block 429.
// Di production limiter aktif penuh. `skip` dievaluasi per-request agar tidak
// bergantung pada urutan load env.
export const createRateLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    limit:           max,
    standardHeaders: true,
    legacyHeaders:   false,
    skip:            () => process.env.NODE_ENV !== 'production',
    message: {
      errorStatus: true,
      errorType:   'TooManyRequests',
      errors:      [{ message, code: 429 }],
    },
  });
