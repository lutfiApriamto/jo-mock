import mongoose from 'mongoose';

// Change Request (CR) adalah mekanisme kontrol perubahan kontrak yang dimana hanya FE dan BE yang bisa mengajukan CR.
// alur: FE/BE ajukan CR → PM review diff → approve/reject → jika approve → kontrak naik versi + semua anggota dinotifikasi via email
const changeRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // penjelasan singkat dari pengaju: apa yang ingin diubah dan mengapa
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // snapshot perubahan yang diusulkan dalam format bebas (Mixed)
    // dipakai untuk menampilkan diff kepada PM sebelum memutuskan
    // contoh isi: { type: 'field_rename', endpoint: 'POST /api/users', from: 'name', to: 'fullName' }
    proposedChanges: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // status CR saat ini:
    // 'pending'  = menunggu keputusan PM
    // 'approved' = disetujui, kontrak akan/sudah berubah
    // 'rejected' = ditolak, kontrak tidak berubah
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // PM yang melakukan review (null jika belum direview)
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ChangeRequest', changeRequestSchema);
