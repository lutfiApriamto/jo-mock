import { sendError } from '../utils/apiResponse.js';
import asyncHandler   from '../utils/asyncHandler.js';
import User           from '../models/user.model.js';

const quota = asyncHandler(async (req, res, next) => {
  if (!req.mockUser) {
    return sendError(res, 'API key diperlukan sebelum pengecekan kuota', 401);
  }

  const { limit, used } = req.mockUser.quota;

  if (used >= limit) {
    return sendError(
      res,
      'Kuota hit mock Anda telah habis. Silakan hubungi administrator untuk reset.',
      429
    );
  }

  await User.findByIdAndUpdate(
    req.mockUser._id,
    { $inc: { 'quota.used': 1 } }
  );

  next();
});

export default quota;

/*
  LOGIKA PEMROGRAMAN — quota.middleware.js
  ------------------------------------------
  Middleware ini SELALU dijalankan setelah apiKey.middleware.js — tidak boleh berdiri sendiri.
  Urutan wajib di route mock: apiKey.middleware → quota.middleware → mock.controller

  Cara pemakaian di routes:
    router.all('/:projectSlug/*', apiKey, quota, mockController.handle)

  Pengecekan kuota:
  - Membaca req.mockUser.quota yang sudah diisi oleh apiKey.middleware
  - used >= limit → kuota habis → tolak 429 (Too Many Requests)
  - Kondisi 'limit = 0' (blocked by superadmin) juga tertangkap: used(0) >= limit(0) = true
  - Kondisi normal: used(500) >= limit(10000) = false → lanjut

  Increment ($inc):
  - Menggunakan MongoDB atomic operator $inc agar increment aman dari race condition
  - $inc: { 'quota.used': 1 } → tambah 1 ke field nested quota.used
  - Mengapa increment SEBELUM mock diproses (bukan setelah)?
    Karena kita sudah sepakati: semua hit dihitung, valid maupun tidak
    Jika increment setelah response, hit yang gagal karena endpoint tidak ada tidak terhitung
    Dengan increment di sini, setiap hit yang lolos API key validation = terhitung

  Status 429:
  - 429 Too Many Requests adalah kode HTTP standar untuk rate limit / quota exceeded
  - Lebih tepat dari 403 (Forbidden) karena masalahnya bukan izin, tapi batas pemakaian
  - Pesan error mengarahkan user untuk hubungi admin (karena tidak ada self-service top-up di MVP)
*/
