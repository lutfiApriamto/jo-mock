import { Router }   from 'express';
import auth          from '../../middlewares/auth.middleware.js';
import validate      from '../../middlewares/validate.middleware.js';
import * as schema   from './user.schema.js';
import * as ctrl     from './user.controller.js';
import * as invCtrl  from '../invitation/invitation.controller.js';

const router = Router();

// Semua route user memerlukan JWT yang valid
router.use(auth);

// GET /api/users/search?q=keyword — cari user berdasarkan nama atau email (hanya data publik)
// Diletakkan sebelum /me agar literal segment 'search' tidak tertangkap sebagai :userId
router.get('/search', ctrl.searchUsers);

// GET /api/users/me — profil user yang sedang login
router.get('/me', ctrl.getMyProfile);

// GET /api/users/me/invitations — undangan project yang menunggu konfirmasi user
router.get('/me/invitations', invCtrl.getMyInvitations);

// POST /api/users/me/invitations/:invitationId/accept — terima undangan by ID (dari dashboard)
router.post('/me/invitations/:invitationId/accept', invCtrl.acceptInvitationById);

// POST /api/users/me/invitations/:invitationId/decline — tolak undangan by ID (dari dashboard)
router.post('/me/invitations/:invitationId/decline', invCtrl.declineInvitationById);

// PUT /api/users/me — update nama, avatar, atau email (email butuh currentPassword)
router.put('/me', validate(schema.updateProfileSchema), ctrl.updateMyProfile);

// PATCH /api/users/me/password — ganti password + invalidasi sesi lain
router.patch('/me/password', validate(schema.changePasswordSchema), ctrl.changePassword);

// POST /api/users/me/api-key/regenerate — generate ulang API key (butuh currentPassword)
router.post('/me/api-key/regenerate', validate(schema.regenerateApiKeySchema), ctrl.regenerateApiKey);

export default router;
