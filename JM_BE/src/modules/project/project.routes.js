import { Router }   from 'express';
import auth          from '../../middlewares/auth.middleware.js';
import permission    from '../../middlewares/permission.middleware.js';
import validate      from '../../middlewares/validate.middleware.js';
import * as schema   from './project.schema.js';
import * as ctrl     from './project.controller.js';

const router = Router();

router.use(auth);

// POST /api/projects — buat project baru (semua user login)
router.post('/', validate(schema.createProjectSchema), ctrl.createProject);

// GET /api/projects/search?q=keyword — cari project berdasarkan nama
// Diletakkan sebelum /:projectId agar 'search' tidak diinterpretasikan sebagai ObjectId
router.get('/search', ctrl.searchProjects);

// GET /api/projects — list project milik user (sebagai owner atau member)
router.get('/', ctrl.listProjects);

// GET /api/projects/:projectId — detail project (owner + semua member)
router.get('/:projectId', permission(['PM', 'FE', 'BE']), ctrl.getProjectDetail);

// PUT /api/projects/:projectId — update nama project (PM only)
router.put('/:projectId', permission(['PM']), validate(schema.updateProjectSchema), ctrl.updateProject);

// DELETE /api/projects/:projectId — hapus project beserta semua isinya (PM only)
router.delete('/:projectId', permission(['PM']), ctrl.deleteProject);

export default router;

