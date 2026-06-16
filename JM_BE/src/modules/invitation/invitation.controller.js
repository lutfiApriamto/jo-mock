import asyncHandler          from '../../utils/asyncHandler.js';
import { sendSuccess }       from '../../utils/apiResponse.js';
import * as inviteService    from './invitation.service.js';

// Kirim undangan ke member baru — PM only.
// POST /api/projects/:projectId/members/invite
export const inviteMember = asyncHandler(async (req, res) => {
  const result = await inviteService.inviteMember(req.project, req.user, req.body);
  sendSuccess(res, result, result.message, 201);
});

// List undangan pending untuk sebuah project + sisa slot tersedia — PM only.
// GET /api/projects/:projectId/members/invitations
export const listProjectInvitations = asyncHandler(async (req, res) => {
  const { invitations, availableSlots } = await inviteService.listProjectInvitations(req.project);
  sendSuccess(res, { invitations, availableSlots }, 'Daftar undangan berhasil diambil');
});

// Kirim ulang email undangan — reset token dan perpanjang expiry — PM only.
// POST /api/projects/:projectId/members/invitations/:invitationId/resend
export const resendInvitation = asyncHandler(async (req, res) => {
  const result = await inviteService.resendInvitation(req.project, req.params.invitationId, req.user);
  sendSuccess(res, result, result.message);
});

// Batalkan undangan yang sudah dikirim — PM only.
// DELETE /api/projects/:projectId/members/invitations/:invitationId
export const cancelInvitation = asyncHandler(async (req, res) => {
  await inviteService.cancelInvitation(req.project, req.params.invitationId);
  sendSuccess(res, null, 'Undangan berhasil dibatalkan. Slot anggota kini tersedia kembali.');
});

// Ambil detail undangan dari raw token — public.
// GET /api/invitations/:token
export const getInvitationByToken = asyncHandler(async (req, res) => {
  const invitation = await inviteService.getInvitationByToken(req.params.token);
  sendSuccess(res, invitation, 'Detail undangan berhasil diambil');
});

// Terima undangan — auth required.
// POST /api/invitations/:token/accept
export const acceptInvitation = asyncHandler(async (req, res) => {
  const result = await inviteService.acceptInvitation(req.params.token, req.user);
  sendSuccess(res, result, `Selamat! Anda resmi bergabung ke project "${result.projectName}" sebagai ${result.role}`);
});

// Tolak undangan — auth required.
// POST /api/invitations/:token/decline
export const declineInvitation = asyncHandler(async (req, res) => {
  await inviteService.declineInvitation(req.params.token, req.user);
  sendSuccess(res, null, 'Undangan berhasil ditolak');
});

// Terima undangan by ID — auth required, dipanggil dari dashboard.
// POST /api/users/me/invitations/:invitationId/accept
export const acceptInvitationById = asyncHandler(async (req, res) => {
  const result = await inviteService.acceptInvitationById(req.params.invitationId, req.user);
  sendSuccess(res, result, `Selamat! Anda resmi bergabung ke project "${result.projectName}" sebagai ${result.role}`);
});

// Tolak undangan by ID — auth required, dipanggil dari dashboard.
// POST /api/users/me/invitations/:invitationId/decline
export const declineInvitationById = asyncHandler(async (req, res) => {
  await inviteService.declineInvitationById(req.params.invitationId, req.user);
  sendSuccess(res, null, 'Undangan berhasil ditolak');
});

// Ambil semua undangan pending milik user yang sedang login.
// GET /api/users/me/invitations
export const getMyInvitations = asyncHandler(async (req, res) => {
  const invitations = await inviteService.getMyInvitations(req.user._id);
  sendSuccess(res, invitations, `Anda memiliki ${invitations.length} undangan yang menunggu konfirmasi`);
});
