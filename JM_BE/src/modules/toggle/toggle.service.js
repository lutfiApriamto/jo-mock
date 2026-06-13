import Toggle        from '../../models/toggle.model.js';
import Endpoint      from '../../models/endpoint.model.js';
import ResponseModel from '../../models/response.model.js';

// ─── Private Helpers ─────────────────────────────────────────────────────────

// Pastikan endpoint ada dan milik project ini sebelum operasi toggle.
// Dipakai di semua service function untuk mencegah akses lintas project.
const findEndpoint = async (endpointId, project) => {
  const endpoint = await Endpoint.findOne({ _id: endpointId, projectId: project._id });
  if (!endpoint) {
    const err = new Error('Endpoint tidak ditemukan dalam project ini');
    err.statusCode = 404;
    throw err;
  }
  return endpoint;
};

// ─── Exports ─────────────────────────────────────────────────────────────────

// Ambil semua toggle milik user ini di seluruh endpoint dalam project.
// Hanya mengembalikan endpoint yang sudah di-customize oleh user.
// Endpoint yang belum punya toggle → FE tahu untuk pakai endpoint.defaultResponseId.
export const listMyToggles = async (project, userId) => {
  const endpoints = await Endpoint.find({ projectId: project._id }).select('_id').lean();
  const endpointIds = endpoints.map((e) => e._id);

  return Toggle.find({ userId, endpointId: { $in: endpointIds } })
    .populate('endpointId', 'method path folderId defaultResponseId')
    .populate('activeResponseId', 'statusCode body isDefault')
    .sort({ updatedAt: -1 })
    .lean();
};

// Ambil toggle user untuk satu endpoint.
// Jika belum di-customize → fallback ke defaultResponseId milik endpoint.
// Response selalu menyertakan isCustomized agar FE tahu apakah ini pilihan user atau bawaan.
export const getMyToggle = async (project, endpointId, userId) => {
  const endpoint = await findEndpoint(endpointId, project);
  const toggle   = await Toggle.findOne({ userId, endpointId }).lean();

  if (toggle) {
    return {
      endpointId:       endpoint._id,
      activeResponseId: toggle.activeResponseId,
      isCustomized:     true,
      updatedAt:        toggle.updatedAt,
    };
  }

  // Tidak ada toggle — kembalikan default endpoint sebagai sinyal ke FE
  return {
    endpointId:       endpoint._id,
    activeResponseId: endpoint.defaultResponseId,
    isCustomized:     false,
    updatedAt:        null,
  };
};

// Pilih (atau ganti) response aktif untuk endpoint ini.
// Upsert: buat toggle baru jika belum ada, update jika sudah ada.
// Tidak membatasi statusCode — developer boleh mengaktifkan response error (4xx, 5xx) untuk kebutuhan testing.
export const upsertToggle = async (project, endpointId, userId, responseId) => {
  const endpoint = await findEndpoint(endpointId, project);

  // Pastikan response yang dipilih benar-benar milik endpoint ini
  const response = await ResponseModel.findOne({ _id: responseId, endpointId: endpoint._id });
  if (!response) {
    const err = new Error('Response tidak ditemukan dalam endpoint ini');
    err.statusCode = 404;
    throw err;
  }

  const toggle = await Toggle.findOneAndUpdate(
    { userId, endpointId: endpoint._id },
    { $set: { activeResponseId: response._id } },
    { upsert: true, new: true },
  );

  return toggle;
};

// Reset toggle user untuk endpoint ini — hapus dokumen toggle agar kembali ke default endpoint.
// Idempotent: tidak error jika toggle memang belum pernah dibuat.
export const resetToggle = async (project, endpointId, userId) => {
  await findEndpoint(endpointId, project);
  await Toggle.deleteOne({ userId, endpointId });
};
