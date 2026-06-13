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
