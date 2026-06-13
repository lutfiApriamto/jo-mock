import User from '../../models/user.model.js';

// Format list: owner selalu muncul pertama sebagai PM, lalu anggota lainnya
const formatMembers = (project) => {
  const owner = {
    user:     project.ownerId,
    role:     'PM',
    isOwner:  true,
    joinedAt: project.createdAt,
  };

  const members = project.members.map((m) => ({
    user:     m.userId,
    role:     m.role,
    isOwner:  false,
    joinedAt: m.joinedAt,
  }));

  return [owner, ...members];
};

export const listMembers = async (project) => {
  await project.populate('ownerId', 'name email avatar');
  await project.populate('members.userId', 'name email avatar');
  return formatMembers(project);
};

export const addMember = async (project, { userId, role }) => {
  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    const err = new Error('User tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (project.ownerId.toString() === userId) {
    const err = new Error('Owner project sudah otomatis memiliki akses sebagai PM');
    err.statusCode = 409;
    throw err;
  }

  const alreadyMember = project.members.some((m) => m.userId.toString() === userId);
  if (alreadyMember) {
    const err = new Error('User sudah menjadi anggota project ini');
    err.statusCode = 409;
    throw err;
  }

  project.members.push({ userId, role });
  await project.save();

  await project.populate('ownerId', 'name email avatar');
  await project.populate('members.userId', 'name email avatar');
  return formatMembers(project);
};

export const updateMemberRole = async (project, targetUserId, { role }) => {
  if (project.ownerId.toString() === targetUserId) {
    const err = new Error('Role owner tidak bisa diubah');
    err.statusCode = 403;
    throw err;
  }

  const member = project.members.find((m) => m.userId.toString() === targetUserId);
  if (!member) {
    const err = new Error('User bukan anggota project ini');
    err.statusCode = 404;
    throw err;
  }

  member.role = role;
  await project.save();

  await project.populate('ownerId', 'name email avatar');
  await project.populate('members.userId', 'name email avatar');
  return formatMembers(project);
};

export const removeMember = async (project, targetUserId) => {
  if (project.ownerId.toString() === targetUserId) {
    const err = new Error('Owner project tidak bisa dikeluarkan dari project');
    err.statusCode = 403;
    throw err;
  }

  const memberIndex = project.members.findIndex((m) => m.userId.toString() === targetUserId);
  if (memberIndex === -1) {
    const err = new Error('User bukan anggota project ini');
    err.statusCode = 404;
    throw err;
  }

  project.members.splice(memberIndex, 1);
  await project.save();
};

