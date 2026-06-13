import asyncHandler       from '../../utils/asyncHandler.js';
import { sendSuccess }    from '../../utils/apiResponse.js';
import * as projectService from './project.service.js';

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject({
    name:   req.body.name,
    userId: req.user._id,
  });
  sendSuccess(res, project, 'Project berhasil dibuat', 201);
});

export const listProjects = asyncHandler(async (req, res) => {
  const { projects, meta } = await projectService.listProjects({
    userId: req.user._id,
    query:  req.query,
  });
  sendSuccess(res, projects, 'Daftar project berhasil diambil', 200, meta);
});

export const getProjectDetail = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectDetail(req.params.projectId);
  sendSuccess(res, project, 'Detail project berhasil diambil');
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.projectId, req.body);
  sendSuccess(res, project, 'Project berhasil diperbarui');
});

export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.projectId);
  sendSuccess(res, null, 'Project berhasil dihapus');
});

// Cari project milik user berdasarkan nama.
// GET /api/projects/search?q=keyword
export const searchProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.searchProjects({ userId: req.user._id, q: req.query.q });
  sendSuccess(res, projects, `Ditemukan ${projects.length} project yang sesuai`);
});

