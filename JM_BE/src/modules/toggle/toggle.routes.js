import { Router } from 'express';
import auth        from '../../middlewares/auth.middleware.js';
import permission  from '../../middlewares/permission.middleware.js';
import validate    from '../../middlewares/validate.middleware.js';
import * as schema from './toggle.schema.js';
import * as ctrl   from './toggle.controller.js';

const router = Router();

router.use(auth);

// GET /api/projects/:projectId/toggles
// Semua toggle milik user yang login di project ini (semua role)
router.get(
  '/:projectId/toggles',
  permission(['PM', 'FE', 'BE']),
  ctrl.listMyToggles,
);

// GET /api/projects/:projectId/endpoints/:endpointId/toggle
// Status toggle user untuk satu endpoint — fallback ke default jika belum pernah di-set (semua role)
router.get(
  '/:projectId/endpoints/:endpointId/toggle',
  permission(['PM', 'FE', 'BE']),
  ctrl.getMyToggle,
);

// PUT /api/projects/:projectId/endpoints/:endpointId/toggle
// Pilih (atau ganti) response aktif untuk endpoint ini (semua role)
router.put(
  '/:projectId/endpoints/:endpointId/toggle',
  permission(['PM', 'FE', 'BE']),
  validate(schema.upsertToggleSchema),
  ctrl.upsertToggle,
);

// DELETE /api/projects/:projectId/endpoints/:endpointId/toggle
// Reset pilihan toggle — kembali ke default endpoint (semua role, idempotent)
router.delete(
  '/:projectId/endpoints/:endpointId/toggle',
  permission(['PM', 'FE', 'BE']),
  ctrl.resetToggle,
);

export default router;
