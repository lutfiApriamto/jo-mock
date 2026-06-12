import mongoose from 'mongoose';

// Sub-schema untuk anggota project disimpan sebagai embedded array di dalam dokumen project karena jumlah anggota per project terbatas dan selalu diakses bersama project-nya
const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // role di dalam project — berbeda dari role platform (user/superadmin)
    // PM : bisa edit kontrak langsung, approve/reject CR, kelola anggota
    // FE : consume URL mock, toggle response, ajukan CR
    // BE : ajukan CR untuk mengusulkan perubahan kontrak
    role: {
      type: String,
      enum: ['PM', 'FE', 'BE'],
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // slug dipakai sebagai identifier di URL mock
    // format: /mock/{slug}/api/users => bersifat publik dan aman ditaruh di URL
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    members: [memberSchema],

    // nomor versi kontrak saat ini dan akan naik 1 setiap kali ada perubahan kontrak (via CR maupun edit langsung PM)
    contractVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Project', projectSchema);
