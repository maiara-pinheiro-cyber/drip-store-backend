module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ message: 'Já existe um registro com esses dados.' });
  if (err.name === 'SequelizeValidationError' || err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Dados inválidos.', errors: err.errors?.map(e => e.message) || [err.message] });
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') return res.status(400).json({ message: 'Referência inválida: verifique os IDs relacionados.' });
  console.error(err);
  return res.status(err.status || 500).json({ message: err.status ? err.message : 'Erro interno do servidor.' });
};
