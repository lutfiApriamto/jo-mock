import { sendError } from '../utils/apiResponse.js';
import asyncHandler   from '../utils/asyncHandler.js';
import Project        from '../models/project.model.js';

const permission = (allowedRoles) => asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Autentikasi diperlukan', 401);
  }

  if (req.user.role === 'superadmin') {
    return next();
  }

  const projectId = req.params.projectId || req.body.projectId;

  if (!projectId) {
    return sendError(res, 'Project ID tidak ditemukan dalam request', 400);
  }

  const project = await Project.findById(projectId);

  if (!project) {
    return sendError(res, 'Project tidak ditemukan', 404);
  }

  const isOwner = project.ownerId.toString() === req.user._id.toString();

  if (isOwner) {
    if (!allowedRoles.includes('PM')) {
      return sendError(res, 'Aksi ini tidak diizinkan untuk role PM', 403);
    }
    req.project       = project;
    req.projectRole   = 'PM';
    return next();
  }

  const member = project.members.find(
    (m) => m.userId.toString() === req.user._id.toString()
  );

  if (!member) {
    return sendError(res, 'Anda bukan anggota project ini', 403);
  }

  if (!allowedRoles.includes(member.role)) {
    return sendError(res, `Aksi ini membutuhkan role: ${allowedRoles.join(' / ')}`, 403);
  }

  req.project     = project;
  req.projectRole = member.role;
  next();
});

export default permission;

/*
  LOGIKA PEMROGRAMAN — permission.middleware.js
  -----------------------------------------------
  Middleware ini mengecek apakah user yang sudah login memiliki role yang cukup
  untuk melakukan aksi tertentu di dalam sebuah project.
  Ini adalah PROJECT-LEVEL permission — berbeda dari admin.middleware yang PLATFORM-LEVEL.

  Urutan wajib: auth.middleware → permission(roles) → controller
  Cara pemakaian di routes:
    router.post('/change-requests', auth, permission(['FE', 'BE']), crController.create)
    router.patch('/:id/approve',    auth, permission(['PM']),        crController.approve)
    router.get('/',                 auth, permission(['PM','FE','BE']), crController.getAll)

  Superadmin bypass:
  - Superadmin bisa melakukan apa saja di project manapun tanpa jadi anggota
  - Ini untuk kebutuhan administrasi platform (debug, audit, dll)
  - Jika superadmin → langsung next(), skip semua pengecekan project

  Cari projectId:
  - Pertama cek req.params.projectId (dari URL seperti /projects/:projectId/...)
  - Fallback ke req.body.projectId (dari body request saat membuat resource baru)
  - Jika tidak ditemukan di keduanya → request tidak valid → 400

  Pengecekan owner:
  - Owner project selalu bertindak sebagai PM (meski tidak ada di array members)
  - .toString() diperlukan karena ObjectId di Mongoose bukan string biasa
  - Jika owner tapi role 'PM' tidak di allowedRoles → tetap 403 (mis. aksi khusus FE/BE)

  Pengecekan member:
  - .find() mencari di array members yang embedded di dokumen project
  - Jika user tidak ditemukan di members → bukan anggota → 403
  - Jika ditemukan tapi role tidak sesuai → tidak punya izin → 403

  req.project & req.projectRole:
  - Dilekatkan ke request agar controller/service tidak perlu query project lagi
  - req.projectRole berguna jika controller perlu tahu role user untuk logika berbeda
*/
