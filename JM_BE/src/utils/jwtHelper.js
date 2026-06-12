import jwt from 'jsonwebtoken';

const SECRET     = process.env.KEY;
const DEFAULT_EXPIRY = '7d';

export const signToken = (payload, expiresIn = DEFAULT_EXPIRY) => {
  return jwt.sign(payload, SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET);
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, decoded: null, error: err.message };
  }
};

/*
  LOGIKA PEMROGRAMAN — jwtHelper.js
  -----------------------------------
  Masalah yang diselesaikan:
  Operasi JWT (sign & verify) dipakai di dua tempat berbeda:
  - auth.service.js     → sign token saat login/register
  - auth.middleware.js  → verify token di setiap request dashboard
  Tanpa utility ini, SECRET dan konfigurasi JWT tersebar di dua tempat.
  Jika ingin ganti expiry atau algoritma, harus ubah di semua tempat.

  Kenapa SECRET diambil dari process.env.KEY?
  - Secret JWT tidak boleh hardcode di source code (risiko keamanan)
  - Nilai KEY sudah didefinisikan di file .env milik lu
  - Di Vercel nanti, KEY diset sebagai environment variable di dashboard

  signToken(payload, expiresIn):
  - payload → data yang disimpan di dalam token, biasanya { _id, role }
  - JANGAN simpan data sensitif (password, apiKey) di payload JWT
  - expiresIn default '7d' → token expired setelah 7 hari
  - Bisa diubah: '1d' (1 hari), '2h' (2 jam), dst
  - Contoh pemakaian di auth.service.js:
      const token = signToken({ _id: user._id, role: user.role })

  verifyToken(token):
  - Menggunakan try-catch karena jwt.verify() melempar exception jika token tidak valid
  - Return object { valid, decoded, error } agar pemanggil bisa handle sendiri
  - valid: false bisa terjadi karena: token expired, signature tidak cocok, format salah
  - Tidak melempar error keluar → middleware yang memutuskan respons apa yang dikirim ke client
  - Contoh pemakaian di auth.middleware.js:
      const { valid, decoded } = verifyToken(token)
      if (!valid) return sendError(res, 'Token tidak valid', 401)
      req.user = decoded
*/
