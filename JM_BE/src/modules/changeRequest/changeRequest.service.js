import ChangeRequest    from '../../models/changeRequest.model.js';
import ContractVersion  from '../../models/contractVersion.model.js';
import Project          from '../../models/project.model.js';
import User             from '../../models/user.model.js';
import { sendMail }                from '../../config/mailer.js';
import { crSubmittedTemplate }     from '../../templates/crSubmitted.template.js';
import { crApprovedTemplate }      from '../../templates/crApproved.template.js';
import { crRejectedTemplate }      from '../../templates/crRejected.template.js';

// ─── Private Helpers ─────────────────────────────────────────────────────────

// Cari CR dan pastikan milik project ini — dipakai di semua operasi review & cancel.
const findCR = async (crId, projectId) => {
  const cr = await ChangeRequest.findOne({ _id: crId, projectId });
  if (!cr) {
    const err = new Error('Change Request tidak ditemukan dalam project ini');
    err.statusCode = 404;
    throw err;
  }
  return cr;
};

// Kirim notifikasi ke seluruh member project (owner + members) secara sequential.
// Digunakan saat CR disetujui — menggunakan crApprovedTemplate agar konteks CR terlihat jelas.
const notifyAllMembers = async (project, approver, cr, submitterName, newVersion) => {
  const memberUserIds = project.members.map((m) => m.userId);
  const allUserIds    = [project.ownerId, ...memberUserIds];
  const users         = await User.find({ _id: { $in: allUserIds } }).select('name email').lean();

  const changedAt = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/projects/${project._id}?tab=requests`;

  for (const user of users) {
    const { subject, html, text } = crApprovedTemplate({
      memberName:     user.name,
      approverName:   approver.name,
      submitterName,
      projectName:    project.name,
      projectVersion: newVersion,
      description:    cr.description,
      changedAt,
      dashboardUrl,
    });

    try {
      await sendMail({ to: user.email, subject, html, text });
    } catch (emailErr) {
      console.error(`[cr] Gagal kirim email ke ${user.email}:`, emailErr.message);
    }
  }
};

// ─── Exports ─────────────────────────────────────────────────────────────────

// Ajukan CR baru. Hanya FE dan BE yang bisa submit — PM edit langsung.
// proposedChanges bebas format (Mixed) — PM yang membaca dan apply manual jika disetujui.
// submitter = req.user (full Mongoose doc dari auth middleware), submitterRole = req.projectRole.
export const submitCR = async (project, submitter, submitterRole, { description, proposedChanges }) => {
  const cr = await ChangeRequest.create({
    projectId:       project._id,
    submittedBy:     submitter._id,
    description,
    proposedChanges,
    status:          'pending',
  });

  // Notifikasi PM bahwa ada CR baru yang menunggu tinjauan
  try {
    const pm           = await User.findById(project.ownerId).select('name email').lean();
    const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/projects/${project._id}?tab=requests`;

    if (pm) {
      const { subject, html, text } = crSubmittedTemplate({
        pmName:        pm.name,
        submitterName: submitter.name,
        submitterRole,
        projectName:   project.name,
        description,
        dashboardUrl,
      });
      await sendMail({ to: pm.email, subject, html, text });
    }
  } catch (emailErr) {
    console.error('[cr] Gagal kirim notifikasi CR baru ke PM:', emailErr.message);
  }

  return cr;
};

