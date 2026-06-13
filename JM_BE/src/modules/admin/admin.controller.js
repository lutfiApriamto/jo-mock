import asyncHandler      from '../../utils/asyncHandler.js';
import { sendSuccess }   from '../../utils/apiResponse.js';
import * as adminService from './admin.service.js';

// ─── User Management ─────────────────────────────────────────────────────────

// PATCH /api/admin/users/:userId/role — ubah role platform (user ↔ superadmin)
export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserRole(req.params.userId, req.body, req.user._id);
  const roleLabel = user.role === 'superadmin' ? 'Superadmin' : 'User biasa';
  sendSuccess(res, user, `Role ${user.name} berhasil diubah menjadi ${roleLabel}`);
});

// GET /api/admin/users?q=keyword&page=1&limit=20
export const listUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await adminService.listUsers(req.query);
  sendSuccess(res, users, 'Daftar user berhasil diambil', 200, meta);
});

// GET /api/admin/users/:userId
export const getUserDetail = asyncHandler(async (req, res) => {
  const user = await adminService.getUserDetail(req.params.userId);
  sendSuccess(res, user, 'Detail user berhasil diambil');
});

// PATCH /api/admin/users/:userId/quota — update batas quota
export const updateQuotaLimit = asyncHandler(async (req, res) => {
  const user = await adminService.updateQuotaLimit(req.params.userId, req.body);
  sendSuccess(res, user, 'Batas quota user berhasil diperbarui');
});

// POST /api/admin/users/:userId/quota/reset — reset quota.used ke 0
export const resetQuota = asyncHandler(async (req, res) => {
  const user = await adminService.resetQuota(req.params.userId);
  sendSuccess(res, user, 'Quota penggunaan user berhasil direset ke 0');
});

// DELETE /api/admin/users/:userId — hapus user, transfer project ke superadmin
export const deleteUser = asyncHandler(async (req, res) => {
  const result = await adminService.deleteUser(req.params.userId, req.user._id);
  sendSuccess(res, result, `User "${result.deletedUser}" berhasil dihapus. Project yang dimilikinya telah ditransfer ke superadmin.`);
});

// ─── Project Management ──────────────────────────────────────────────────────

// GET /api/admin/projects?q=keyword&page=1&limit=20
export const listAllProjects = asyncHandler(async (req, res) => {
  const { projects, meta } = await adminService.listAllProjects(req.query);
  sendSuccess(res, projects, 'Daftar semua project berhasil diambil', 200, meta);
});

// DELETE /api/admin/projects/:projectId — paksa hapus project beserta isinya
export const forceDeleteProject = asyncHandler(async (req, res) => {
  const result = await adminService.forceDeleteProject(req.params.projectId);
  sendSuccess(res, result, `Project "${result.deletedProject}" berhasil dihapus beserta seluruh isinya.`);
});

// ─── Platform Stats ───────────────────────────────────────────────────────────

// GET /api/admin/stats
export const getPlatformStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getPlatformStats();
  sendSuccess(res, stats, 'Statistik platform berhasil diambil');
});
