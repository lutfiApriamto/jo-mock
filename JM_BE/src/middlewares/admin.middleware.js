import { sendError } from '../utils/apiResponse.js';

const admin = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Autentikasi diperlukan', 401);
  }

  if (req.user.role !== 'superadmin') {
    return sendError(res, 'Akses ditolak. Hanya superadmin yang diizinkan.', 403);
  }

  next();
};

export default admin;

/*
  LOGIKA PEMROGRAMAN — admin.middleware.js
  ------------------------------------------
  Middleware ini SELALU dijalankan setelah auth.middleware.js — tidak boleh berdiri sendiri.
  Urutan wajib: auth.middleware → admin.middleware → controller

  Cara pemakaian di routes:
    router.get('/users', auth, admin, adminController.getAllUsers)

  Pengecekan req.user:
  - Guard clause pertama memastikan auth.middleware sudah berjalan sebelumnya
  - Jika req.user tidak ada berarti middleware dipasang tanpa auth → kembalikan 401
  - Ini defensive check agar error tidak muncul sebagai 500 (crash) melainkan 401 yang jelas

  Pengecekan role:
  - role 'superadmin' adalah role di level PLATFORM (disimpan di User.role)
  - Berbeda dari role di dalam project (PM/FE/BE) yang dicek oleh permission.middleware.js
  - Jika role bukan superadmin → 403 Forbidden (beda dari 401: user sudah login, tapi tidak punya akses)

  Kenapa tidak async?
  - Middleware ini hanya membaca req.user yang sudah ada di memori (dari auth.middleware)
  - Tidak ada operasi DB, tidak perlu async/await, tidak perlu asyncHandler
*/
