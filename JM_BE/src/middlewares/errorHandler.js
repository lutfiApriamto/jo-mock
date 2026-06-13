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
