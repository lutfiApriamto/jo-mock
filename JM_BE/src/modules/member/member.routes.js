import { Router }    from 'express';
import auth           from '../../middlewares/auth.middleware.js';
import permission     from '../../middlewares/permission.middleware.js';
import validate       from '../../middlewares/validate.middleware.js';
import * as schema    from './member.schema.js';
import * as ctrl      from './member.controller.js';
import * as invCtrl   from '../invitation/invitation.controller.js';

const router = Router();

router.use(auth);

// GET /api/projects/:projectId/members — list anggota (semua role)
router.get('/:projectId/members', permission(['PM', 'FE', 'BE']), ctrl.listMembers);

// GET /api/projects/:projectId/members/invitations — list undangan pending (PM only)
router.get('/:projectId/members/invitations', permission(['PM']), invCtrl.listProjectInvitations);

// POST /api/projects/:projectId/members/invite — undang member baru via email (PM only)
// Menggantikan flow addMember langsung — user harus menerima undangan dulu
router.post('/:projectId/members/invite', permission(['PM']), validate(schema.inviteMemberSchema), invCtrl.inviteMember);

// POST /api/projects/:projectId/members/invitations/:invitationId/resend — kirim ulang email (PM only)
// Token lama diinvalidasi, token baru digenerate, expiry diperpanjang 7 hari
router.post('/:projectId/members/invitations/:invitationId/resend', permission(['PM']), invCtrl.resendInvitation);

// DELETE /api/projects/:projectId/members/invitations/:invitationId — batalkan undangan (PM only)
// Setelah dibatalkan, slot anggota yang direservasi undangan ini tersedia kembali
router.delete('/:projectId/members/invitations/:invitationId', permission(['PM']), invCtrl.cancelInvitation);

// PUT /api/projects/:projectId/members/:userId — ubah role anggota (PM only)
router.put('/:projectId/members/:userId', permission(['PM']), validate(schema.updateMemberSchema), ctrl.updateMemberRole);

// DELETE /api/projects/:projectId/members/:userId — keluarkan anggota (PM only)
router.delete('/:projectId/members/:userId', permission(['PM']), ctrl.removeMember);

// PATCH /api/projects/:projectId/transfer-ownership — transfer kepemilikan ke member (owner only)
router.patch('/:projectId/transfer-ownership', permission(['PM']), validate(schema.transferOwnershipSchema), ctrl.transferOwnership);

export default router;
