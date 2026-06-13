import { Router } from 'express';
import auth        from '../../middlewares/auth.middleware.js';
import permission  from '../../middlewares/permission.middleware.js';
import validate    from '../../middlewares/validate.middleware.js';
import * as schema from './changeRequest.schema.js';
import * as ctrl   from './changeRequest.controller.js';

const router = Router();

router.use(auth);

// POST /api/projects/:projectId/change-requests
// Ajukan CR baru — hanya FE dan BE (PM edit langsung tanpa CR)
router.post(
  '/:projectId/change-requests',
  permission(['FE', 'BE']),
  validate(schema.submitCRSchema),
  ctrl.submitCR,
);

// GET /api/projects/:projectId/change-requests
// Daftar CR. Filter via query: ?status=pending|approved|rejected&submittedBy=<userId>
router.get(
  '/:projectId/change-requests',
  permission(['PM', 'FE', 'BE']),
  ctrl.listCRs,
);

// GET /api/projects/:projectId/change-requests/:crId
// Detail satu CR lengkap dengan data submitter dan reviewer
router.get(
  '/:projectId/change-requests/:crId',
  permission(['PM', 'FE', 'BE']),
  ctrl.getCRDetail,
);

// PATCH /api/projects/:projectId/change-requests/:crId/approve
// Setujui CR — PM only. Membuat ContractVersion + notifikasi semua member.
router.patch(
  '/:projectId/change-requests/:crId/approve',
  permission(['PM']),
  ctrl.approveCR,
);

// PATCH /api/projects/:projectId/change-requests/:crId/reject
// Tolak CR — PM only. Body opsional: { reason }. Notifikasi ke submitter saja.
router.patch(
  '/:projectId/change-requests/:crId/reject',
  permission(['PM']),
  validate(schema.rejectCRSchema),
  ctrl.rejectCR,
);

// DELETE /api/projects/:projectId/change-requests/:crId
// Batalkan CR — FE/BE, hanya submitter sendiri, hanya jika status masih pending.
router.delete(
  '/:projectId/change-requests/:crId',
  permission(['FE', 'BE']),
  ctrl.cancelCR,
);

export default router;
