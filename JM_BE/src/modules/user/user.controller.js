// Controller user — semua operasi terhadap akun milik user yang sedang login.
// userId selalu diambil dari req.user.id (sudah diverifikasi auth middleware).

import asyncHandler    from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as userService from './user.service.js';

// Ambil data profil user yang sedang login — termasuk apiKey dan quota.
export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getMyProfile(req.user._id);
  sendSuccess(res, profile, 'Profil berhasil diambil');
});

// Update nama, avatar, dan/atau email.
// Jika email diubah → notifikasi dikirim ke email lama dan email baru.
export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateMyProfile(req.user._id, req.body);
  sendSuccess(res, user, 'Profil berhasil diperbarui');
});

// Ganti password dengan verifikasi currentPassword.
// Setelah berhasil: semua sesi lain invalid + email notifikasi terkirim.
export const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user._id, req.body);
  sendSuccess(res, null, 'Password berhasil diubah. Silakan login ulang di perangkat lain.');
});

// Generate ulang API key — currentPassword wajib sebagai konfirmasi.
// API key lama langsung tidak berlaku.
export const regenerateApiKey = asyncHandler(async (req, res) => {
  const result = await userService.regenerateApiKey(req.user._id, req.body);
  sendSuccess(res, result, 'API key baru berhasil digenerate. Perbarui API key di semua integrasi yang ada.');
});

// Cari user berdasarkan nama atau email. Hanya mengembalikan data publik.
// GET /api/users/search?q=keyword
export const searchUsers = asyncHandler(async (req, res) => {
  const users = await userService.searchUsers(req.query.q);
  sendSuccess(res, users, `Ditemukan ${users.length} user yang sesuai`);
});
