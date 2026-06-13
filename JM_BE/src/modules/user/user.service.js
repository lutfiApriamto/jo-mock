import crypto  from 'crypto';
import bcrypt  from 'bcrypt';
import { v4 as uuidv4 }               from 'uuid';
import User                           from '../../models/user.model.js';
import { sendMail }                   from '../../config/mailer.js';
import { emailChangeOldTemplate,
         emailChangeNewTemplate }     from '../../templates/emailChange.template.js';
import { passwordChangeTemplate }     from '../../templates/passwordChange.template.js';

const SALT_ROUNDS = 12;

// Field yang dikembalikan ke client — tidak pernah expose password, token, atau hash
const sanitizeUser = (user) => ({
  _id:       user._id,
  name:      user.name,
  email:     user.email,
  role:      user.role,
  avatar:    user.avatar,
  apiKey:    user.apiKey,
  quota:     user.quota,
  createdAt: user.createdAt,
});

// ─── Exports ─────────────────────────────────────────────────────────────────

// Ambil profil user yang sedang login.
export const getMyProfile = async (userId) => {
  const user = await User.findById(userId)
    .select('name email role avatar apiKey quota createdAt')
    .lean();

  if (!user) {
    const err = new Error('Akun tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

// Update profil: name, avatar, dan/atau email.
//
// Aturan untuk email:
//   - currentPassword wajib disertakan jika email ingin diubah
//   - password diverifikasi sebelum perubahan diterapkan
//   - email baru harus unik di seluruh platform
//   - notifikasi dikirim ke email LAMA dan email BARU secara sequential
export const updateMyProfile = async (userId, { name, avatar, email, currentPassword }) => {
  const hasChange = name || avatar || email;
  if (!hasChange) {
    const err = new Error('Minimal satu field (name, avatar, atau email) harus diisi');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('Akun tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const isEmailChange = email && email.toLowerCase() !== user.email;

  if (isEmailChange) {
    // currentPassword wajib untuk mengubah email
    if (!currentPassword) {
      const err = new Error('currentPassword diperlukan untuk mengubah email');
      err.statusCode = 400;
      throw err;
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      const err = new Error('Password tidak sesuai');
      err.statusCode = 401;
      throw err;
    }

    // Email baru tidak boleh sudah dipakai akun lain
    const emailTaken = await User.exists({ email: email.toLowerCase(), _id: { $ne: userId } });
    if (emailTaken) {
      const err = new Error('Email sudah digunakan oleh akun lain');
      err.statusCode = 409;
      throw err;
    }
  }

  const oldEmail = user.email;
  if (name)            user.name   = name;
  if (avatar)          user.avatar = avatar;
  if (isEmailChange)   user.email  = email.toLowerCase();
  await user.save();

  // Kirim notifikasi ke email lama dan baru secara sequential jika email berubah
  if (isEmailChange) {
    try {
      const oldMail = emailChangeOldTemplate({ name: user.name, newEmail: user.email });
      await sendMail({ to: oldEmail, ...oldMail });
    } catch (err) {
      console.error('[user] Gagal kirim notifikasi ke email lama:', err.message);
    }

    try {
      const newMail = emailChangeNewTemplate({ name: user.name });
      await sendMail({ to: user.email, ...newMail });
    } catch (err) {
      console.error('[user] Gagal kirim notifikasi ke email baru:', err.message);
    }
  }

  return sanitizeUser(user);
};

// Ganti password akun.
// Alur:
//   1. Verifikasi currentPassword
//   2. Pastikan password baru berbeda
//   3. Hash dan simpan password baru
//   4. Null-kan refreshToken → semua sesi lain langsung invalid (harus login ulang)
//   5. Kirim email notifikasi
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('Akun tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    const err = new Error('Password saat ini tidak sesuai');
    err.statusCode = 401;
    throw err;
  }

  const sameAsOld = await bcrypt.compare(newPassword, user.password);
  if (sameAsOld) {
    const err = new Error('Password baru tidak boleh sama dengan password saat ini');
    err.statusCode = 400;
    throw err;
  }

  user.password     = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.refreshToken = null; // Invalidasi semua sesi aktif di perangkat lain
  await user.save();

  // Notifikasi email — kegagalan tidak boleh membatalkan operasi yang sudah berhasil
  try {
    const { subject, html, text } = passwordChangeTemplate({ name: user.name });
    await sendMail({ to: user.email, subject, html, text });
  } catch (err) {
    console.error('[user] Gagal kirim notifikasi ganti password:', err.message);
  }
};

// Cari user berdasarkan nama atau email (case insensitive).
// Hanya mengembalikan field publik — tidak expose apiKey, quota, atau password.
export const searchUsers = async (q) => {
  if (!q || q.trim().length < 2) {
    const err = new Error('Kata kunci pencarian minimal 2 karakter');
    err.statusCode = 400;
    throw err;
  }

  const regex = new RegExp(q.trim(), 'i');

  return User.find({ $or: [{ name: regex }, { email: regex }] })
    .select('_id name email avatar')
    .limit(20)
    .lean();
};

// Generate ulang API key menjadi UUID baru.
// currentPassword wajib sebagai konfirmasi identitas — proteksi jika sesi dicuri.
// API key lama langsung tidak berlaku setelah fungsi ini sukses.
export const regenerateApiKey = async (userId, { currentPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('Akun tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    const err = new Error('Password tidak sesuai');
    err.statusCode = 401;
    throw err;
  }

  user.apiKey = uuidv4();
  await user.save();

  return { apiKey: user.apiKey };
};
