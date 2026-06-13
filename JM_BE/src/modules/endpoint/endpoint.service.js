import Endpoint        from '../../models/endpoint.model.js';
import Folder          from '../../models/folder.model.js';
import Response        from '../../models/response.model.js';
import Toggle          from '../../models/toggle.model.js';
import Project         from '../../models/project.model.js';
import ContractVersion from '../../models/contractVersion.model.js';
import User            from '../../models/user.model.js';
import { createDiff, CHANGE_TYPES }      from '../../utils/contractDiff.js';
import { sendMail }                      from '../../config/mailer.js';
import { contractChangeTemplate }        from '../../templates/contractChange.template.js';

// ─── Private Helpers ─────────────────────────────────────────────────────────

// Validasi kedalaman nesting requestSchema — maksimal 3 level.
// Sesuai batasan di endpoint.model.js yang dijaga di lapisan aplikasi (bukan DB).
// Level dihitung dari field top-level (level 1) ke bawah.
const validateSchemaDepth = (fields, depth = 1) => {
  if (!Array.isArray(fields) || fields.length === 0) return;

  if (depth > 3) {
    const err = new Error('Request schema tidak boleh melebihi 3 level nesting');
    err.statusCode = 400;
    throw err;
  }

  for (const field of fields) {
    // object field: child fields ada di field.properties (array)
    if (field.type === 'object' && Array.isArray(field.properties)) {
      validateSchemaDepth(field.properties, depth + 1);
    }
    // array of object: child fields ada di field.items.properties
    if (field.type === 'array' && field.items?.type === 'object' && Array.isArray(field.items?.properties)) {
      validateSchemaDepth(field.items.properties, depth + 1);
    }
  }
};

// Kirim notifikasi email ke semua member project (owner + members) secara sequential.
// Satu per satu agar tidak membebani SMTP sekaligus dan menghindari RTO.
// Kegagalan per-email di-log dan dilanjutkan ke penerima berikutnya tanpa membatalkan semua.
const notifyProjectMembers = async (project, editor, diff, newVersion) => {
  const memberUserIds = project.members.map((m) => m.userId);
  const allUserIds    = [project.ownerId, ...memberUserIds];

  const users = await User.find({ _id: { $in: allUserIds } }).select('name email').lean();

  const changedAt = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const dashboardUrl = `${process.env.CLIENT_URL}/projects/${project.slug}`;

  for (const user of users) {
    const { subject, html, text } = contractChangeTemplate({
      memberName:     user.name,
      editorName:     editor.name,
      projectName:    project.name,
      projectVersion: newVersion,
      summary:        diff.summary,
      changedAt,
      dashboardUrl,
    });

    try {
      await sendMail({ to: user.email, subject, html, text });
    } catch (emailErr) {
      // Jangan hentikan loop — lanjut ke member berikutnya meski satu gagal
      console.error(`[notify] Gagal kirim email ke ${user.email}:`, emailErr.message);
    }
  }
};

// ─── Exports ─────────────────────────────────────────────────────────────────

// Ambil semua endpoint dalam project sebagai flat list.
// Filter opsional via query param folderId:
//   ?folderId=<id>   → endpoint dalam folder tertentu
//   ?folderId=null   → endpoint di root (tidak dalam folder)
//   (tidak ada param) → semua endpoint
export const listEndpoints = async (project, query) => {
  const filter = { projectId: project._id };

  if (query.folderId !== undefined) {
    filter.folderId = query.folderId === 'null' ? null : query.folderId;
  }

  return Endpoint.find(filter)
    .select('method path folderId defaultResponseId createdAt updatedAt')
    .sort({ createdAt: 1 })
    .lean();
};

// Ambil detail satu endpoint lengkap dengan requestSchema.
export const getEndpointDetail = async (project, endpointId) => {
  const endpoint = await Endpoint.findOne({ _id: endpointId, projectId: project._id });

  if (!endpoint) {
    const err = new Error('Endpoint tidak ditemukan dalam project ini');
    err.statusCode = 404;
    throw err;
  }

  return endpoint;
};

// Buat endpoint baru dalam project.
// Validasi: folderId milik project (jika ada) + method+path unik per project.
// requestSchema opsional (default array kosong).
export const createEndpoint = async (project, body) => {
  const { method, path, folderId, requestSchema } = body;

  if (requestSchema?.length) {
    validateSchemaDepth(requestSchema);
  }

  if (folderId) {
    const folder = await Folder.findOne({ _id: folderId, projectId: project._id });
    if (!folder) {
      const err = new Error('Folder tidak ditemukan dalam project ini');
      err.statusCode = 404;
      throw err;
    }
  }

  // Kombinasi method + path harus unik dalam satu project
  const duplicate = await Endpoint.findOne({ projectId: project._id, method, path });
  if (duplicate) {
    const err = new Error(`Endpoint ${method} ${path} sudah ada dalam project ini`);
    err.statusCode = 409;
    throw err;
  }

  return Endpoint.create({
    projectId:     project._id,
    folderId:      folderId || null,
    method,
    path,
    requestSchema: requestSchema || [],
  });
};

