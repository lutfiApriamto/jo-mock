import { verifyToken }  from '../utils/jwtHelper.js';
import { sendError }    from '../utils/apiResponse.js';
import asyncHandler     from '../utils/asyncHandler.js';
import User             from '../models/user.model.js';

const auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Token tidak ditemukan', 401);
  }

  const token          = authHeader.split(' ')[1];
  const { valid, decoded } = verifyToken(token);

  if (!valid) {
    return sendError(res, 'Token tidak valid atau sudah expired', 401);
  }

  const user = await User.findById(decoded._id).select('-password');

  if (!user) {
    return sendError(res, 'Akun tidak ditemukan', 401);
  }

  req.user = user;
  next();
});

export default auth;

/*
  LOGIKA PEMROGRAMAN — auth.middleware.js
  -----------------------------------------
  Middleware ini dijalankan di semua route dashboard yang membutuhkan login.
  Urutan eksekusi: request → auth.middleware → controller/middleware berikutnya

  Ekstraksi token:
  - Token dikirim di header 'Authorization' dengan format 'Bearer <token>'
  - Cek apakah header ada dan diawali 'Bearer ' (ada spasi setelah Bearer)
  - .split(' ')[1] → ambil bagian setelah 'Bearer ', itulah token-nya
  - Jika header tidak ada atau format salah → langsung tolak 401

  Verifikasi token:
  - Diserahkan ke jwtHelper.verifyToken() yang mengembalikan { valid, decoded }
  - Jika tidak valid (expired, signature salah, format rusak) → tolak 401

  Mengapa fetch user dari DB meski sudah ada data di decoded token?
  - JWT bersifat stateless — sekali diterbitkan, token tidak bisa dicabut
  - Jika superadmin menon-aktifkan akun seseorang, token lama tetap valid
  - Dengan fetch ulang ke DB, kita memastikan:
    (a) akun masih ada di sistem
    (b) role user adalah yang terbaru (bukan dari snapshot saat token dibuat)
  - .select('-password') → tidak ambil field password dari DB ke memori

  req.user:
  - Data user yang sudah terverifikasi dilekatkan ke req.user
  - Middleware dan controller berikutnya bisa langsung pakai req.user tanpa query DB lagi
*/
