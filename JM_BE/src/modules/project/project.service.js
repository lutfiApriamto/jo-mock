import Project         from '../../models/project.model.js';
import Folder          from '../../models/folder.model.js';
import Endpoint        from '../../models/endpoint.model.js';
import Response        from '../../models/response.model.js';
import Toggle          from '../../models/toggle.model.js';
import ChangeRequest   from '../../models/changeRequest.model.js';
import ContractVersion from '../../models/contractVersion.model.js';
import Invitation      from '../../models/invitation.model.js';
import { generateUniqueSlug }                    from '../../utils/generateSlug.js';
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';

export const createProject = async ({ name, userId }) => {
  const slug    = await generateUniqueSlug(name);
  const project = await Project.create({
    name,
    slug,
    ownerId:         userId,
    members:         [],
    contractVersion: 1,
  });
  return project;
};

export const listProjects = async ({ userId, query }) => {
  const { page, limit, skip } = getPaginationParams(query);

  const filter = {
    $or: [
      { ownerId: userId },
      { 'members.userId': userId },
    ],
  };

  const [rawProjects, total] = await Promise.all([
    Project.find(filter)
      .select('name slug contractVersion ownerId members createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(filter),
  ]);

  // Hitung role user di setiap project — owner selalu PM, member ambil dari array
  const projects = rawProjects.map(({ members, ownerId, ...rest }) => {
    const isOwner = ownerId.toString() === userId.toString();
    const myRole  = isOwner
      ? 'PM'
      : members.find((m) => m.userId.toString() === userId.toString())?.role ?? null;

    return { ...rest, ownerId, myRole };
  });

  return { projects, meta: buildPaginationMeta(total, page, limit) };
};

export const getProjectDetail = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate('ownerId', 'name email avatar')
    .populate('members.userId', 'name email avatar');

  if (!project) {
    const err = new Error('Project tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  return project;
};

export const updateProject = async (projectId, { name }) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { name },
    { new: true, runValidators: true }
  );

  if (!project) {
    const err = new Error('Project tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  return project;
};

// Cari project milik user (sebagai owner atau member) berdasarkan nama.
export const searchProjects = async ({ userId, q }) => {
  if (!q || q.trim().length < 2) {
    const err = new Error('Kata kunci pencarian minimal 2 karakter');
    err.statusCode = 400;
    throw err;
  }

  const regex  = new RegExp(q.trim(), 'i');
  const filter = {
    $and: [
      { name: regex },
      { $or: [{ ownerId: userId }, { 'members.userId': userId }] },
    ],
  };

  const rawProjects = await Project.find(filter)
    .select('name slug contractVersion ownerId members createdAt')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return rawProjects.map(({ members, ownerId, ...rest }) => {
    const isOwner = ownerId.toString() === userId.toString();
    const myRole  = isOwner
      ? 'PM'
      : members.find((m) => m.userId.toString() === userId.toString())?.role ?? null;

    return { ...rest, ownerId, myRole };
  });
};

export const deleteProject = async (projectId) => {
  const project = await Project.findById(projectId).select('_id').lean();

  if (!project) {
    const err = new Error('Project tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const endpoints   = await Endpoint.find({ projectId }).select('_id').lean();
  const endpointIds = endpoints.map((e) => e._id);

  await Promise.all([
    Folder.deleteMany({ projectId }),
    Endpoint.deleteMany({ projectId }),
    Response.deleteMany({ endpointId: { $in: endpointIds } }),
    Toggle.deleteMany({ endpointId: { $in: endpointIds } }),
    ChangeRequest.deleteMany({ projectId }),
    ContractVersion.deleteMany({ projectId }),
    Invitation.deleteMany({ projectId }),
  ]);

  await Project.findByIdAndDelete(projectId);
};

