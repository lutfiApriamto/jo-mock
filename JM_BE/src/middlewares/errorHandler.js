import { sendError } from '../utils/apiResponse.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Terjadi kesalahan pada server';
  let errors     = null;

  // Mongoose: validasi schema gagal (mis. field required tidak diisi)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = 'Validasi data gagal';
    errors     = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
  }

  // Mongoose: duplicate key (mis. email atau slug sudah dipakai)
  if (err.code === 11000) {
    statusCode      = 409;
    const field     = Object.keys(err.keyValue)[0];
    const value     = err.keyValue[field];
    message         = `${field} '${value}' sudah digunakan`;
  }

  // Mongoose: CastError — ID di params bukan ObjectId yang valid
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Format ID tidak valid: ${err.value}`;
  }

  // JWT: token rusak atau signature tidak cocok
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Token tidak valid';
  }

  // JWT: token sudah melewati waktu expired
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token sudah expired, silakan login ulang';
  }

  sendError(res, message, statusCode, errors);
};

export default errorHandler;

/*
  LOGIKA PEMROGRAMAN — errorHandler.js
  ---------------------------------------
  Ini adalah GLOBAL error handler Express. Dipasang paling akhir di app.js (setelah notFound).
  Cara pemakaian di app.js:
    app.use(notFound)
    app.use(errorHandler)  ← paling bawah

  Apa yang dikirim ke sini?
  - Semua error yang di-throw di dalam asyncHandler → ditangkap oleh .catch(next)
  - Error yang diteruskan manual via next(err) dari middleware/controller

  Mengapa 4 parameter (err, req, res, next)?
  - Express mengidentifikasi error handler dari JUMLAH PARAMETER — wajib 4
  - Jika hanya 3 parameter, Express tidak menganggapnya sebagai error handler
  - Parameter 'next' tidak dipakai tapi HARUS ada agar Express mengenalinya

  Penanganan per jenis error:

  ValidationError (Mongoose):
  - Terjadi saat save/create dokumen yang tidak sesuai schema Mongoose
  - err.errors adalah object berisi semua field yang gagal validasi
  - Object.values() → ambil semua nilai dari object
  - Di-map ke format { field, message } yang konsisten

  Duplicate Key Error (code 11000):
  - Terjadi saat menyimpan nilai yang harus unique tapi sudah ada (email, slug, apiKey)
  - err.keyValue berisi { namaField: nilaiYangDuplikat }
  - Object.keys()[0] → ambil nama field pertama yang duplikat
  - Status 409 Conflict (bukan 400) karena data valid tapi konflik dengan data yang ada

  CastError (Mongoose):
  - Terjadi saat ID di params bukan format ObjectId yang valid
  - Contoh: /projects/abc → 'abc' bukan ObjectId → CastError
  - Tanpa ini, error mentah Mongoose akan bocor ke client sebagai 500

  JWT Errors:
  - JsonWebTokenError → token dimanipulasi atau format salah
  - TokenExpiredError → token masih valid secara format tapi sudah expired
  - Keduanya mengembalikan 401 dengan pesan yang berbeda untuk membantu FE debug

  Fallback (statusCode 500):
  - Error tak terduga yang tidak masuk kategori di atas
  - err.statusCode bisa di-set manual di service: const err = new Error('...'); err.statusCode = 422
  - Jika tidak ada statusCode → default 500 Internal Server Error
*/
