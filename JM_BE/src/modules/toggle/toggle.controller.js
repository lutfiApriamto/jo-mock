import asyncHandler      from '../../utils/asyncHandler.js';
import { sendSuccess }   from '../../utils/apiResponse.js';
import * as toggleService from './toggle.service.js';

// Ambil semua toggle milik user ini dalam project.
// Hanya mengembalikan endpoint yang sudah di-customize — bukan semua endpoint.
export const listMyToggles = asyncHandler(async (req, res) => {
  const toggles = await toggleService.listMyToggles(req.project, req.user._id);
  sendSuccess(res, toggles, 'Daftar toggle berhasil diambil');
});

// Ambil status toggle user untuk satu endpoint.
// Jika belum ada toggle → activeResponseId berisi default endpoint, isCustomized: false.
export const getMyToggle = asyncHandler(async (req, res) => {
  const toggle = await toggleService.getMyToggle(
    req.project,
    req.params.endpointId,
    req.user._id,
  );
  sendSuccess(res, toggle, 'Toggle berhasil diambil');
});

// Pilih response aktif untuk endpoint ini (buat atau update toggle).
// Body: { responseId }. Response boleh 2xx maupun non-2xx.
export const upsertToggle = asyncHandler(async (req, res) => {
  const toggle = await toggleService.upsertToggle(
    req.project,
    req.params.endpointId,
    req.user._id,
    req.body.responseId,
  );
  sendSuccess(res, toggle, 'Toggle berhasil diperbarui');
});

// Reset toggle — hapus pilihan custom, kembali ke default endpoint.
// Idempotent: sukses meskipun toggle belum pernah dibuat.
export const resetToggle = asyncHandler(async (req, res) => {
  await toggleService.resetToggle(
    req.project,
    req.params.endpointId,
    req.user._id,
  );
  sendSuccess(res, null, 'Toggle berhasil direset ke default endpoint');
});
