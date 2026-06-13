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

// Transfer kepemilikan project ke member yang ada.
// Hanya bisa dilakukan oleh owner (bukan sekedar PM role) — dicek dari ownerId.
// Alur:
//   1. Pastikan caller adalah owner sesungguhnya
//   2. Target harus member aktif project ini
//   3. Old owner ditambahkan ke members sebagai PM
//   4. New owner dihapus dari members, ownerId diperbarui
export const transferOwnership = async (project, currentUserId, { userId: newOwnerId }) => {
  if (project.ownerId.toString() !== currentUserId.toString()) {
    const err = new Error('Hanya owner project yang dapat melakukan transfer kepemilikan');
    err.statusCode = 403;
    throw err;
  }

  if (project.ownerId.toString() === newOwnerId) {
    const err = new Error('Anda sudah menjadi owner project ini');
    err.statusCode = 409;
    throw err;
  }

  const targetIndex = project.members.findIndex((m) => m.userId.toString() === newOwnerId);
  if (targetIndex === -1) {
    const err = new Error('Target user bukan anggota project ini. Hanya member aktif yang dapat menjadi owner baru.');
    err.statusCode = 404;
    throw err;
  }

  // Hapus target dari members, jadikan owner
  project.members.splice(targetIndex, 1);

  // Tambahkan old owner ke members sebagai PM
  project.members.push({ userId: currentUserId, role: 'PM' });

  project.ownerId = newOwnerId;
  await project.save();

  await project.populate('ownerId', 'name email avatar');
  await project.populate('members.userId', 'name email avatar');
  return formatMembers(project);
};
