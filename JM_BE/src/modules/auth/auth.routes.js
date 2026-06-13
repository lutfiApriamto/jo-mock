import { Router }    from 'express';
import rateLimit      from 'express-rate-limit';
import validate       from '../../middlewares/validate.middleware.js';
import * as schema    from './auth.schema.js';
import * as ctrl      from './auth.controller.js';

const router = Router();

// Rate limiter untuk endpoint sensitif: max 10 request per 15 menit per IP.
// Melindungi dari brute-force login, spam register, dan spam forgot-password.
const authLimiter = rateLimit({
  windowMs:          15 * 60 * 1000, // 15 menit
  max:               10,
  standardHeaders:   true,
  legacyHeaders:     false,
  message: {
    errorStatus: true,
    errorType:   'TooManyRequests',
    errors:      [{ message: 'Terlalu banyak percobaan. Silakan coba lagi setelah 15 menit.', code: 429 }],
  },
});

// POST /api/auth/register — daftar akun user biasa
router.post('/register', authLimiter, validate(schema.registerSchema), ctrl.register);

// POST /api/auth/admin/register — inisialisasi superadmin (sekali pakai, tanpa auth)
router.post('/admin/register', ctrl.registerAdmin);

// POST /api/auth/login — login untuk semua role (user & superadmin)
router.post('/login', authLimiter, validate(schema.loginSchema), ctrl.login);

// POST /api/auth/forgot-password — kirim email link reset password
router.post('/forgot-password', authLimiter, validate(schema.forgotPasswordSchema), ctrl.forgotPassword);

// POST /api/auth/reset-password/:token — ganti password dengan token dari email
router.post('/reset-password/:token', validate(schema.resetPasswordSchema), ctrl.resetPassword);

// POST /api/auth/refresh — tukar refresh token (cookie) dengan access token baru
router.post('/refresh', ctrl.refresh);

// POST /api/auth/logout — invalidasi refresh token di DB + hapus cookie
router.post('/logout', ctrl.logout);

export default router;
