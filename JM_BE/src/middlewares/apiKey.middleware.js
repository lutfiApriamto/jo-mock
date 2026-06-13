import { sendError } from '../utils/apiResponse.js';
import asyncHandler   from '../utils/asyncHandler.js';
import User           from '../models/user.model.js';

const apiKey = asyncHandler(async (req, res, next) => {
  const key = req.headers['x-api-key'];

  if (!key) {
    return sendError(res, 'API key tidak ditemukan. Sertakan x-api-key di header.', 401);
  }

  const user = await User.findOne({ apiKey: key });

  if (!user) {
    return sendError(res, 'API key tidak valid', 401);
  }

  req.mockUser = user;
  next();
});

export default apiKey;
