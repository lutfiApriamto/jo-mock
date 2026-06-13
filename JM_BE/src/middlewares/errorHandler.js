import { sendError } from '../utils/apiResponse.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Terjadi kesalahan pada server';
  // Jika service layer sudah menyiapkan array errors (mis. validasi field-level di mock),
  // teruskan langsung. Blok khusus di bawah akan menimpa ini jika perlu.
  let errors     = Array.isArray(err.errors) ? err.errors : null;

  // Mongoose: validasi schema gagal (mis. field required tidak diisi)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = 'Validasi data gagal';
    errors     = Object.values(err.errors).map((e) => ({
      message: `${e.path}: ${e.message}`,
      code:    400,
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

  const errorType = err.name === 'ValidationError' ? 'ValidationError' : undefined;
  sendError(res, message, statusCode, errors, errorType);
};

export default errorHandler;
