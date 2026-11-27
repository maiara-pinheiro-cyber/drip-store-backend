function pagination(query) {
  const limit = query.limit === '-1' ? -1 : Number(query.limit || 12);
  const page = Number(query.page || 1);
  if (!Number.isInteger(limit) || (limit !== -1 && limit < 1) || !Number.isInteger(page) || page < 1) {
    const error = new Error('Parâmetros limit/page inválidos.'); error.status = 400; throw error;
  }
  return { limit, page, offset: limit === -1 ? 0 : (page - 1) * limit };
}
function selectedFields(fields, allowed) {
  if (!fields) return undefined;
  const requested = fields.split(',').map(v => v.trim()).filter(Boolean);
  if (requested.some(f => !allowed.includes(f))) {
    const error = new Error('Um ou mais campos solicitados não são permitidos.'); error.status = 400; throw error;
  }
  return [...new Set(['id', ...requested])];
}
module.exports = { pagination, selectedFields };
