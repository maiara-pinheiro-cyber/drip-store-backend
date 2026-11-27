
const router = require('express').Router();
const c = require('../controllers/productController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * tags:
 *   name: Produtos
 *   description: Operações de gerenciamento e consulta de produtos
 */

/**
 * @swagger
 * /v1/product/search:
 *   get:
 *     summary: Lista e pesquisa produtos
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: match
 *         schema:
 *           type: string
 *         description: Pesquisa por nome ou descrição
 *       - in: query
 *         name: price-range
 *         schema:
 *           type: string
 *         description: Faixa de preço no formato mínimo-máximo
 *       - in: query
 *         name: category_ids
 *         schema:
 *           type: string
 *         description: IDs das categorias separados por vírgula
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Quantidade de resultados por página
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *     responses:
 *       200:
 *         description: Lista de produtos encontrada
 *       400:
 *         description: Parâmetros inválidos
 */
router.get('/search', asyncHandler(c.search));

/**
 * @swagger
 * /v1/product/{id}:
 *   get:
 *     summary: Busca um produto pelo ID
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:id', asyncHandler(c.getById));

/**
 * @swagger
 * /v1/product:
 *   post:
 *     summary: Cadastra um produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - price_with_discount
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               price_with_discount:
 *                 type: number
 *               stock:
 *                 type: integer
 *               description:
 *                 type: string
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Produto cadastrado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/', auth, asyncHandler(c.create));

/**
 * @swagger
 * /v1/product/{id}:
 *   put:
 *     summary: Atualiza um produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       204:
 *         description: Produto atualizado
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Não autorizado
 */
router.put('/:id', auth, asyncHandler(c.update));

/**
 * @swagger
 * /v1/product/{id}:
 *   delete:
 *     summary: Exclui um produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Produto excluído
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Não autorizado
 */
router.delete('/:id', auth, asyncHandler(c.remove));

module.exports = router;
