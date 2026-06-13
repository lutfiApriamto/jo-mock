import ContractVersion from '../../models/contractVersion.model.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';

// Ambil riwayat semua perubahan kontrak dalam sebuah project, dari terbaru ke terlama.
// Filter opsional: ?changeType=cr_approved|pm_direct_edit
export const listContractVersions = async (project, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = { projectId: project._id };

  if (query.changeType) {
    const validTypes = ['cr_approved', 'pm_direct_edit'];
    if (!validTypes.includes(query.changeType)) {
      const err = new Error(`changeType tidak valid. Gunakan salah satu: ${validTypes.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }
    filter.changeType = query.changeType;
  }

  const [versions, total] = await Promise.all([
    ContractVersion.find(filter)
      .populate('changedBy',       'name email avatar')
      .populate('changeRequestId', 'description status')
      .sort({ version: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ContractVersion.countDocuments(filter),
  ]);

  return { versions, meta: buildPaginationMeta(total, page, limit) };
};

// Ambil detail satu versi kontrak berdasarkan nomor versi.
export const getContractVersionDetail = async (project, version) => {
  const versionNum = parseInt(version, 10);
  if (isNaN(versionNum) || versionNum < 1) {
    const err = new Error('Nomor versi tidak valid');
    err.statusCode = 400;
    throw err;
  }

  const cv = await ContractVersion.findOne({ projectId: project._id, version: versionNum })
    .populate('changedBy',       'name email avatar')
    .populate('changeRequestId', 'description status proposedChanges')
    .lean();

  if (!cv) {
    const err = new Error(`Versi v${versionNum} tidak ditemukan dalam project ini`);
    err.statusCode = 404;
    throw err;
  }

  return cv;
};
