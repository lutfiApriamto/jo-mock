import mongoose from 'mongoose';

// Response adalah definisi balasan untuk sebuah Endpoint satu Endpoint bisa punya banyak Response (200, 401, 404, 500, dll)
const responseSchema = new mongoose.Schema(
  {
    endpointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Endpoint',
      required: true,
    },

    // HTTP status code untuk response ini
    // 2xx: sukses (200, 201, 204, dll)
    // 4xx: error client (400, 401, 403, 404, dll)
    // 5xx: error server (500, dll)
    statusCode: {
      type: Number,
      required: true,
    },

    // isi response dalam format string JSON divalidasi sebagai JSON yang valid pada saat user menyimpan di dashboard sehingga mock server tidak pernah mengembalikan JSON yang rusak
    body: {
      type: String,
      required: true,
      default: '{"message":"sukses"}',
    },

    // menandai apakah response ini adalah "default" untuk endpoint-nya
    // aturan:
    // - hanya boleh ada SATU response dengan isDefault=true per endpoint
    // - response default wajib berstatus 2xx
    // - response default tidak bisa dihapus selama masih isDefault=true
    // - untuk mengganti default: set response lain menjadi isDefault=true dulu,  baru response ini bisa dihapus
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Response', responseSchema);