// Ambil semua CR dalam project dengan filter opsional.
// Filter: status (pending/approved/rejected), submittedBy (userId).
export const listCRs = async (project, query) => {
  const filter = { projectId: project._id };

  if (query.status) {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(query.status)) {
      const err = new Error(`Status tidak valid. Gunakan salah satu: ${validStatuses.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }
    filter.status = query.status;
  }

  if (query.submittedBy) {
    filter.submittedBy = query.submittedBy;
  }

  return ChangeRequest.find(filter)
    .populate('submittedBy', 'name email avatar')
    .populate('reviewedBy',  'name email avatar')
    .sort({ createdAt: -1 })
    .lean();
};

// Ambil detail satu CR — termasuk submitter dan reviewer jika sudah direview.
export const getCRDetail = async (project, crId) => {
  const cr = await ChangeRequest.findOne({ _id: crId, projectId: project._id })
    .populate('submittedBy', 'name email avatar')
    .populate('reviewedBy',  'name email avatar')
    .lean();

  if (!cr) {
    const err = new Error('Change Request tidak ditemukan dalam project ini');
    err.statusCode = 404;
    throw err;
  }

  return cr;
};

// Setujui CR — PM only.
// Efek:
//   - CR status → approved, reviewedBy + reviewedAt terisi
//   - ContractVersion dibuat (changeType: 'cr_approved')
//   - project.contractVersion naik 1
//   - Semua member dinotifikasi via crApprovedTemplate (blocking sequential)
// PM tetap harus menerapkan perubahan secara manual lewat endpoint masing-masing.
export const approveCR = async (project, crId, pmUser) => {
  const cr = await findCR(crId, project._id);

  if (cr.status !== 'pending') {
    const err = new Error(
      `CR ini sudah direview sebelumnya (status: ${cr.status}) dan tidak dapat diubah lagi`
    );
    err.statusCode = 409;
    throw err;
  }

  cr.status     = 'approved';
  cr.reviewedBy = pmUser._id;
  cr.reviewedAt = new Date();
  await cr.save();

  const newVersion = project.contractVersion + 1;

  const diff = {
    type:    'cr_approved',
    summary: cr.description,
    detail:  { crId: cr._id, proposedChanges: cr.proposedChanges },
  };

  await Promise.all([
    ContractVersion.create({
      projectId:       project._id,
      version:         newVersion,
      changedBy:       pmUser._id,
      changeType:      'cr_approved',
      changeRequestId: cr._id,
      diff,
    }),
    Project.findByIdAndUpdate(project._id, { $inc: { contractVersion: 1 } }),
  ]);

  // Ambil nama submitter untuk ditampilkan di email notifikasi member
  try {
    const submitter = await User.findById(cr.submittedBy).select('name').lean();
    await notifyAllMembers(project, pmUser, cr, submitter?.name || 'Anggota', newVersion);
  } catch (notifyErr) {
    console.error('[cr] Gagal menginisialisasi pengiriman notifikasi approve:', notifyErr.message);
  }

  return cr;
};

// Tolak CR — PM only.
// reason opsional — jika disertakan, disimpan di rejectionReason dan dikirim di email.
// Hanya submitter yang menerima notifikasi penolakan.
export const rejectCR = async (project, crId, pmUser, { reason } = {}) => {
  const cr = await findCR(crId, project._id);

  if (cr.status !== 'pending') {
    const err = new Error(
      `CR ini sudah direview sebelumnya (status: ${cr.status}) dan tidak dapat diubah lagi`
    );
    err.statusCode = 409;
    throw err;
  }

  cr.status          = 'rejected';
  cr.reviewedBy      = pmUser._id;
  cr.reviewedAt      = new Date();
  cr.rejectionReason = reason || null;
  await cr.save();

  // Kirim notifikasi hanya ke submitter
  try {
    const submitter = await User.findById(cr.submittedBy).select('name email').lean();
    if (submitter) {
      const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/projects/${project._id}?tab=requests`;
      const { subject, html, text } = crRejectedTemplate({
        submitterName: submitter.name,
        pmName:        pmUser.name,
        projectName:   project.name,
        description:   cr.description,
        reason:        reason || null,
        dashboardUrl,
      });
      await sendMail({ to: submitter.email, subject, html, text });
    }
  } catch (emailErr) {
    console.error('[cr] Gagal kirim notifikasi reject ke submitter:', emailErr.message);
  }

  return cr;
};

// Batalkan CR — hanya submitter sendiri, hanya jika status masih pending.
// Dokumen CR dihapus permanen dari database.
export const cancelCR = async (project, crId, userId) => {
  const cr = await findCR(crId, project._id);

  if (cr.submittedBy.toString() !== userId.toString()) {
    const err = new Error('Hanya submitter yang dapat membatalkan Change Request ini');
    err.statusCode = 403;
    throw err;
  }

  if (cr.status !== 'pending') {
    const err = new Error(
      `CR dengan status '${cr.status}' tidak dapat dibatalkan. Hanya CR yang masih pending yang bisa dibatalkan.`
    );
    err.statusCode = 409;
    throw err;
  }

  await ChangeRequest.findByIdAndDelete(crId);
};
