import mongoose from 'mongoose';

// Toggle menyimpan "response mana yang sedang aktif" milik seorang user
// untuk satu endpoint tertentu
// model ini bekerja seperti "radio button" — tepat SATU response aktif per user per endpoint
const toggleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    endpointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Endpoint',
      required: true,
    },

    // response yang sedang dipilih aktif oleh user ini untuk endpoint ini
    // nilai awalnya = defaultResponseId milik endpoint (diset saat toggle pertama kali dibuat)
    activeResponseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Response',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// unique compound index memastikan satu user hanya punya SATU toggle per endpoint
toggleSchema.index({ userId: 1, endpointId: 1 }, { unique: true });

export default mongoose.model('Toggle', toggleSchema);
