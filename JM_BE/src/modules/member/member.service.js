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

  // Jika mempromote ke PM, auto-demote PM yang sudah ada menjadi FE (kuota PM = 1)
  if (role === 'PM' && member.role !== 'PM') {
    const existingPm = project.members.find(
      (m) => m.role === 'PM' && m.userId.toString() !== targetUserId,
    );
    if (existingPm) {
      existingPm.role = 'FE';
    }
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

// Transfer kepemilikan project ke member yang ada — owner lama TETAP di project.
// Hanya bisa dilakukan oleh owner (bukan sekedar PM role) — dicek dari ownerId.
// Kuota PM = 1: owner baru otomatis jadi PM (lewat ownerId), owner lama turun jadi FE.
// Alur:
//   1. Pastikan caller adalah owner sesungguhnya
//   2. Target harus member aktif project ini
//   3. New owner dihapus dari members, ownerId diperbarui
//   4. Old owner ditambahkan ke members sebagai FE (bukan PM — kuota PM hanya 1)
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

  // Tambahkan old owner ke members sebagai FE (kuota PM = 1, jadi tidak boleh PM)
  project.members.push({ userId: currentUserId, role: 'FE' });

  project.ownerId = newOwnerId;
  await project.save();

  await project.populate('ownerId', 'name email avatar');
  await project.populate('members.userId', 'name email avatar');
  return formatMembers(project);
};

// Keluar dari project.
//   - Member biasa (FE/BE): cukup hapus dirinya dari members.
//   - Owner: WAJIB menunjuk owner baru (newOwnerId) yang merupakan member aktif.
//     Kepemilikan dipindah ke member tersebut, lalu owner lama keluar total
//     (tidak ditambahkan kembali sebagai member — beda dengan transferOwnership).
export const leaveProject = async (project, currentUserId, { newOwnerId } = {}) => {
  const isOwner = project.ownerId.toString() === currentUserId.toString();

  if (isOwner) {
    if (!newOwnerId) {
      const err = new Error('Sebagai owner, Anda harus menunjuk owner baru sebelum keluar dari project');
      err.statusCode = 400;
      throw err;
    }

    if (newOwnerId === currentUserId.toString()) {
      const err = new Error('Tidak bisa transfer kepemilikan ke diri sendiri');
      err.statusCode = 409;
      throw err;
    }

    const targetIndex = project.members.findIndex((m) => m.userId.toString() === newOwnerId);
    if (targetIndex === -1) {
      const err = new Error('Calon owner baru harus anggota aktif project ini');
      err.statusCode = 404;
      throw err;
    }

    // Promote target jadi owner, hapus dari members. Owner lama TIDAK ditambahkan kembali.
    project.members.splice(targetIndex, 1);
    project.ownerId = newOwnerId;
    await project.save();
    return;
  }

  // Member biasa keluar — hapus dirinya dari members
  const memberIndex = project.members.findIndex((m) => m.userId.toString() === currentUserId.toString());
  if (memberIndex === -1) {
    const err = new Error('Anda bukan anggota project ini');
    err.statusCode = 404;
    throw err;
  }

  project.members.splice(memberIndex, 1);
  await project.save();
};
