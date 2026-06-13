import { Router } from 'express';
import auth        from '../../middlewares/auth.middleware.js';
import * as ctrl   from './invitation.controller.js';

const router = Router();

// GET /api/invitations/:token — ambil detail undangan (public, tidak butuh auth)
// Dipakai FE untuk menampilkan halaman konfirmasi undangan sebelum user memutuskan
router.get('/:token', ctrl.getInvitationByToken);

// POST /api/invitations/:token/accept — terima undangan (auth required)
router.post('/:token/accept', auth, ctrl.acceptInvitation);

// POST /api/invitations/:token/decline — tolak undangan (auth required)
router.post('/:token/decline', auth, ctrl.declineInvitation);

export default router;
