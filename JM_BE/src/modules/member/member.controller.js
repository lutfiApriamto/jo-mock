import asyncHandler       from '../../utils/asyncHandler.js';
import { sendSuccess }    from '../../utils/apiResponse.js';
import * as memberService from './member.service.js';

export const listMembers = asyncHandler(async (req, res) => {
  const members = await memberService.listMembers(req.project);
  sendSuccess(res, members, 'Daftar anggota berhasil diambil');
});

export const addMember = asyncHandler(async (req, res) => {
  const members = await memberService.addMember(req.project, req.body);
  sendSuccess(res, members, 'Anggota berhasil ditambahkan', 201);
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const members = await memberService.updateMemberRole(req.project, req.params.userId, req.body);
  sendSuccess(res, members, 'Role anggota berhasil diperbarui');
});

export const removeMember = asyncHandler(async (req, res) => {
  await memberService.removeMember(req.project, req.params.userId);
  sendSuccess(res, null, 'Anggota berhasil dikeluarkan dari project');
});

