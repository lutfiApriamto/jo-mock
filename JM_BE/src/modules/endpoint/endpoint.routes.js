import { Router } from 'express';
import auth        from '../../middlewares/auth.middleware.js';
import permission  from '../../middlewares/permission.middleware.js';
import validate    from '../../middlewares/validate.middleware.js';
import * as schema from './endpoint.schema.js';
import * as ctrl   from './endpoint.controller.js';

const router = Router();

router.use(auth);

// GET /api/projects/:projectId/endpoints — flat list, opsional filter ?folderId (semua role)
router.get('/:projectId/endpoints', permission(['PM', 'FE', 'BE']), ctrl.listEndpoints);

// GET /api/projects/:projectId/endpoints/search?q=keyword — cari endpoint (semua role)
// Diletakkan sebelum /:endpointId agar 'search' tidak diparsing sebagai ObjectId
router.get('/:projectId/endpoints/search', permission(['PM', 'FE', 'BE']), ctrl.searchEndpoints);

// GET /api/projects/:projectId/endpoints/:endpointId — detail + requestSchema (semua role)
router.get('/:projectId/endpoints/:endpointId', permission(['PM', 'FE', 'BE']), ctrl.getEndpointDetail);

// POST /api/projects/:projectId/endpoints — buat endpoint baru (PM only)
router.post('/:projectId/endpoints', permission(['PM']), validate(schema.createEndpointSchema), ctrl.createEndpoint);

// PUT /api/projects/:projectId/endpoints/:endpointId — update endpoint (PM only)
// Perubahan method/path/requestSchema → trigger ContractVersion + email notifikasi
router.put('/:projectId/endpoints/:endpointId', permission(['PM']), validate(schema.updateEndpointSchema), ctrl.updateEndpoint);

// DELETE /api/projects/:projectId/endpoints/:endpointId — hapus endpoint + cascade (PM only)
router.delete('/:projectId/endpoints/:endpointId', permission(['PM']), ctrl.deleteEndpoint);

export default router;
