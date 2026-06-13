import Project         from '../../models/project.model.js';
import Endpoint        from '../../models/endpoint.model.js';
import ResponseModel   from '../../models/response.model.js';
import Toggle          from '../../models/toggle.model.js';
import { findMatchingEndpoint } from '../../utils/pathMatcher.js';
import { validateRequestBody }  from '../../utils/schemaValidator.js';

// Method yang memiliki body dan wajib divalidasi terhadap requestSchema
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);

// Eksekusi satu mock request:
//   slug       → identifikasi project via slug (bukan ObjectId)
//   method     → HTTP method dari request (GET, POST, dst)
//   mockPath   → path setelah slug, mis. '/api/users/123'
//   userId     → _id dari user yang terautentikasi via API key
//   body       → req.body, divalidasi jika endpoint punya requestSchema
export const executeMock = async (slug, method, mockPath, userId, body) => {
  // 1. Temukan project via slug
  const project = await Project.findOne({ slug }).lean();
  if (!project) {
    const err = new Error(`Project dengan slug '${slug}' tidak ditemukan`);
    err.statusCode = 404;
    throw err;
  }

  // 2. Pastikan user adalah owner atau member project ini
  const isOwner  = project.ownerId.toString() === userId.toString();
  const isMember = project.members.some((m) => m.userId.toString() === userId.toString());
  if (!isOwner && !isMember) {
    const err = new Error('Anda tidak memiliki akses ke project ini');
    err.statusCode = 403;
    throw err;
  }

  // 3. Ambil semua endpoint project yang methodnya cocok
  const endpoints = await Endpoint.find({ projectId: project._id, method }).lean();

  // 4. Cocokkan path — static match diprioritaskan atas dynamic match (:param)
  const endpoint = findMatchingEndpoint(mockPath, endpoints);
  if (!endpoint) {
    const err = new Error(`Endpoint ${method} ${mockPath} tidak ditemukan dalam project ini`);
    err.statusCode = 404;
    throw err;
  }

  // 5. Validasi request body terhadap requestSchema (POST/PUT/PATCH + schema terdefinisi)
  if (BODY_METHODS.has(method) && endpoint.requestSchema?.length > 0) {
    const { valid, errors } = validateRequestBody(endpoint.requestSchema, body);
    if (!valid) {
      const err = new Error('Request body tidak sesuai schema endpoint ini');
      err.statusCode = 422;
      // err.errors diteruskan oleh errorHandler ke sendError sebagai field-level detail
      err.errors = errors.map((e) => ({ message: `${e.field}: ${e.message}`, code: 422 }));
      throw err;
    }
  }

  // 6. Resolusi response aktif: toggle user → fallback ke defaultResponseId endpoint
  let activeResponseId = endpoint.defaultResponseId;

  const toggle = await Toggle.findOne({ userId, endpointId: endpoint._id }).lean();
  if (toggle) {
    activeResponseId = toggle.activeResponseId;
  }

  // 7. Belum ada response sama sekali — PM belum mengonfigurasi endpoint ini
  if (!activeResponseId) {
    const err = new Error(
      `Endpoint ${method} ${mockPath} belum memiliki response. PM perlu membuat response untuk endpoint ini terlebih dahulu.`
    );
    err.statusCode = 503;
    throw err;
  }

  // 8. Ambil dokumen response aktif
  const response = await ResponseModel.findById(activeResponseId).lean();
  if (!response) {
    // Kondisi defensif — seharusnya tidak terjadi karena cascade delete menjaga konsistensi data
    const err = new Error(
      'Response aktif tidak ditemukan. Coba reset toggle Anda atau hubungi PM project.'
    );
    err.statusCode = 503;
    throw err;
  }

  return response;
};
