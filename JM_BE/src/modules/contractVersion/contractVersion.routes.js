import { Router } from 'express';
import auth        from '../../middlewares/auth.middleware.js';
import permission  from '../../middlewares/permission.middleware.js';
import * as ctrl   from './contractVersion.controller.js';

const router = Router();

router.use(auth);

// GET /api/projects/:projectId/contract-versions — riwayat perubahan kontrak (semua role)
// Filter opsional: ?changeType=cr_approved|pm_direct_edit&page=1&limit=20
router.get('/:projectId/contract-versions', permission(['PM', 'FE', 'BE']), ctrl.listContractVersions);

// GET /api/projects/:projectId/contract-versions/:version — detail satu versi (semua role)
router.get('/:projectId/contract-versions/:version', permission(['PM', 'FE', 'BE']), ctrl.getContractVersionDetail);

export default router;
