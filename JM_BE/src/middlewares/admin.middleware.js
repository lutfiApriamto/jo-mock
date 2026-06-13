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