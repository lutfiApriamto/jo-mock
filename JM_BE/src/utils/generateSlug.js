import Project from '../models/project.model.js';

const toBaseSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateUniqueSlug = async (name) => {
  const base = toBaseSlug(name);

  if (!base) throw new Error('Nama project tidak valid untuk dijadikan slug');

  let slug    = base;
  let counter = 1;

  while (await Project.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
};

