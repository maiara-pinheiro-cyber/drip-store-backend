const fs = require('fs/promises');
const path = require('path');
const { Op } = require('sequelize');
const { sequelize, Product, Category, ProductImage, ProductOption } = require('../models');
const { pagination, selectedFields } = require('../services/pagination');
const slugify = require('../utils/slugify');

const publicProduct = (p) => {
  const item = p.toJSON();
  item.category_ids = (item.categories || []).map(c => c.id);
  item.images = (item.images || []).map(i => ({
    id: i.id,
    content: /^https?:\/\//i.test(i.path) ? i.path : `/uploads/${path.basename(i.path)}`
  }));
  delete item.categories;
  return item;
};
async function saveImages(product, images = [], transaction) {
  const createdFiles = [];
  for (const image of images) {
    if (!image || !image.content || !image.type) continue;
    const match = /^image\/(png|jpe?g|webp)$/i.exec(image.type);
    if (!match) throw Object.assign(new Error('Formato de imagem não permitido.'), { status: 400 });
    const base64 = image.content.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw Object.assign(new Error('Imagem base64 inválida.'), { status: 400 });
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > 5 * 1024 * 1024) throw Object.assign(new Error('Cada imagem deve ter no máximo 5 MB.'), { status: 400 });
    const ext = match[1].toLowerCase().replace('jpeg','jpg');
    const filename = `product-${product.id}-${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
    const directory = path.join(process.cwd(), 'uploads');
    await fs.mkdir(directory, { recursive: true });
    const fullPath = path.join(directory, filename);
    await fs.writeFile(fullPath, buffer);
    createdFiles.push(fullPath);
    try {
      await ProductImage.create({ product_id: product.id, path: fullPath, enabled: true }, transaction ? { transaction } : {});
    } catch (error) {
      await fs.unlink(fullPath).catch(() => {});
      throw error;
    }
  }
  return createdFiles;
}
function associations() {
  return [{ model: Category, as: 'categories', attributes: ['id'] },
          { model: ProductImage, as: 'images' }, { model: ProductOption, as: 'options' }];
}
exports.search = async (req, res) => {
  const { limit, page, offset } = pagination(req.query);
  const where = {};
  if (req.query.match) where[Op.or] = [
    { name: { [Op.like]: `%${req.query.match}%` } },
    { description: { [Op.like]: `%${req.query.match}%` } },
  ];
  if (req.query['price-range']) {
    const parts = req.query['price-range'].split('-').map(Number);
    if (parts.length !== 2 || parts.some(n => !Number.isFinite(n)) || parts[0] > parts[1]) return res.status(400).json({ message: 'price-range deve seguir o formato mínimo-máximo.' });
    where.price = { [Op.between]: parts };
  }
  const attributes = selectedFields(req.query.fields, ['enabled','name','slug','use_in_menu','stock','description','price','price_with_discount','created_at','updated_at']);
  const options = { where, include: associations(), distinct: true, limit: limit === -1 ? undefined : limit, offset, order: [['id','ASC']] };
  if (attributes) options.attributes = attributes;
  if (req.query.category_ids) {
    const ids = req.query.category_ids.split(',').map(Number);
    if (ids.some(n => !Number.isInteger(n) || n < 1)) return res.status(400).json({ message: 'category_ids inválido.' });
    options.include[0].where = { id: { [Op.in]: ids } };
    options.include[0].required = true;
  }
  
  // Cada option[ID] é aplicado com EXISTS para exigir
  // que todos os filtros informados correspondam ao produto.
  const optionFilters = [
    ...Object.entries(req.query).filter(([key]) => /^option\[\d+\]$/.test(key)),
    ...(
      req.query.option &&
      typeof req.query.option === 'object' &&
      !Array.isArray(req.query.option)
        ? Object.entries(req.query.option).map(([id, values]) => [`option[${id}]`, values])
        : []
    )
  ];

  for (const [key, rawValues] of optionFilters) {
    const optionId = Number(key.match(/^option\[(\d+)\]$/)[1]);
    const values = String(rawValues)
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);

    if (!Number.isSafeInteger(optionId) || optionId < 1 || !values.length) {
      return res.status(400).json({ message: `Filtro ${key} inválido.` });
    }

    const conditions = values
      .map(value => `FIND_IN_SET(${sequelize.escape(value)}, po.values) > 0`)
      .join(' OR ');

    where[Op.and] = [
      ...(where[Op.and] || []),
      sequelize.literal(`
        EXISTS (
          SELECT 1
          FROM product_options AS po
          WHERE po.product_id = Product.id
            AND po.id = ${optionId}
            AND (${conditions})
        )
      `)
    ];
  }


  const result = await Product.findAndCountAll(options);
  return res.json({ data: result.rows.map(publicProduct), total: result.count, limit, page });
};
exports.getById = async (req, res) => {
  const product = await Product.findByPk(req.params.id, { include: associations() });
  if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
  return res.json(publicProduct(product));
};
exports.create = async (req, res) => {
  const body = req.body;
  if (!body.name || body.price === undefined || body.price_with_discount === undefined) return res.status(400).json({ message: 'name, price e price_with_discount são obrigatórios.' });
  const transaction = await sequelize.transaction();
  try {
    const product = await Product.create({
      enabled: body.enabled ?? false, name: body.name, slug: body.slug || slugify(body.name),
      use_in_menu: body.use_in_menu ?? false, stock: body.stock ?? 0,
      description: body.description || null, price: body.price, price_with_discount: body.price_with_discount
    }, { transaction });
    if (body.category_ids) await product.setCategories(body.category_ids, { transaction });
    if (body.options) {
      for (const option of body.options) await ProductOption.create({
        product_id: product.id, title: option.title, shape: option.shape || 'square',
        radius: parseInt(option.radius, 10) || 0, type: option.type || 'text',
        values: Array.isArray(option.values) ? option.values.join(',') : option.values
      }, { transaction });
    }
    await saveImages(product, body.images || [], transaction);
    await transaction.commit();
    const created = await Product.findByPk(product.id, { include: associations() });
    return res.status(201).json(publicProduct(created));
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    throw error;
  }
};
exports.update = async (req, res) => {
  const body = req.body;
  const product = await Product.findByPk(req.params.id, { include: associations() });
  if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
  const transaction = await sequelize.transaction();
  try {
    const fields = ['enabled','name','slug','use_in_menu','stock','description','price','price_with_discount'];
    const update = {};
    for (const key of fields) if (body[key] !== undefined) update[key] = body[key];
    if (update.name && !update.slug) update.slug = slugify(update.name);
    await product.update(update, { transaction });
    if (body.category_ids) await product.setCategories(body.category_ids, { transaction });
    if (Array.isArray(body.options)) {
      for (const option of body.options) {
        if (option.id && option.deleted) await ProductOption.destroy({ where: { id: option.id, product_id: product.id }, transaction });
        else if (option.id) {
          const existing = await ProductOption.findOne({ where: { id: option.id, product_id: product.id }, transaction });
          if (existing) await existing.update({
            title: option.title ?? existing.title, shape: option.shape ?? existing.shape,
            radius: option.radius !== undefined ? (parseInt(option.radius,10) || 0) : existing.radius,
            type: option.type ?? existing.type,
            values: option.values !== undefined ? (Array.isArray(option.values) ? option.values.join(',') : option.values) : existing.values
          }, { transaction });
        } else {
          await ProductOption.create({ product_id: product.id, title: option.title, shape: option.shape || 'square',
            radius: parseInt(option.radius,10) || 0, type: option.type || 'text',
            values: Array.isArray(option.values) ? option.values.join(',') : option.values }, { transaction });
        }
      }
    }
    if (Array.isArray(body.images)) {
      for (const image of body.images) {
        if (image.id && image.deleted) await ProductImage.destroy({ where: { id: image.id, product_id: product.id }, transaction });
      }
    }
    await saveImages(product, (body.images || []).filter(i => !i.id && i.content && i.type), transaction);
    // Atualiza o endereço de imagens existentes quando o cliente envia uma URL nova.
    for (const image of (body.images || [])) {
      if (image.id && !image.deleted && typeof image.content === 'string' && /^https?:\/\//i.test(image.content)) {
        await ProductImage.update({ path: image.content }, { where: { id: image.id, product_id: product.id }, transaction });
      }
    }
    await transaction.commit();
    return res.status(204).end();
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    throw error;
  }
};
exports.remove = async (req, res) => {
  const product = await Product.findByPk(req.params.id, { include: associations() });
  if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
  await sequelize.transaction(async (transaction) => {
    await ProductImage.destroy({ where: { product_id: product.id }, transaction });
    await ProductOption.destroy({ where: { product_id: product.id }, transaction });
    await product.setCategories([], { transaction });
    await product.destroy({ transaction });
  });
  return res.status(204).end();
};
