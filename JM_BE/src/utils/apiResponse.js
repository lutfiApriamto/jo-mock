const HTTP_ERROR_TYPES = {
  400: 'BadRequest',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'NotFound',
  409: 'Conflict',
  410: 'Gone',
  422: 'UnprocessableEntity',
  429: 'TooManyRequests',
  500: 'InternalServerError',
};

/**
 * @param {import('express').Response} res
 * @param {*} data          - payload utama (object, array, atau null)
 * @param {string} message
 * @param {number} statusCode
 * @param {object|null} meta - hasil buildPaginationMeta(), opsional
 */
export const sendSuccess = (res, data = null, message = 'Berhasil', statusCode = 200, meta = null) => {
  const responseData = { data, message };

  if (meta) {
    responseData.totalData = meta.total;
    responseData.totalPage = meta.totalPages;
  }

  return res.status(statusCode).json({
    errorStatus: false,
    data: responseData,
  });
};

/**
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 * @param {Array|null} errors      - array of { message, code }
 * @param {string|null} errorType  - override tipe error, default auto-derive dari statusCode
 */
export const sendError = (res, message = 'Terjadi kesalahan', statusCode = 500, errors = null, errorType = null) => {
  return res.status(statusCode).json({
    errorStatus: true,
    errorType:   errorType || HTTP_ERROR_TYPES[statusCode] || 'InternalServerError',
    errors:      errors || [{ message, code: statusCode }],
  });
};

/*
  LOGIKA PEMROGRAMAN — apiResponse.js
  -------------------------------------
  sendSuccess(res, data, message, statusCode, meta):
  - Semua response sukses punya wrapper { errorStatus: false, data: { data, message } }
  - FE mengakses payload via response.data.data (konsisten untuk semua endpoint)
  - meta → hasil buildPaginationMeta() dari utils/paginate.js
    Jika ada → tambahkan totalData dan totalPage ke dalam data object
    Jika tidak → tidak ada field pagination di response

  Contoh response list dengan pagination:
  {
    "errorStatus": false,
    "data": { "data": [...], "message": "...", "totalData": 33, "totalPage": 4 }
  }

  Contoh response single object atau null (delete):
  {
    "errorStatus": false,
    "data": { "data": {...} atau null, "message": "..." }
  }

  sendError(res, message, statusCode, errors, errorType):
  - Semua response error punya wrapper { errorStatus: true, errorType, errors: [...] }
  - errorType di-derive otomatis dari statusCode via HTTP_ERROR_TYPES
    Bisa di-override dengan parameter ke-5 (mis. 'ValidationError' untuk 400)
    karena 400 normalnya 'BadRequest', tapi Mongoose/Ajv validation → 'ValidationError'
  - errors: jika tidak ada → buat single-item array dari message + statusCode
    Jika ada (Ajv/Mongoose errors) → gunakan array yang dikirim, format { message, code }

  Contoh response error validasi:
  {
    "errorStatus": true,
    "errorType": "ValidationError",
    "errors": [
      { "message": "name: must NOT have fewer than 1 characters", "code": 400 }
    ]
  }
*/
