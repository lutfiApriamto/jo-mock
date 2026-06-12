import mongoose from 'mongoose';

// Sub-schema untuk satu field di dalam request schema
// menggunakan struktur rekursif (properties & items) untuk mendukung object & array bersarang
// kedalaman nesting dibatasi 3 level di lapisan aplikasi (bukan di schema DB)
// sehingga model data tidak perlu diubah jika batas nanti ingin dilepas
const fieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'object', 'array'],
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },

    // diisi jika type = 'object' dan berisi daftar field child (rekursif menggunakan Mixed agar fleksibel). validasi struktur dilakukan oleh Ajv di lapisan service
    properties: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    items: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const endpointSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    // null = endpoint berada langsung di root project (bukan di dalam folder)
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },

    // HTTP method untuk endpoint ini
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      required: true,
    },

    // path URL endpoint, mendukung segmen dinamis dengan prefix ':'
    // contoh statis  : /api/users
    // contoh dinamis : /api/users/:id
    // catatan: path statis diprioritaskan atas path dinamis jika ada konflik routing
    path: {
      type: String,
      required: true,
      trim: true,
    },

    // referensi ke response yang menjadi "default" untuk endpoint ini
    // wajib berstatus 2xx (200, 201, dll)
    // tidak bisa dihapus selama masih menjadi defaultResponseId
    // jika ingin menghapus response ini, harus reassign defaultResponseId ke response 2xx lain dulu
    defaultResponseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Response',
      default: null, // null sementara saat endpoint baru dibuat, diisi setelah response default dibuat
    },

    // definisi field yang wajib/opsional dikirim dalam request body
    // HANYA berlaku untuk method POST, PUT, PATCH
    // untuk GET dan DELETE: requestSchema diabaikan, tidak ada validasi body
    requestSchema: [fieldSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Endpoint', endpointSchema);
