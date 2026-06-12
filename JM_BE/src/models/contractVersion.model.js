import mongoose from 'mongoose';

// ContractVersion menyimpan riwayat setiap perubahan kontrak dalam sebuah project dibuat setiap kali kontrak berubah, baik melalui CR yang diapprove maupun edit langsung PM
// dibuat setiap kali kontrak berubah, baik melalui CR yang diapprove maupun edit langsung PM

const contractVersionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    version: {
      type: Number,
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    changeType: {
      type: String,
      enum: ['cr_approved', 'pm_direct_edit'],
      required: true,
    },

    changeRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChangeRequest',
      default: null,
    },

    diff: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ContractVersion', contractVersionSchema);
