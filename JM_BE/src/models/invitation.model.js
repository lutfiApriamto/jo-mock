import mongoose from 'mongoose';

const { Schema } = mongoose;

const invitationSchema = new Schema(
  {
    projectId:     { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    invitedBy:     { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    invitedUserId: { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    role:          { type: String, enum: ['PM', 'FE', 'BE'],       required: true },
    token:         { type: String, required: true, unique: true }, // SHA-256 hashed raw token
    expiry:        { type: Date,   required: true },
    status:        { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  },
  { timestamps: true }
);

// Satu user hanya boleh memiliki satu undangan pending per project
invitationSchema.index({ projectId: 1, invitedUserId: 1 }, {
  unique: true,
  partialFilterExpression: { status: 'pending' },
});

// TTL index: MongoDB auto-hapus dokumen ketika field expiry sudah terlewati.
// expireAfterSeconds: 0 berarti dokumen dihapus tepat saat tanggal expiry tercapai.
// Berlaku untuk semua status — invitation yang sudah accepted/declined juga dibersihkan.
invitationSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Invitation', invitationSchema);
