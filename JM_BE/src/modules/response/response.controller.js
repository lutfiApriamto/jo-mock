import asyncHandler        from '../../utils/asyncHandler.js';
import { sendSuccess }     from '../../utils/apiResponse.js';
import * as responseService from './response.service.js';

// Ambil semua response milik endpoint, diurutkan statusCode + createdAt asc.
export const listResponses = asyncHandler(async (req, res) => {
  const responses = await responseService.listResponses(req.project, req.params.endpointId);
  sendSuccess(res, responses, 'Daftar response berhasil diambil');
});

// Buat response baru. Jika 2xx dan endpoint belum punya default → otomatis jadi default.
export const createResponse = asyncHandler(async (req, res) => {
  const response = await responseService.createResponse(
    req.project,
    req.params.endpointId,
    req.body,
  );
  sendSuccess(res, response, 'Response berhasil dibuat', 201);
});

// Update statusCode dan/atau body. Tidak trigger ContractVersion.
export const updateResponse = asyncHandler(async (req, res) => {
  const response = await responseService.updateResponse(
    req.project,
    req.params.endpointId,
    req.params.responseId,
    req.body,
  );
  sendSuccess(res, response, 'Response berhasil diperbarui');
});

// Set response ini sebagai default endpoint (hanya 2xx).
// Toggle user yang belum customized akan ikut diperbarui ke default baru.
export const setDefaultResponse = asyncHandler(async (req, res) => {
  const response = await responseService.setDefaultResponse(
    req.project,
    req.params.endpointId,
    req.params.responseId,
  );
  sendSuccess(res, response, 'Response berhasil dijadikan default endpoint');
});

// Hapus response. Tidak bisa hapus response default — ganti default dulu.
// Cascade: hapus Toggle yang menunjuk ke response ini.
export const deleteResponse = asyncHandler(async (req, res) => {
  await responseService.deleteResponse(
    req.project,
    req.params.endpointId,
    req.params.responseId,
  );
  sendSuccess(res, null, 'Response berhasil dihapus');
});
