import { Router } from 'express';
import auth        from '../../middlewares/auth.middleware.js';
import admin       from '../../middlewares/admin.middleware.js';
import validate    from '../../middlewares/validate.middleware.js';
import * as schema from './admin.schema.js';
import * as ctrl   from './admin.controller.js';

const router = Router();

// Semua route admin memerlukan JWT valid + role superadmin
router.use(auth, admin);

// ─── Platform Stats ───────────────────────────────────────────────────────────
// GET /api/admin/stats
router.get('/stats', ctrl.getPlatformStats);

// ─── User Management ─────────────────────────────────────────────────────────
// GET /api/admin/users?q=&page=&limit=
router.get('/users', ctrl.listUsers);

// GET /api/admin/users/:userId
router.get('/users/:userId', ctrl.getUserDetail);

// PATCH /api/admin/users/:userId/role — ubah role platform (user ↔ superadmin)
router.patch('/users/:userId/role', validate(schema.updateRoleSchema), ctrl.updateUserRole);

// PATCH /api/admin/users/:userId/quota — update limit
router.patch('/users/:userId/quota', validate(schema.updateQuotaSchema), ctrl.updateQuotaLimit);

// POST /api/admin/users/:userId/quota/reset — reset used ke 0
router.post('/users/:userId/quota/reset', ctrl.resetQuota);

// DELETE /api/admin/users/:userId — hapus user + transfer project ke superadmin
router.delete('/users/:userId', ctrl.deleteUser);

// ─── Project Management ──────────────────────────────────────────────────────
// GET /api/admin/projects?q=&page=&limit=
router.get('/projects', ctrl.listAllProjects);

// DELETE /api/admin/projects/:projectId — force delete project
router.delete('/projects/:projectId', ctrl.forceDeleteProject);

export default router;
