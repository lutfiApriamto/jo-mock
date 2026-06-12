export const sendSuccess = (res, data = null, message = 'Berhasil', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, message = 'Terjadi kesalahan', statusCode = 500, errors = null) => {
  const payload = {
    success: false,
    message,
  };

  if (errors) payload.errors = errors;

  return res.status(statusCode).json(payload);
};

/*
  LOGIKA PEMROGRAMAN — apiResponse.js
  ------------------------------------
  Masalah yang diselesaikan:
  Tanpa utility ini, setiap controller menulis format response sendiri-sendiri.
  Akibatnya FE tidak bisa mengandalkan struktur yang konsisten.

  sendSuccess:
  - Selalu mengembalikan { success: true, message, data }
  - Parameter 'data' default null → cocok untuk operasi DELETE yang tidak perlu mengembalikan data
  - Parameter 'statusCode' default 200, bisa diubah ke 201 untuk CREATE
  - Contoh pemakaian: sendSuccess(res, project, 'Project berhasil dibuat', 201)

  sendError:
  - Selalu mengembalikan { success: false, message } minimal
  - Field 'errors' bersifat opsional → hanya muncul jika ada detail error (misal validasi)
  - Contoh pemakaian: sendError(res, 'Email sudah terdaftar', 409)
  - Contoh dengan errors: sendError(res, 'Validasi gagal', 400, [{ field: 'name', message: 'required' }])

  Kenapa tidak pakai throw Error di controller?
  Karena controller adalah lapisan HTTP — dia tidak seharusnya melempar exception.
  Error dari service akan ditangkap oleh asyncHandler → diteruskan ke errorHandler middleware.
  sendError hanya untuk kasus yang sudah diprediksi (mis. data tidak ditemukan, akses ditolak).
*/
