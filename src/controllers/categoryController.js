const { Op } = require('sequelize');
const { Category } = require('../models');
const { pagination, selectedFields } = require('../services/pagination');
const slugify = require('../utils/slugify');

exports.search = async (req, res) => {
  const { limit, page, offset } = pagination(req.query);
  const where = {};
  if (req.query.use_in_menu !== undefined) {
    if (!['true', 'false'].includes(req.query.use_in_menu)) return res.status(400).json({ message: 'use_in_menu deve ser true ou false.' });
    where.use_in_menu = req.query.use_in_menu === 'true';
  }
  const attributes = selectedFields(req.query.fields, ['name','slug','use_in_menu','created_at','updated_at']);
  const result = await Category.findAndCountAll({ where, attributes, limit: limit === -1 ? undefined : limit, offset, order: [['id','ASC']] });
  return res.json({ data: result.rows, total: result.count, limit, page });
};
exports.getById = async (req, res) => {
  const item = await Category.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Categoria não encontrada.' });
  return res.json(item);
};
exports.create = async (req, res) => {
  const { name, slug, use_in_menu = false } = req.body;
  if (!name) return res.status(400).json({ message: 'name é obrigatório.' });
  const item = await Category.create({ name, slug: slug || slugify(name), use_in_menu });
  return res.status(201).json(item);
};
exports.update = async (req, res) => {
  const item = await Category.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Categoria não encontrada.' });
  const { name, slug, use_in_menu } = req.body;
  if (!name) return res.status(400).json({ message: 'name é obrigatório.' });
  await item.update({ name, slug: slug || slugify(name), use_in_menu: use_in_menu ?? item.use_in_menu });
  return res.status(204).end();
};
exports.remove = async (req, res) => {
  const item = await Category.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'Categoria não encontrada.' });
  await item.destroy(); return res.status(204).end();
};