// Update endpoint yang sudah ada.
// Jika method / path / requestSchema berubah (contract change):
//   → buat ContractVersion (pm_direct_edit) + kirim email ke semua member
// Jika hanya folderId yang berubah (pindah folder):
//   → tidak dianggap contract change, tidak ada notifikasi
// editor = req.user (PM yang melakukan perubahan, untuk dicatat di ContractVersion)
export const updateEndpoint = async (project, endpointId, body, editor) => {
  const { method, path, folderId, requestSchema } = body;

  const endpoint = await Endpoint.findOne({ _id: endpointId, projectId: project._id });
  if (!endpoint) {
    const err = new Error('Endpoint tidak ditemukan dalam project ini');
    err.statusCode = 404;
    throw err;
  }

  if (requestSchema?.length) {
    validateSchemaDepth(requestSchema);
  }

  // Validasi folderId baru milik project ini jika berubah
  if (folderId && folderId !== (endpoint.folderId?.toString() ?? null)) {
    const folder = await Folder.findOne({ _id: folderId, projectId: project._id });
    if (!folder) {
      const err = new Error('Folder tidak ditemukan dalam project ini');
      err.statusCode = 404;
      throw err;
    }
  }

  // Cek uniqueness jika method atau path berubah
  const newMethod = method ?? endpoint.method;
  const newPath   = path   ?? endpoint.path;
  const methodOrPathChanged = (method && method !== endpoint.method) || (path && path !== endpoint.path);

  if (methodOrPathChanged) {
    const duplicate = await Endpoint.findOne({
      projectId: project._id,
      method:    newMethod,
      path:      newPath,
      _id:       { $ne: endpointId },
    });
    if (duplicate) {
      const err = new Error(`Endpoint ${newMethod} ${newPath} sudah ada dalam project ini`);
      err.statusCode = 409;
      throw err;
    }
  }

  // Tentukan field kontrak mana yang berubah
  const contractChanges = [];
  if (method && method !== endpoint.method) {
    contractChanges.push({ field: 'method', from: endpoint.method, to: method });
  }
  if (path && path !== endpoint.path) {
    contractChanges.push({ field: 'path', from: endpoint.path, to: path });
  }
  if (requestSchema && JSON.stringify(endpoint.requestSchema) !== JSON.stringify(requestSchema)) {
    contractChanges.push({ field: 'requestSchema', changed: true });
  }

  // Terapkan perubahan ke dokumen endpoint
  if (method)                endpoint.method        = method;
  if (path)                  endpoint.path          = path;
  if (folderId !== undefined) endpoint.folderId     = folderId || null;
  if (requestSchema)         endpoint.requestSchema = requestSchema;
  await endpoint.save();

  // Jika ada perubahan kontrak → catat di ContractVersion + notifikasi
  if (contractChanges.length > 0) {
    const newVersion = project.contractVersion + 1;

    const diff = createDiff(CHANGE_TYPES.ENDPOINT_MODIFIED, {
      method:  newMethod,
      path:    newPath,
      changes: contractChanges,
    });

    await Promise.all([
      ContractVersion.create({
        projectId:       project._id,
        version:         newVersion,
        changedBy:       editor._id,
        changeType:      'pm_direct_edit',
        changeRequestId: null,
        diff,
      }),
      Project.findByIdAndUpdate(project._id, { $inc: { contractVersion: 1 } }),
    ]);

    // Sequential blocking: response dikirim setelah semua email selesai dikirim.
    // Dibungkus try-catch agar kegagalan level DB (User.find) tidak membatalkan
    // update yang sudah berhasil disimpan.
    try {
      await notifyProjectMembers(project, editor, diff, newVersion);
    } catch (notifyErr) {
      console.error('[notify] Gagal menginisialisasi pengiriman notifikasi:', notifyErr.message);
    }
  }

  return endpoint;
};

// Cari endpoint dalam project berdasarkan path atau method.
// Pencarian case insensitive — berguna untuk FE saat memilih endpoint saat invite/toggle.
export const searchEndpoints = async (project, q) => {
  if (!q || q.trim().length < 2) {
    const err = new Error('Kata kunci pencarian minimal 2 karakter');
    err.statusCode = 400;
    throw err;
  }

  const regex  = new RegExp(q.trim(), 'i');
  const filter = {
    projectId: project._id,
    $or: [{ path: regex }, { method: regex }],
  };

  return Endpoint.find(filter)
    .select('method path folderId defaultResponseId createdAt')
    .sort({ createdAt: 1 })
    .limit(30)
    .lean();
};

// Hapus endpoint beserta semua data terkait (cascade).
// Response dan Toggle dihapus terlebih dahulu karena mereka mereferensi endpointId.
export const deleteEndpoint = async (project, endpointId) => {
  const endpoint = await Endpoint.findOne({ _id: endpointId, projectId: project._id });

  if (!endpoint) {
    const err = new Error('Endpoint tidak ditemukan dalam project ini');
    err.statusCode = 404;
    throw err;
  }

  await Promise.all([
    Response.deleteMany({ endpointId }),
    Toggle.deleteMany({ endpointId }),
  ]);

  await Endpoint.findByIdAndDelete(endpointId);
};
