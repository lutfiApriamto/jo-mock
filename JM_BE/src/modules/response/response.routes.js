import { Router } from 'express';
import auth        from '../../middlewares/auth.middleware.js';
import permission  from '../../middlewares/permission.middleware.js';
import validate    from '../../middlewares/validate.middleware.js';
import * as schema from './response.schema.js';
import * as ctrl   from './response.controller.js';

const router = Router();

router.use(auth);

// GET /api/projects/:projectId/endpoints/:endpointId/responses
// Ambil semua response milik endpoint (semua role)
router.get(
  '/:projectId/endpoints/:endpointId/responses',
  permission(['PM', 'FE', 'BE']),
  ctrl.listResponses,
);

// POST /api/projects/:projectId/endpoints/:endpointId/responses
// Buat response baru — PM only
router.post(
  '/:projectId/endpoints/:endpointId/responses',
  permission(['PM']),
  validate(schema.createResponseSchema),
  ctrl.createResponse,
);

// PUT /api/projects/:projectId/endpoints/:endpointId/responses/:responseId
// Update statusCode dan/atau body — PM only
router.put(
  '/:projectId/endpoints/:endpointId/responses/:responseId',
  permission(['PM']),
  validate(schema.updateResponseSchema),
  ctrl.updateResponse,
);

// PATCH /api/projects/:projectId/endpoints/:endpointId/responses/:responseId/set-default
// Jadikan response ini sebagai default endpoint — PM only, hanya 2xx
router.patch(
  '/:projectId/endpoints/:endpointId/responses/:responseId/set-default',
  permission(['PM']),
  ctrl.setDefaultResponse,
);

// DELETE /api/projects/:projectId/endpoints/:endpointId/responses/:responseId
// Hapus response + cascade Toggle — PM only, tidak bisa hapus default
router.delete(
  '/:projectId/endpoints/:endpointId/responses/:responseId',
  permission(['PM']),
  ctrl.deleteResponse,
);

export default router;
