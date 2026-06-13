import User          from '../../models/user.model.js';
import Project        from '../../models/project.model.js';
import Folder         from '../../models/folder.model.js';
import Endpoint       from '../../models/endpoint.model.js';
import Response       from '../../models/response.model.js';
import Toggle         from '../../models/toggle.model.js';
import ChangeRequest  from '../../models/changeRequest.model.js';
import ContractVersion from '../../models/contractVersion.model.js';
import Invitation     from '../../models/invitation.model.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';

// ─── User Management ─────────────────────────────────────────────────────────

// Ubah role platform seorang user (user ↔ superadmin).
// Superadmin tidak bisa menurunkan role dirinya sendiri.
export const updateUserRole = async (userId, { role }, superadminId) => {
  if (userId.toString() === superadminId.toString()) {
    const err = new Error('Superadmin tidak dapat mengubah role akunnya sendiri');
    err.statusCode = 403;
    throw err;
  }

  const validRoles = ['user', 'superadmin'];
  if (!validRoles.includes(role)) {
    const err = new Error(`Role tidak valid. Gunakan salah satu: ${validRoles.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  ).select('name email role');

  if (!user) {
    const err = new Error('User tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

// List semua user platform dengan pagination + optional search by name/email.
export const listUsers = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = {};
  if (query.q) {
    const regex = new RegExp(query.q.trim(), 'i');
    filter.$or  = [{ name: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email role avatar quota createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { users, meta: buildPaginationMeta(total, page, limit) };
};

// Detail satu user — termasuk quota dan apiKey.
export const getUserDetail = async (userId) => {
  const user = await User.findById(userId)
    .select('name email role avatar apiKey quota createdAt updatedAt')
    .lean();

  if (!user) {
    const err = new Error('User tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

// Update batas quota seorang user.
export const updateQuotaLimit = async (userId, { limit }) => {
  if (typeof limit !== 'number' || limit < 0) {
    const err = new Error('Nilai limit quota harus berupa angka positif');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { 'quota.limit': limit },
    { new: true, runValidators: true }
  ).select('name email quota');

  if (!user) {
    const err = new Error('User tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

// Reset penggunaan quota seorang user (quota.used → 0).
export const resetQuota = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { 'quota.used': 0 },
    { new: true }
  ).select('name email quota');

  if (!user) {
    const err = new Error('User tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

// Hapus user — semua project yang dimilikinya ditransfer ke superadmin.
// Alur:
//   1. Cari superadmin (bukan user yang dihapus)
//   2. Transfer semua project owned by userId → ownerId = superadmin._id
//   3. Keluarkan userId dari semua members array di project mana pun
//   4. Hapus invitation milik/untuk user ini
//   5. Hapus user
export const deleteUser = async (userId, superadminId) => {
  if (userId.toString() === superadminId.toString()) {
    const err = new Error('Tidak dapat menghapus akun superadmin yang sedang aktif');
    err.statusCode = 403;
    throw err;
  }

  const user = await User.findById(userId).select('_id name').lean();
  if (!user) {
    const err = new Error('User tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  await Promise.all([
    // Transfer project ownership ke superadmin
    Project.updateMany({ ownerId: userId }, { ownerId: superadminId }),

    // Keluarkan dari semua members array
    Project.updateMany(
      { 'members.userId': userId },
      { $pull: { members: { userId } } }
    ),

    // Hapus undangan milik atau untuk user ini
    Invitation.deleteMany({ $or: [{ invitedBy: userId }, { invitedUserId: userId }] }),
  ]);

  await User.findByIdAndDelete(userId);

  return { deletedUser: user.name };
};

// ─── Project Management ──────────────────────────────────────────────────────

// List semua project di seluruh platform dengan pagination + optional search.
export const listAllProjects = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = {};
  if (query.q) {
    filter.name = new RegExp(query.q.trim(), 'i');
  }

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .select('name slug contractVersion ownerId members createdAt')
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(filter),
  ]);

  return { projects, meta: buildPaginationMeta(total, page, limit) };
};

// Hapus project beserta seluruh isinya (cascade) — tanpa cek kepemilikan.
export const forceDeleteProject = async (projectId) => {
  const project = await Project.findById(projectId).select('_id name').lean();

  if (!project) {
    const err = new Error('Project tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const endpoints   = await Endpoint.find({ projectId }).select('_id').lean();
  const endpointIds = endpoints.map((e) => e._id);

  await Promise.all([
    Folder.deleteMany({ projectId }),
    Endpoint.deleteMany({ projectId }),
    Response.deleteMany({ endpointId: { $in: endpointIds } }),
    Toggle.deleteMany({ endpointId: { $in: endpointIds } }),
    ChangeRequest.deleteMany({ projectId }),
    ContractVersion.deleteMany({ projectId }),
    Invitation.deleteMany({ projectId }),
  ]);

  await Project.findByIdAndDelete(projectId);

  return { deletedProject: project.name };
};

// ─── Platform Stats ───────────────────────────────────────────────────────────

// Statistik ringkas platform: total user, project, API call, dan top 5 user by usage.
export const getPlatformStats = async () => {
  const [
    totalUsers,
    totalProjects,
    totalEndpoints,
    quotaAgg,
    topUsers,
  ] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Endpoint.countDocuments(),

    // Total API call = sum semua quota.used
    User.aggregate([{ $group: { _id: null, total: { $sum: '$quota.used' } } }]),

    // Top 5 user berdasarkan quota.used tertinggi
    User.find()
      .select('name email quota.used quota.limit avatar')
      .sort({ 'quota.used': -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    totalUsers,
    totalProjects,
    totalEndpoints,
    totalApiCalls: quotaAgg[0]?.total ?? 0,
    topUsersByUsage: topUsers,
  };
};
