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

