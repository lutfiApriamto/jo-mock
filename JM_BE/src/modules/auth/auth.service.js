import crypto  from 'crypto';
import bcrypt  from 'bcrypt';
import User    from '../../models/user.model.js';
import { signToken }                    from '../../utils/jwtHelper.js';
import { sendMail }                     from '../../config/mailer.js';
import { forgotPasswordTemplate }       from '../../templates/forgotPassword.template.js';
import { resetPasswordSuccessTemplate } from '../../templates/resetPassword.template.js';

const SALT_ROUNDS          = 12;
const ACCESS_TOKEN_EXPIRY  = '15m';
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 jam

// ─── Private Helpers ─────────────────────────────────────────────────────────

const sanitizeUser = (user) => ({
  _id:    user._id,
  name:   user.name,
  email:  user.email,
  role:   user.role,
  avatar: user.avatar,
  quota:  user.quota,
});

// Generate access token (JWT) + refresh token (opaque), simpan hashed refresh di DB
const createTokens = async (user) => {
  const accessToken = signToken({ id: user._id, role: user.role }, ACCESS_TOKEN_EXPIRY);

  const rawRefreshToken    = crypto.randomBytes(40).toString('hex');
  const hashedRefreshToken = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  await User.findByIdAndUpdate(user._id, { refreshToken: hashedRefreshToken });

  return { accessToken, rawRefreshToken };
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const registerUser = async ({ name, email, password }) => {
  const exists = await User.exists({ email: email.toLowerCase() });
  if (exists) {
    const err = new Error('Email sudah terdaftar');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user   = await User.create({ name, email, password: hashed });
  const { accessToken, rawRefreshToken } = await createTokens(user);

  return { accessToken, rawRefreshToken, user: sanitizeUser(user) };
};

export const registerAdmin = async () => {
  const exists = await User.exists({ role: 'superadmin' });
  if (exists) {
    const err = new Error('Superadmin sudah terdaftar. Endpoint ini hanya bisa dipakai sekali.');
    err.statusCode = 409;
    throw err;
  }

  const { EMAIL_ADMIN, EMAIL_ADMIN_PASS } = process.env;
  if (!EMAIL_ADMIN || !EMAIL_ADMIN_PASS) {
    const err = new Error('Kredensial admin belum dikonfigurasi di server');
    err.statusCode = 500;
    throw err;
  }

  const hashed = await bcrypt.hash(EMAIL_ADMIN_PASS, SALT_ROUNDS);
  const admin  = await User.create({
    name:     'Super Admin',
    email:    EMAIL_ADMIN,
    password: hashed,
    role:     'superadmin',
  });

  return { adminId: admin._id, email: admin.email };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  // Pesan error sama untuk email tidak ditemukan DAN password salah — mencegah user enumeration
  const invalidErr = new Error('Email atau password salah');
  invalidErr.statusCode = 401;

  if (!user) throw invalidErr;

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw invalidErr;

  const { accessToken, rawRefreshToken } = await createTokens(user);
  return { accessToken, rawRefreshToken, user: sanitizeUser(user) };
};

export const refreshAccessToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    const err = new Error('Sesi tidak ditemukan, silakan login kembali');
    err.statusCode = 401;
    throw err;
  }

  const hashed = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  const user   = await User.findOne({ refreshToken: hashed });

  if (!user) {
    const err = new Error('Sesi tidak valid, silakan login kembali');
    err.statusCode = 401;
    throw err;
  }

  // Token rotation: generate refresh token baru dan invalidasi yang lama seketika
  const newRaw    = crypto.randomBytes(40).toString('hex');
  const newHashed = crypto.createHash('sha256').update(newRaw).digest('hex');
  user.refreshToken = newHashed;
  await user.save();

  const accessToken = signToken({ id: user._id, role: user.role }, ACCESS_TOKEN_EXPIRY);

  return { accessToken, rawRefreshToken: newRaw, user: sanitizeUser(user) };
};

export const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;

  const hashed = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  // Idempotent: tidak throw jika token tidak ditemukan (user mungkin sudah logout sebelumnya)
  await User.findOneAndUpdate({ refreshToken: hashed }, { refreshToken: null });
};

export const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  // Selalu return sukses meski email tidak ditemukan — mencegah user enumeration attack
  if (!user) return;

  const rawToken    = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken  = hashedToken;
  user.resetPasswordExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
  const { subject, html, text } = forgotPasswordTemplate({ name: user.name, resetUrl });
  await sendMail({ to: user.email, subject, html, text });
};

export const resetPassword = async ({ token, newPassword }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    const err = new Error('Token tidak valid atau sudah kedaluwarsa');
    err.statusCode = 400;
    throw err;
  }

  user.password            = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.resetPasswordToken  = null;
  user.resetPasswordExpiry = null;
  await user.save();

  const { subject, html, text } = resetPasswordSuccessTemplate({ name: user.name });
  await sendMail({ to: user.email, subject, html, text });
};
