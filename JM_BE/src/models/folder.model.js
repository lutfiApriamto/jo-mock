import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    // parentId menunjuk ke Folder lain (self-referential) untuk mendukung nested folder
    // null  = folder berada langsung di root project
    // ada isinya = folder ini berada di dalam folder lain
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Folder', folderSchema);
