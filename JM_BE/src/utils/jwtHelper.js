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

