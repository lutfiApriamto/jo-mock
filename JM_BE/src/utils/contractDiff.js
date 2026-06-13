const CHANGE_TYPES = {
  ENDPOINT_ADDED:    'endpoint_added',
  ENDPOINT_DELETED:  'endpoint_deleted',
  ENDPOINT_MODIFIED: 'endpoint_modified',
  RESPONSE_ADDED:    'response_added',
  RESPONSE_MODIFIED: 'response_modified',
  RESPONSE_DELETED:  'response_deleted',
  SCHEMA_MODIFIED:   'schema_modified',
};

export const createDiff = (type, payload) => {
  const templates = {
    [CHANGE_TYPES.ENDPOINT_ADDED]: () => ({
      type,
      summary: `Endpoint baru ditambahkan: ${payload.method} ${payload.path}`,
      detail: payload,
    }),
    [CHANGE_TYPES.ENDPOINT_DELETED]: () => ({
      type,
      summary: `Endpoint dihapus: ${payload.method} ${payload.path}`,
      detail: payload,
    }),
    [CHANGE_TYPES.ENDPOINT_MODIFIED]: () => ({
      type,
      summary: `Endpoint diubah: ${payload.method} ${payload.path}`,
      changes: payload.changes,
    }),
    [CHANGE_TYPES.RESPONSE_ADDED]: () => ({
      type,
      summary: `Response ${payload.statusCode} ditambahkan pada ${payload.method} ${payload.path}`,
      detail: payload,
    }),
    [CHANGE_TYPES.RESPONSE_MODIFIED]: () => ({
      type,
      summary: `Response ${payload.statusCode} diubah pada ${payload.method} ${payload.path}`,
      changes: payload.changes,
    }),
    [CHANGE_TYPES.RESPONSE_DELETED]: () => ({
      type,
      summary: `Response ${payload.statusCode} dihapus dari ${payload.method} ${payload.path}`,
      detail: payload,
    }),
    [CHANGE_TYPES.SCHEMA_MODIFIED]: () => ({
      type,
      summary: `Request schema diubah pada ${payload.method} ${payload.path}`,
      changes: payload.changes,
    }),
  };

  const builder = templates[type];
  if (!builder) {
    return { type: 'unknown', summary: 'Perubahan tidak diketahui', detail: payload };
  }

  return builder();
};

export const formatDiffForEmail = (diffs) => {
  const list = Array.isArray(diffs) ? diffs : [diffs];
  return list.map((d) => `• ${d.summary}`).join('\n');
};

export { CHANGE_TYPES };
