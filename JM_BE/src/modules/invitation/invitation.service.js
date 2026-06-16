import crypto      from 'crypto';
import Invitation  from '../../models/invitation.model.js';
import Project     from '../../models/project.model.js';
import User        from '../../models/user.model.js';
import { sendMail }                      from '../../config/mailer.js';
import { projectInvitationTemplate }     from '../../templates/projectInvitation.template.js';
import { memberJoinedTemplate }          from '../../templates/memberJoined.template.js';

const INVITE_EXPIRY_DAYS = 7;
// Slot tersedia = 9 (1 owner sudah menempati 1 dari 10 slot)
const MAX_MEMBER_SLOTS = 9;

// ─── Private Helpers ─────────────────────────────────────────────────────────

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

const formatDateTime = (date) =>
  date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// Hitung sisa slot tersedia: MAX_MEMBER_SLOTS - current members - pending invitations
const getAvailableSlots = async (project) => {
  const pendingCount = await Invitation.countDocuments({
    projectId: project._id,
    status:    'pending',
  });
  return MAX_MEMBER_SLOTS - project.members.length - pendingCount;
};

// ─── Exports ─────────────────────────────────────────────────────────────────

// Kirim undangan ke user — PM only.
// Slot dihitung dari: member aktif + pending invitation <= 9.
export const inviteMember = async (project, inviter, { userId, role }) => {
  const invitedUser = await User.findById(userId).select('name email').lean();
  if (!invitedUser) {
    const err = new Error('User tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  // Self-invite prevention
  if (inviter._id.toString() === userId) {
    const err = new Error('Anda tidak dapat mengundang diri sendiri ke project');
    err.statusCode = 409;
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

  // Kuota PM = 1: cek member aktif dan pending invitation
  if (role === 'PM') {
    const hasPmMember = project.members.some((m) => m.role === 'PM');
    if (hasPmMember) {
      const err = new Error('Project sudah memiliki Project Manager aktif. Ubah role PM tersebut terlebih dahulu sebelum mengundang PM baru.');
      err.statusCode = 409;
      throw err;
    }

    const hasPendingPmInvite = await Invitation.exists({
      projectId: project._id,
      role:      'PM',
      status:    'pending',
    });
    if (hasPendingPmInvite) {
      const err = new Error('Sudah ada undangan PM yang menunggu konfirmasi. Batalkan undangan tersebut untuk mengundang PM baru.');
      err.statusCode = 409;
      throw err;
    }
  }

  // Tolak jika sudah ada undangan pending untuk user ini di project ini
  const pendingExists = await Invitation.exists({
    projectId:     project._id,
    invitedUserId: userId,
    status:        'pending',
  });
  if (pendingExists) {
    const err = new Error('User ini sudah memiliki undangan yang belum ditanggapi untuk project ini');
    err.statusCode = 409;
    throw err;
  }

  // Cek kuota slot — member aktif + pending invitation tidak boleh melebihi 9
  const availableSlots = await getAvailableSlots(project);
  if (availableSlots <= 0) {
    const err = new Error(
      `Kuota undangan project sudah penuh. Semua ${MAX_MEMBER_SLOTS} slot anggota sudah terisi oleh member aktif atau undangan yang menunggu konfirmasi. Batalkan undangan yang pending untuk membuka slot baru.`
    );
    err.statusCode = 409;
    throw err;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const expiry   = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await Invitation.create({
    projectId:     project._id,
    invitedBy:     inviter._id,
    invitedUserId: userId,
    role,
    token:         hashToken(rawToken),
    expiry,
  });

  // Kirim email ke user yang diundang
  try {
    const acceptUrl  = `${process.env.CLIENT_URL}/invitations/${rawToken}`;
    const declineUrl = `${process.env.CLIENT_URL}/invitations/${rawToken}?action=decline`;

    const { subject, html, text } = projectInvitationTemplate({
      inviteeName: invitedUser.name,
      inviterName: inviter.name,
      projectName: project.name,
      role,
      acceptUrl,
      declineUrl,
      expiresAt:   formatDateTime(expiry) + ' WIB',
    });

    await sendMail({ to: invitedUser.email, subject, html, text });
  } catch (emailErr) {
    console.error('[invitation] Gagal kirim email undangan:', emailErr.message);
  }

  return {
    message:        `Undangan berhasil dikirim ke ${invitedUser.email}`,
    remainingSlots: availableSlots - 1,
  };
};

// Ambil daftar undangan pending untuk sebuah project — PM only.
export const listProjectInvitations = async (project) => {
  const [invitations, availableSlots] = await Promise.all([
    Invitation.find({ projectId: project._id, status: 'pending' })
      .populate('invitedUserId', 'name email avatar')
      .populate('invitedBy',     'name email')
      .select('invitedUserId invitedBy role expiry createdAt')
      .sort({ createdAt: -1 })
      .lean(),
    getAvailableSlots(project),
  ]);

  return { invitations, availableSlots };
};

// Kirim ulang email undangan — reset token dan perpanjang expiry 7 hari dari sekarang.
// PM only, hanya untuk undangan yang masih pending.
export const resendInvitation = async (project, invitationId, inviter) => {
  const invitation = await Invitation.findOne({
    _id:       invitationId,
    projectId: project._id,
    status:    'pending',
  }).populate('invitedUserId', 'name email');

  if (!invitation) {
    const err = new Error('Undangan tidak ditemukan atau sudah ditanggapi');
    err.statusCode = 404;
    throw err;
  }

  const rawToken  = crypto.randomBytes(32).toString('hex');
  const newExpiry = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  invitation.token  = hashToken(rawToken);
  invitation.expiry = newExpiry;
  await invitation.save();

  try {
    const acceptUrl  = `${process.env.CLIENT_URL}/invitations/${rawToken}`;
    const declineUrl = `${process.env.CLIENT_URL}/invitations/${rawToken}?action=decline`;

    const { subject, html, text } = projectInvitationTemplate({
      inviteeName: invitation.invitedUserId.name,
      inviterName: inviter.name,
      projectName: project.name,
      role:        invitation.role,
      acceptUrl,
      declineUrl,
      expiresAt:   formatDateTime(newExpiry) + ' WIB',
    });

    await sendMail({ to: invitation.invitedUserId.email, subject, html, text });
  } catch (emailErr) {
    console.error('[invitation] Gagal kirim ulang email undangan:', emailErr.message);
  }

  return { message: `Undangan berhasil dikirim ulang ke ${invitation.invitedUserId.email}` };
};

// Ambil detail undangan dari raw token — public, dipakai FE untuk tampilkan halaman undangan.
export const getInvitationByToken = async (rawToken) => {
  const hashed     = hashToken(rawToken);
  const invitation = await Invitation.findOne({ token: hashed })
    .populate('projectId',     'name slug')
    .populate('invitedBy',     'name email')
    .populate('invitedUserId', 'name email')
    .lean();

  if (!invitation) {
    const err = new Error('Undangan tidak ditemukan atau token tidak valid');
    err.statusCode = 404;
    throw err;
  }

  if (invitation.status !== 'pending') {
    const err = new Error(
      `Undangan ini sudah ${invitation.status === 'accepted' ? 'diterima' : 'ditolak'} sebelumnya`
    );
    err.statusCode = 409;
    throw err;
  }

  if (new Date() > new Date(invitation.expiry)) {
    const err = new Error('Undangan ini sudah kedaluwarsa');
    err.statusCode = 410;
    throw err;
  }

  return invitation;
};

// Terima undangan — auth required, harus user yang diundang.
// Setelah berhasil: notifikasi email dikirim ke PM.
export const acceptInvitation = async (rawToken, currentUser) => {
  const hashed     = hashToken(rawToken);
  const invitation = await Invitation.findOne({ token: hashed });

  if (!invitation) {
    const err = new Error('Undangan tidak ditemukan atau token tidak valid');
    err.statusCode = 404;
    throw err;
  }

  if (invitation.invitedUserId.toString() !== currentUser._id.toString()) {
    const err = new Error('Undangan ini bukan untuk akun Anda');
    err.statusCode = 403;
    throw err;
  }

  if (invitation.status !== 'pending') {
    const err = new Error(
      `Undangan ini sudah ${invitation.status === 'accepted' ? 'diterima' : 'ditolak'} sebelumnya`
    );
    err.statusCode = 409;
    throw err;
  }

  if (new Date() > new Date(invitation.expiry)) {
    const err = new Error('Undangan ini sudah kedaluwarsa');
    err.statusCode = 410;
    throw err;
  }

  const project = await Project.findById(invitation.projectId);
  if (!project) {
    const err = new Error('Project tidak lagi tersedia');
    err.statusCode = 404;
    throw err;
  }

  const alreadyMember = project.members.some(
    (m) => m.userId.toString() === currentUser._id.toString()
  );
  if (alreadyMember) {
    invitation.status = 'accepted';
    await invitation.save();
    const err = new Error('Anda sudah menjadi anggota project ini');
    err.statusCode = 409;
    throw err;
  }

  if (project.members.length >= MAX_MEMBER_SLOTS) {
    const err = new Error('Project telah mencapai batas maksimal anggota');
    err.statusCode = 409;
    throw err;
  }

  project.members.push({ userId: currentUser._id, role: invitation.role });
  invitation.status = 'accepted';

  await Promise.all([project.save(), invitation.save()]);

  // Notifikasi email ke PM bahwa member baru telah bergabung
  try {
    const pm = await User.findById(project.ownerId).select('name email').lean();
    if (pm && pm._id.toString() !== currentUser._id.toString()) {
      const joinedAt     = formatDateTime(new Date());
      const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/projects/${project._id}?tab=members`;

      const { subject, html, text } = memberJoinedTemplate({
        pmName:      pm.name,
        memberName:  currentUser.name,
        memberEmail: currentUser.email,
        role:        invitation.role,
        projectName: project.name,
        dashboardUrl,
        joinedAt,
      });

      await sendMail({ to: pm.email, subject, html, text });
    }
  } catch (notifyErr) {
    console.error('[invitation] Gagal kirim notifikasi ke PM:', notifyErr.message);
  }

  return {
    projectId:   project._id,
    projectName: project.name,
    slug:        project.slug,
    role:        invitation.role,
  };
};

// Tolak undangan — auth required, harus user yang diundang.
export const declineInvitation = async (rawToken, currentUser) => {
  const hashed     = hashToken(rawToken);
  const invitation = await Invitation.findOne({ token: hashed });

  if (!invitation) {
    const err = new Error('Undangan tidak ditemukan atau token tidak valid');
    err.statusCode = 404;
    throw err;
  }

  if (invitation.invitedUserId.toString() !== currentUser._id.toString()) {
    const err = new Error('Undangan ini bukan untuk akun Anda');
    err.statusCode = 403;
    throw err;
  }

  if (invitation.status !== 'pending') {
    const err = new Error(
      `Undangan ini sudah ${invitation.status === 'accepted' ? 'diterima' : 'ditolak'} sebelumnya`
    );
    err.statusCode = 409;
    throw err;
  }

  invitation.status = 'declined';
  await invitation.save();
};

// Batalkan undangan yang sudah dikirim — PM only, hanya yang pending.
export const cancelInvitation = async (project, invitationId) => {
  const invitation = await Invitation.findOne({
    _id:       invitationId,
    projectId: project._id,
    status:    'pending',
  });

  if (!invitation) {
    const err = new Error('Undangan tidak ditemukan atau sudah ditanggapi');
    err.statusCode = 404;
    throw err;
  }

  await Invitation.findByIdAndDelete(invitationId);
};

// Terima undangan by ID — dipanggil dari dashboard (tanpa raw token).
export const acceptInvitationById = async (invitationId, currentUser) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    const err = new Error('Undangan tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (invitation.invitedUserId.toString() !== currentUser._id.toString()) {
    const err = new Error('Undangan ini bukan untuk akun Anda');
    err.statusCode = 403;
    throw err;
  }

  if (invitation.status !== 'pending') {
    const err = new Error(
      `Undangan ini sudah ${invitation.status === 'accepted' ? 'diterima' : 'ditolak'} sebelumnya`
    );
    err.statusCode = 409;
    throw err;
  }

  if (new Date() > new Date(invitation.expiry)) {
    const err = new Error('Undangan ini sudah kedaluwarsa');
    err.statusCode = 410;
    throw err;
  }

  const project = await Project.findById(invitation.projectId);
  if (!project) {
    const err = new Error('Project tidak lagi tersedia');
    err.statusCode = 404;
    throw err;
  }

  const alreadyMember = project.members.some(
    (m) => m.userId.toString() === currentUser._id.toString()
  );
  if (alreadyMember) {
    invitation.status = 'accepted';
    await invitation.save();
    const err = new Error('Anda sudah menjadi anggota project ini');
    err.statusCode = 409;
    throw err;
  }

  if (project.members.length >= MAX_MEMBER_SLOTS) {
    const err = new Error('Project telah mencapai batas maksimal anggota');
    err.statusCode = 409;
    throw err;
  }

  project.members.push({ userId: currentUser._id, role: invitation.role });
  invitation.status = 'accepted';

  await Promise.all([project.save(), invitation.save()]);

  try {
    const pm = await User.findById(project.ownerId).select('name email').lean();
    if (pm && pm._id.toString() !== currentUser._id.toString()) {
      const joinedAt     = formatDateTime(new Date());
      const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/projects/${project._id}?tab=members`;
      const { subject, html, text } = memberJoinedTemplate({
        pmName:      pm.name,
        memberName:  currentUser.name,
        memberEmail: currentUser.email,
        role:        invitation.role,
        projectName: project.name,
        dashboardUrl,
        joinedAt,
      });
      await sendMail({ to: pm.email, subject, html, text });
    }
  } catch (notifyErr) {
    console.error('[invitation] Gagal kirim notifikasi ke PM:', notifyErr.message);
  }

  return {
    projectId:   project._id,
    projectName: project.name,
    slug:        project.slug,
    role:        invitation.role,
  };
};

// Tolak undangan by ID — dipanggil dari dashboard (tanpa raw token).
export const declineInvitationById = async (invitationId, currentUser) => {
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    const err = new Error('Undangan tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (invitation.invitedUserId.toString() !== currentUser._id.toString()) {
    const err = new Error('Undangan ini bukan untuk akun Anda');
    err.statusCode = 403;
    throw err;
  }

  if (invitation.status !== 'pending') {
    const err = new Error(
      `Undangan ini sudah ${invitation.status === 'accepted' ? 'diterima' : 'ditolak'} sebelumnya`
    );
    err.statusCode = 409;
    throw err;
  }

  invitation.status = 'declined';
  await invitation.save();
};

// Ambil semua undangan pending yang ditujukan ke user yang sedang login.
// Dipakai di GET /api/users/me/invitations.
export const getMyInvitations = async (userId) => {
  return Invitation.find({ invitedUserId: userId, status: 'pending' })
    .populate('projectId', 'name slug')
    .populate('invitedBy', 'name email avatar')
    .select('projectId invitedBy role expiry createdAt')
    .sort({ createdAt: -1 })
    .lean();
};
