import { Router } from 'express';
import auth        from '../../middlewares/auth.middleware.js';
import permission  from '../../middlewares/permission.middleware.js';
import validate    from '../../middlewares/validate.middleware.js';
import * as schema from './folder.schema.js';
import * as ctrl   from './folder.controller.js';

const router = Router();

router.use(auth);

// GET /api/projects/:projectId/folders — flat list dengan parentId (semua role)
router.get('/:projectId/folders', permission(['PM', 'FE', 'BE']), ctrl.listFolders);

// POST /api/projects/:projectId/folders — buat folder baru (PM only)
router.post('/:projectId/folders', permission(['PM']), validate(schema.createFolderSchema), ctrl.createFolder);

// GET /api/projects/:projectId/folders/search?q=keyword — cari folder berdasarkan nama (semua role)
// Diletakkan sebelum /:folderId agar 'search' tidak diparsing sebagai ObjectId
router.get('/:projectId/folders/search', permission(['PM', 'FE', 'BE']), ctrl.searchFolders);

// PUT /api/projects/:projectId/folders/:folderId — rename folder (PM only)
router.put('/:projectId/folders/:folderId', permission(['PM']), validate(schema.renameFolderSchema), ctrl.renameFolder);

// DELETE /api/projects/:projectId/folders/:folderId — hapus folder + cascade delete (PM only)
router.delete('/:projectId/folders/:folderId', permission(['PM']), ctrl.deleteFolder);

export default router;
