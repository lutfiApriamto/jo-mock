import asyncHandler     from '../../utils/asyncHandler.js';
import { sendSuccess }  from '../../utils/apiResponse.js';
import * as authService from './auth.service.js';

// ─── Cookie Config ────────────────────────────────────────────────────────────

const COOKIE_NAME = 'jm_refresh';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,                              // tidak bisa dibaca JavaScript
  secure:   IS_PRODUCTION,                     // HTTPS only di production
  sameSite: IS_PRODUCTION ? 'None' : 'Lax',   // cross-domain di prod, lokal di dev
  maxAge:   30 * 24 * 60 * 60 * 1000,         // 30 hari dalam ms
  path:     '/api/auth',                       // cookie hanya dikirim ke auth endpoints
};

const setRefreshCookie  = (res, token) => res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
const clearRefreshCookie = (res) => res.clearCookie(COOKIE_NAME, { path: '/api/auth' });

// ─── Controllers ─────────────────────────────────────────────────────────────

export const register = asyncHandler(async (req, res) => {
  const { accessToken, rawRefreshToken, user } = await authService.registerUser(req.body);
  setRefreshCookie(res, rawRefreshToken);
  sendSuccess(res, { accessToken, user }, 'Registrasi berhasil', 201);
});

export const registerAdmin = asyncHandler(async (req, res) => {
  const result = await authService.registerAdmin();
  sendSuccess(res, result, 'Superadmin berhasil dibuat', 201);
});

export const login = asyncHandler(async (req, res) => {
  const { accessToken, rawRefreshToken, user } = await authService.login(req.body);
  setRefreshCookie(res, rawRefreshToken);
  sendSuccess(res, { accessToken, user }, 'Login berhasil');
});

export const refresh = asyncHandler(async (req, res) => {
  const { accessToken, rawRefreshToken, user } = await authService.refreshAccessToken(
    req.cookies[COOKIE_NAME]
  );
  setRefreshCookie(res, rawRefreshToken); // set cookie dengan refresh token yang baru (rotation)
  sendSuccess(res, { accessToken, user }, 'Token berhasil diperbarui');
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies[COOKIE_NAME]);
  clearRefreshCookie(res);
  sendSuccess(res, null, 'Logout berhasil');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);
  sendSuccess(res, null, 'Jika email Anda terdaftar, link reset password telah dikirim ke inbox');
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword({
    token:       req.params.token,
    newPassword: req.body.newPassword,
  });
  sendSuccess(res, null, 'Password berhasil direset, silakan login dengan password baru Anda');
});

/*
  LOGIKA PEMROGRAMAN — auth.controller.js
  -----------------------------------------
  Controller adalah HTTP layer murni: ambil data dari request → panggil service → kirim response.
  Tidak ada business logic di sini.

  === COOKIE_OPTIONS ===
  Konfigurasi cookie berbeda antara dev dan production:

  Dev (NODE_ENV !== 'production'):
  - secure: false     → tidak butuh HTTPS, localhost HTTP sudah cukup
  - sameSite: 'Lax'  → cookie dikirim untuk request same-site (localhost cross-port aman)

  Production (NODE_ENV === 'production'):
  - secure: true      → wajib HTTPS — browser modern menolak SameSite=None tanpa Secure
  - sameSite: 'None'  → membolehkan cookie lintas domain (jo-mock-fe.vercel.app → jo-mock-be.vercel.app)

  httpOnly: true — PALING PENTING:
  - Cookie tidak bisa diakses via document.cookie atau JavaScript apapun
  - Proteksi utama terhadap XSS — meski script jahat bisa jalan di halaman FE,
    mereka tidak bisa mencuri refresh token

  path: '/api/auth':
  - Browser hanya mengirim cookie ini saat request ke URL yang dimulai dengan /api/auth
  - Cookie tidak bocor ke endpoint lain seperti /api/projects atau /api/mock
  - clearCookie() harus pakai path yang sama persis agar browser benar-benar menghapusnya

  maxAge vs expires:
  - maxAge dalam milidetik (bukan detik seperti header Set-Cookie standar)
  - Express mengkonversi ke format yang benar saat menyetel header
  - 30 hari = 30 * 24 * 60 * 60 * 1000 ms

  === refresh controller ===
  - Membaca cookie via req.cookies[COOKIE_NAME] (tersedia karena cookieParser di app.js)
  - Service refreshAccessToken mengembalikan refresh token BARU (rotation)
  - setRefreshCookie dipanggil lagi dengan token baru → browser update cookie otomatis

  === logout controller ===
  - Dua langkah: invalidasi di DB + hapus cookie
  - Idempotent: logout saat belum login atau double-logout tidak menghasilkan error
  - clearRefreshCookie menggunakan path yang sama saat cookie dibuat — WAJIB agar browser
    benar-benar menghapus cookie (berbeda path = browser anggap cookie berbeda)

  Cara FE menggunakan token ini:
  1. Login/register → simpan accessToken di memory (React context), jangan localStorage
  2. Setiap request ke API → sertakan header: Authorization: Bearer <accessToken>
  3. Jika response 401 → call /api/auth/refresh (cookie otomatis terkirim oleh browser)
  4. Dapat accessToken baru → update memory → ulangi request original
  5. Jika /refresh juga 401 → session habis → redirect ke login page
*/
