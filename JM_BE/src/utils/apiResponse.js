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
