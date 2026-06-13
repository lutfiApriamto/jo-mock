// Controller changeRequest — terima request, panggil service, kirim response.
// Semua error dari service ditangkap asyncHandler → next(err) → errorHandler.js.

import asyncHandler        from '../../utils/asyncHandler.js';
import { sendSuccess }     from '../../utils/apiResponse.js';
import * as crService      from './changeRequest.service.js';

// Submit CR baru. Hanya FE dan BE yang diizinkan (dikontrol di routes via permission).
// req.user (full doc) dan req.projectRole diteruskan agar service bisa personalisasi email ke PM.
export const submitCR = asyncHandler(async (req, res) => {
  const cr = await crService.submitCR(req.project, req.user, req.projectRole, req.body);
  sendSuccess(res, cr, 'Change Request berhasil diajukan', 201);
});

// Daftar semua CR dalam project. Filter opsional via query: ?status=pending&submittedBy=<id>
export const listCRs = asyncHandler(async (req, res) => {
  const crs = await crService.listCRs(req.project, req.query);
  sendSuccess(res, crs, 'Daftar Change Request berhasil diambil');
});

// Detail satu CR — termasuk data submitter dan reviewer.
export const getCRDetail = asyncHandler(async (req, res) => {
  const cr = await crService.getCRDetail(req.project, req.params.crId);
  sendSuccess(res, cr, 'Detail Change Request berhasil diambil');
});

// Setujui CR. PM only.
// Efek: status approved + ContractVersion baru + project.contractVersion++ + email ke semua member.
// PM tetap harus menerapkan perubahan secara manual.
export const approveCR = asyncHandler(async (req, res) => {
  const cr = await crService.approveCR(req.project, req.params.crId, req.user);
  sendSuccess(res, cr, 'Change Request berhasil disetujui. Terapkan perubahan secara manual melalui menu endpoint/response.');
});

// Tolak CR. PM only. Body opsional: { reason }.
// Notifikasi email dikirim ke submitter saja.
export const rejectCR = asyncHandler(async (req, res) => {
  const cr = await crService.rejectCR(req.project, req.params.crId, req.user, req.body);
  sendSuccess(res, cr, 'Change Request berhasil ditolak');
});

// Batalkan CR. Hanya submitter, hanya jika masih pending.
// Service memvalidasi kepemilikan — route hanya perlu memastikan user adalah FE/BE.
export const cancelCR = asyncHandler(async (req, res) => {
  await crService.cancelCR(req.project, req.params.crId, req.user._id);
  sendSuccess(res, null, 'Change Request berhasil dibatalkan');
});
