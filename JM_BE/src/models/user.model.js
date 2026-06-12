import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // role di level platform — berbeda dari role di dalam project (PM/FE/BE)
    // 'user'       : pengguna biasa
    // 'superadmin' : akses penuh ke seluruh platform (manajemen user, project, quota)
    role: {
      type: String,
      enum: ['user', 'superadmin'],
      default: 'user',
    },

    // identifier avatar preset yang dipilih user dari daftar yang tersedia di FE
    avatar: {
      type: String,
      default: 'avatar_1',
    },

    // API key dipakai untuk mengidentifikasi SIAPA yang memanggil URL mock namun berbeda dengan JWT (yang untuk auth dashboard)
    apiKey: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },

    quota: {
      limit: {
        type: Number,
        default: 10000,
      },
      used: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', userSchema);
