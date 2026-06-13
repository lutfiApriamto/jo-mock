import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as cvService from './contractVersion.service.js';

// GET /api/projects/:projectId/contract-versions?changeType=&page=&limit=
export const listContractVersions = asyncHandler(async (req, res) => {
  const { versions, meta } = await cvService.listContractVersions(req.project, req.query);
  sendSuccess(res, versions, 'Riwayat perubahan kontrak berhasil diambil', 200, meta);
});

// GET /api/projects/:projectId/contract-versions/:version
export const getContractVersionDetail = asyncHandler(async (req, res) => {
  const cv = await cvService.getContractVersionDetail(req.project, req.params.version);
  sendSuccess(res, cv, `Detail perubahan kontrak v${cv.version} berhasil diambil`);
});
