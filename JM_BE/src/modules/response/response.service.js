import ResponseModel from '../../models/response.model.js';
import Endpoint      from '../../models/endpoint.model.js';
import Toggle        from '../../models/toggle.model.js';

// ─── Private Helpers ─────────────────────────────────────────────────────────

// Status 2xx: 200–299 (sukses) — syarat wajib untuk menjadi response default.
const is2xx = (statusCode) => statusCode >= 200 && statusCode < 300;

// Validasi bahwa string `body` adalah JSON yang valid.
// Mock server akan mengembalikan body ini mentah-mentah, jadi harus valid JSON.
const validateJsonBody = (body) => {
  try {
    JSON.parse(body);
  } catch {
    const err = new Error('Body response harus berupa JSON yang valid (contoh: {"key":"value"})');
    err.statusCode = 400;
    throw err;
  }
};

// Cari endpoint dan pastikan milik project ini sekaligus.
// Dipakai di semua service function agar tidak ada akses lintas project.
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

// Ambil semua response milik satu endpoint, diurutkan dari yang pertama dibuat.
export const listResponses = async (project, endpointId) => {
  await findEndpoint(endpointId, project);

  return ResponseModel.find({ endpointId })
    .select('statusCode body isDefault createdAt updatedAt')
    .sort({ statusCode: 1, createdAt: 1 })
    .lean();
};

// Buat response baru untuk sebuah endpoint.
// Auto-default: jika endpoint belum punya defaultResponseId dan statusCode 2xx,
// response ini otomatis menjadi default tanpa perlu langkah ekstra.
export const createResponse = async (project, endpointId, { statusCode, body }) => {
  const endpoint = await findEndpoint(endpointId, project);

  const responseBody = body ?? '{"message":"sukses"}';
  validateJsonBody(responseBody);

  const response = await ResponseModel.create({
    endpointId,
    statusCode,
    body:      responseBody,
    isDefault: false,
  });

  // Auto-set sebagai default jika endpoint belum punya default dan statusCode 2xx
  if (!endpoint.defaultResponseId && is2xx(statusCode)) {
    response.isDefault = true;
    await response.save();
    await Endpoint.findByIdAndUpdate(endpointId, { defaultResponseId: response._id });
  }

  return response;
};

// Update statusCode dan/atau body sebuah response.
// Aturan: response default tidak boleh diubah ke statusCode non-2xx —
// PM harus ganti default dulu sebelum bisa mengubah statusCode ini.
export const updateResponse = async (project, endpointId, responseId, { statusCode, body }) => {
  await findEndpoint(endpointId, project);

  const response = await ResponseModel.findOne({ _id: responseId, endpointId });
  if (!response) {
    const err = new Error('Response tidak ditemukan dalam endpoint ini');
    err.statusCode = 404;
    throw err;
  }

  if (body) validateJsonBody(body);

  // Blokir perubahan statusCode default → non-2xx
  if (statusCode && response.isDefault && !is2xx(statusCode)) {
    const err = new Error(
      'Response default tidak bisa diubah ke status non-2xx. Ganti response default terlebih dahulu.'
    );
    err.statusCode = 422;
    throw err;
  }

  if (statusCode) response.statusCode = statusCode;
  if (body)       response.body       = body;
  await response.save();

  return response;
};

// Jadikan sebuah response sebagai default endpoint.
// Aturan: hanya 2xx. Tidak bisa set ulang yang sudah menjadi default.
//
// Logika Toggle (kombinasi A+B):
//   - User yang activeResponseId === oldDefault (belum customized) → diupdate ke default baru
//   - User yang activeResponseId !== oldDefault (sudah pilih sendiri) → dibiarkan
//   - User tanpa Toggle sama sekali → otomatis dapat default baru dari endpoint.defaultResponseId
export const setDefaultResponse = async (project, endpointId, responseId) => {
  const endpoint = await findEndpoint(endpointId, project);

  const response = await ResponseModel.findOne({ _id: responseId, endpointId });
  if (!response) {
    const err = new Error('Response tidak ditemukan dalam endpoint ini');
    err.statusCode = 404;
    throw err;
  }

  if (!is2xx(response.statusCode)) {
    const err = new Error(
      `Response dengan status ${response.statusCode} tidak bisa dijadikan default. Hanya status 2xx (200, 201, dll) yang diizinkan.`
    );
    err.statusCode = 422;
    throw err;
  }

  if (endpoint.defaultResponseId?.toString() === responseId) {
    const err = new Error('Response ini sudah menjadi default endpoint');
    err.statusCode = 409;
    throw err;
  }

  const oldDefaultId = endpoint.defaultResponseId;

  // Unset default lama
  if (oldDefaultId) {
    await ResponseModel.findByIdAndUpdate(oldDefaultId, { isDefault: false });
  }

  // Set default baru pada response + endpoint
  response.isDefault = true;
  await response.save();
  await Endpoint.findByIdAndUpdate(endpointId, { defaultResponseId: response._id });

  // Propagate ke Toggle: user yang masih pakai old default → pindah ke default baru
  // User yang sudah customized (activeResponseId berbeda) → tidak disentuh
  if (oldDefaultId) {
    await Toggle.updateMany(
      { endpointId, activeResponseId: oldDefaultId },
      { activeResponseId: response._id }
    );
  }

  return response;
};

// Hapus sebuah response beserta Toggle yang menunjuk ke response ini (cascade).
// Tidak bisa menghapus response yang sedang menjadi default —
// PM harus set response lain sebagai default terlebih dahulu.
export const deleteResponse = async (project, endpointId, responseId) => {
  await findEndpoint(endpointId, project);

  const response = await ResponseModel.findOne({ _id: responseId, endpointId });
  if (!response) {
    const err = new Error('Response tidak ditemukan dalam endpoint ini');
    err.statusCode = 404;
    throw err;
  }

  if (response.isDefault) {
    const err = new Error(
      'Response default tidak bisa dihapus. Set response lain sebagai default terlebih dahulu.'
    );
    err.statusCode = 409;
    throw err;
  }

  // Cascade: hapus semua Toggle yang masih aktif menunjuk ke response ini
  await Toggle.deleteMany({ activeResponseId: responseId });
  await ResponseModel.findByIdAndDelete(responseId);
};
