import asyncHandler         from '../../utils/asyncHandler.js';
import { sendSuccess }      from '../../utils/apiResponse.js';
import * as endpointService from './endpoint.service.js';

// Ambil semua endpoint dalam project. Mendukung filter via ?folderId query param.
export const listEndpoints = asyncHandler(async (req, res) => {
  const endpoints = await endpointService.listEndpoints(req.project, req.query);
  sendSuccess(res, endpoints, 'Daftar endpoint berhasil diambil');
});

// Ambil detail satu endpoint termasuk requestSchema lengkap.
export const getEndpointDetail = asyncHandler(async (req, res) => {
  const endpoint = await endpointService.getEndpointDetail(req.project, req.params.endpointId);
  sendSuccess(res, endpoint, 'Detail endpoint berhasil diambil');
});

// Buat endpoint baru. PM only.
export const createEndpoint = asyncHandler(async (req, res) => {
  const endpoint = await endpointService.createEndpoint(req.project, req.body);
  sendSuccess(res, endpoint, 'Endpoint berhasil dibuat', 201);
});

// Update endpoint. Jika contract field berubah (method/path/requestSchema):
// service akan otomatis membuat ContractVersion dan mengirim notifikasi ke semua member.
// req.user dikirim ke service sebagai editor untuk dicatat di ContractVersion.
export const updateEndpoint = asyncHandler(async (req, res) => {
  const endpoint = await endpointService.updateEndpoint(
    req.project,
    req.params.endpointId,
    req.body,
    req.user,
  );
  sendSuccess(res, endpoint, 'Endpoint berhasil diperbarui');
});

// Hapus endpoint beserta semua Response dan Toggle yang menyertainya (cascade).
export const deleteEndpoint = asyncHandler(async (req, res) => {
  await endpointService.deleteEndpoint(req.project, req.params.endpointId);
  sendSuccess(res, null, 'Endpoint beserta seluruh data terkait berhasil dihapus');
});

// Cari endpoint berdasarkan path atau method.
// GET /api/projects/:projectId/endpoints/search?q=keyword
export const searchEndpoints = asyncHandler(async (req, res) => {
  const endpoints = await endpointService.searchEndpoints(req.project, req.query.q);
  sendSuccess(res, endpoints, `Ditemukan ${endpoints.length} endpoint yang sesuai`);
});
