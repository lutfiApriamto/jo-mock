// Kuota PM = 1 per project (bukan owner, tapi bisa diisi 1 member aktif).
// Validasi kuota dilakukan di service, bukan di schema.
export const inviteMemberSchema = {
  type: 'object',
  required: ['userId', 'role'],
  properties: {
    userId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
    role:   { type: 'string', enum: ['PM', 'FE', 'BE'] },
  },
  additionalProperties: false,
};

// Role member bisa diubah ke PM, FE, atau BE.
// Jika promote ke PM: auto-demote PM lama menjadi FE (dilakukan di service).
export const updateMemberSchema = {
  type: 'object',
  required: ['role'],
  properties: {
    role: { type: 'string', enum: ['PM', 'FE', 'BE'] },
  },
  additionalProperties: false,
};

export const transferOwnershipSchema = {
  type: 'object',
  required: ['userId'],
  properties: {
    userId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
  },
  additionalProperties: false,
};

// Keluar dari project. newOwnerId hanya wajib jika yang keluar adalah owner —
// owner harus transfer kepemilikan ke member lain dulu sebelum bisa keluar.
export const leaveProjectSchema = {
  type: 'object',
  properties: {
    newOwnerId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
  },
  additionalProperties: false,
};
