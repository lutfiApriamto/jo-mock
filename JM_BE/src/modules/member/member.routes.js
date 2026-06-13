import { Router }   from 'express';
import auth          from '../../middlewares/auth.middleware.js';
import permission    from '../../middlewares/permission.middleware.js';
import validate      from '../../middlewares/validate.middleware.js';
import * as schema   from './member.schema.js';
import * as ctrl     from './member.controller.js';

const router = Router();

router.use(auth);

// GET /api/projects/:projectId/members — list anggota (semua role)
router.get('/:projectId/members', permission(['PM', 'FE', 'BE']), ctrl.listMembers);

// POST /api/projects/:projectId/members — tambah anggota (PM only)
router.post('/:projectId/members', permission(['PM']), validate(schema.addMemberSchema), ctrl.addMember);

// PUT /api/projects/:projectId/members/:userId — ubah role anggota (PM only)
router.put('/:projectId/members/:userId', permission(['PM']), validate(schema.updateMemberSchema), ctrl.updateMemberRole);

// DELETE /api/projects/:projectId/members/:userId — keluarkan anggota (PM only)
router.delete('/:projectId/members/:userId', permission(['PM']), ctrl.removeMember);

export default router;

