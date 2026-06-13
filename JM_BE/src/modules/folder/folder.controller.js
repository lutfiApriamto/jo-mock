import asyncHandler       from '../../utils/asyncHandler.js';
import { sendSuccess }    from '../../utils/apiResponse.js';
import * as folderService from './folder.service.js';

// Ambil semua folder dalam project sebagai flat list.
// FE yang bertanggung jawab menyusun menjadi struktur tree menggunakan parentId.
export const listFolders = asyncHandler(async (req, res) => {
  const folders = await folderService.listFolders(req.project);
  sendSuccess(res, folders, 'Daftar folder berhasil diambil');
});

// Buat folder baru. parentId opsional — null berarti folder root.
export const createFolder = asyncHandler(async (req, res) => {
  const folder = await folderService.createFolder(req.project, req.body);
  sendSuccess(res, folder, 'Folder berhasil dibuat', 201);
});

// Ganti nama folder. Hanya field name yang bisa diubah via endpoint ini.
export const renameFolder = asyncHandler(async (req, res) => {
  const folder = await folderService.renameFolder(req.project, req.params.folderId, req.body);
  sendSuccess(res, folder, 'Nama folder berhasil diperbarui');
});

// Hapus folder beserta seluruh isinya (cascade delete).
// Cascade mencakup: subfolder rekursif → endpoint → response → toggle.
export const deleteFolder = asyncHandler(async (req, res) => {
  await folderService.deleteFolder(req.project, req.params.folderId);
  sendSuccess(res, null, 'Folder beserta seluruh isinya berhasil dihapus');
});

// Cari folder berdasarkan nama.
// GET /api/projects/:projectId/folders/search?q=keyword
export const searchFolders = asyncHandler(async (req, res) => {
  const folders = await folderService.searchFolders(req.project, req.query.q);
  sendSuccess(res, folders, `Ditemukan ${folders.length} folder yang sesuai`);
});
