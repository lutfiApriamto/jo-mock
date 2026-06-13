import Folder   from '../../models/folder.model.js';
import Endpoint from '../../models/endpoint.model.js';
import Response from '../../models/response.model.js';
import Toggle   from '../../models/toggle.model.js';

// BFS: kumpulkan ID folder root beserta seluruh turunannya.
// Dipakai sebelum cascade delete agar semua subfolder ikut terhapus,
// bukan hanya folder langsung yang diminta.
const collectFolderIds = async (rootId) => {
  const ids   = [rootId];
  const queue = [rootId];

  while (queue.length > 0) {
    const current  = queue.shift();
    const children = await Folder.find({ parentId: current }).select('_id').lean();
    for (const { _id } of children) {
      ids.push(_id);
      queue.push(_id);
    }
  }

  return ids;
};

// Return semua folder project sebagai flat array berurutan createdAt asc.
// FE yang menyusun tree dari field parentId.
export const listFolders = async (project) => {
  return Folder.find({ projectId: project._id })
    .select('name parentId createdAt updatedAt')
    .sort({ createdAt: 1 })
    .lean();
};

// Buat folder baru di dalam project.
// Jika parentId dikirim, validasi bahwa parent benar-benar milik project ini —
// mencegah referensi silang antar project.
export const createFolder = async (project, { name, parentId }) => {
  if (parentId) {
    const parent = await Folder.findOne({ _id: parentId, projectId: project._id });
    if (!parent) {
      const err = new Error('Folder induk tidak ditemukan dalam project ini');
      err.statusCode = 404;
      throw err;
    }
  }

  return Folder.create({
    projectId: project._id,
    parentId:  parentId || null,
    name,
  });
};

// Ganti nama folder. Validasi kepemilikan (projectId) dilakukan langsung di query
// sehingga tidak mungkin rename folder milik project lain meski folderId benar.
export const renameFolder = async (project, folderId, { name }) => {
  const folder = await Folder.findOneAndUpdate(
    { _id: folderId, projectId: project._id },
    { name },
    { new: true, runValidators: true }
  );

  if (!folder) {
    const err = new Error('Folder tidak ditemukan dalam project ini');
    err.statusCode = 404;
    throw err;
  }

  return folder;
};

// Cari folder dalam project berdasarkan nama.
export const searchFolders = async (project, q) => {
  if (!q || q.trim().length < 2) {
    const err = new Error('Kata kunci pencarian minimal 2 karakter');
    err.statusCode = 400;
    throw err;
  }

  const regex = new RegExp(q.trim(), 'i');

  return Folder.find({ projectId: project._id, name: regex })
    .select('name parentId createdAt updatedAt')
    .sort({ createdAt: 1 })
    .limit(30)
    .lean();
};

// Hapus folder beserta seluruh kontennya secara rekursif (cascade delete).
// Urutan: kumpulkan semua folder ID (BFS) → cari semua endpoint di dalamnya
// → hapus Response + Toggle + Endpoint + Folder dalam satu Promise.all.
export const deleteFolder = async (project, folderId) => {
  const folder = await Folder.findOne({ _id: folderId, projectId: project._id });

  if (!folder) {
    const err = new Error('Folder tidak ditemukan dalam project ini');
    err.statusCode = 404;
    throw err;
  }

  const folderIds   = await collectFolderIds(folderId);
  const endpoints   = await Endpoint.find({ folderId: { $in: folderIds } }).select('_id').lean();
  const endpointIds = endpoints.map((e) => e._id);

  await Promise.all([
    Response.deleteMany({ endpointId: { $in: endpointIds } }),
    Toggle.deleteMany({ endpointId: { $in: endpointIds } }),
    Endpoint.deleteMany({ folderId: { $in: folderIds } }),
    Folder.deleteMany({ _id: { $in: folderIds } }),
  ]);
};
