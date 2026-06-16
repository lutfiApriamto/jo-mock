import asyncHandler       from '../../utils/asyncHandler.js';
import { sendSuccess }    from '../../utils/apiResponse.js';
import * as memberService from './member.service.js';

export const listMembers = asyncHandler(async (req, res) => {
  const members = await memberService.listMembers(req.project);
  sendSuccess(res, members, 'Daftar anggota berhasil diambil');
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const members = await memberService.updateMemberRole(req.project, req.params.userId, req.body);
  sendSuccess(res, members, 'Role anggota berhasil diperbarui');
});

export const removeMember = asyncHandler(async (req, res) => {
  await memberService.removeMember(req.project, req.params.userId);
  sendSuccess(res, null, 'Anggota berhasil dikeluarkan dari project');
});

export const transferOwnership = asyncHandler(async (req, res) => {
  const members = await memberService.transferOwnership(req.project, req.user._id, req.body);
  sendSuccess(res, members, 'Kepemilikan project berhasil ditransfer');
});

// Keluar dari project. Owner wajib mengirim newOwnerId (transfer dulu), member biasa cukup tanpa body.
export const leaveProject = asyncHandler(async (req, res) => {
  await memberService.leaveProject(req.project, req.user._id, req.body);
  sendSuccess(res, null, 'Anda berhasil keluar dari project');
});
