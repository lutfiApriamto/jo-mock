import { Router }    from 'express';
import validate       from '../../middlewares/validate.middleware.js';
import * as schema    from './auth.schema.js';
import * as ctrl      from './auth.controller.js';

const router = Router();

// POST /api/auth/register — daftar akun user biasa
router.post('/register', validate(schema.registerSchema), ctrl.register);

// POST /api/auth/admin/register — inisialisasi superadmin (sekali pakai, tanpa auth)
router.post('/admin/register', ctrl.registerAdmin);

// POST /api/auth/login — login untuk semua role (user & superadmin)
router.post('/login', validate(schema.loginSchema), ctrl.login);

// POST /api/auth/forgot-password — kirim email link reset password
router.post('/forgot-password', validate(schema.forgotPasswordSchema), ctrl.forgotPassword);

// POST /api/auth/reset-password/:token — ganti password dengan token dari email
router.post('/reset-password/:token', validate(schema.resetPasswordSchema), ctrl.resetPassword);

// POST /api/auth/refresh — tukar refresh token (cookie) dengan access token baru
router.post('/refresh', ctrl.refresh);

// POST /api/auth/logout — invalidasi refresh token di DB + hapus cookie
router.post('/logout', ctrl.logout);

export default router;

/*
  LOGIKA PEMROGRAMAN — auth.routes.js
  ---------------------------------------
  File ini mendaftarkan semua route yang berkaitan dengan autentikasi.
  Semua route di file ini akan diprefix dengan '/api/auth' saat didaftarkan di app.js:
    app.use('/api/auth', authRoutes)

  Tidak ada middleware auth (JWT check) di sini — semua route auth bersifat publik.
  User yang belum login perlu akses ke register, login, dan forgot-password.

  Middleware stack per route:
  1. validate(schema) → validasi req.body terhadap JSON Schema (Ajv)
     Jika gagal → 400 langsung dikembalikan, controller tidak pernah dipanggil
  2. controller → business logic via service

  /admin/register — tidak pakai validate():
  - Endpoint ini tidak menerima request body sama sekali
  - Kredensial admin dibaca dari .env oleh service
  - Tidak ada yang perlu divalidasi dari client

  /reset-password/:token — :token di URL:
  - Token reset password dikirim via URL path, bukan body atau query string
  - URL path token lebih aman dari query string (query string sering di-log oleh server/proxy)
  - validate() hanya memvalidasi body (newPassword) — token diambil via req.params di controller

  Urutan route:
  - '/admin/register' sebelum '/' routes biasa — Express mencocokkan dari atas ke bawah
  - Dengan prefix '/admin/', tidak ada ambiguitas dengan route '/:id' atau route lain
*/
