const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.create = async (req, res) => {
  const { firstname, surname, email, password, confirmPassword } = req.body;
  if (!firstname || !surname || !email || !password || password !== confirmPassword) {
    return res.status(400).json({ message: 'Informe nome, sobrenome, e-mail e senha; a confirmação deve ser igual à senha.' });
  }
  if (await User.unscoped().findOne({ where: { email } })) return res.status(400).json({ message: 'E-mail já cadastrado.' });
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ firstname, surname, email, password: hash });
  return res.status(201).json({ id: user.id, firstname: user.firstname, surname: user.surname, email: user.email });
};
exports.getById = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
  return res.json(user);
};
exports.update = async (req, res) => {
  const user = await User.unscoped().findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
  const { firstname, surname, email } = req.body;
  if (!firstname || !surname || !email) return res.status(400).json({ message: 'firstname, surname e email são obrigatórios.' });
  await user.update({ firstname, surname, email });
  return res.status(204).end();
};
exports.remove = async (req, res) => {
  const user = await User.unscoped().findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
  await user.destroy(); return res.status(204).end();
};
exports.token = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  // A consulta sem escopo garante que o hash esteja disponível para bcrypt.compare.
  const user = await User.unscoped().findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: 'Credenciais inválidas.' });
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET não configurada.');
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
  return res.json({ token });
};
