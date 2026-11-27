
const router = require('express').Router();
const c = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Operações de gerenciamento e consulta de categorias
 */

/**
 * @swagger
 * /v1/category/search:
 *   get:
 *     summary: Lista e pesquisa categorias
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorias encontrada
 *       400:
 *         description: Parâmetros inválidos
 */
router.get('/search', asyncHandler(c.search));

/**
 * @swagger
 * /v1/category/{id}:
 *   get:
 *     summary: Busca uma categoria pelo ID
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *       404:
 *         description: Categoria não encontrada
 */
router.get('/:id', asyncHandler(c.getById));

/**
 * @swagger
 * /v1/category:
 *   post:
 *     summary: Cadastra uma categoria
 *     tags: [Categorias]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Roupas
 *               slug:
 *                 type: string
 *                 example: roupas
 *               use_in_menu:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Categoria cadastrada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/', auth, asyncHandler(c.create));

/**
 * @swagger
 * /v1/category/{id}:
 *   put:
 *     summary: Atualiza uma categoria
 *     tags: [Categorias]
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
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               use_in_menu:
 *                 type: boolean
 *     responses:
 *       204:
 *         description: Categoria atualizada
 *       404:
 *         description: Categoria não encontrada
 *       401:
 *         description: Não autorizado
 */
router.put('/:id', auth, asyncHandler(c.update));

/**
 * @swagger
 * /v1/category/{id}:
 *   delete:
 *     summary: Exclui uma categoria
 *     tags: [Categorias]
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
 *         description: Categoria excluída
 *       404:
 *         description: Categoria não encontrada
 *       401:
 *         description: Não autorizado
 */
router.delete('/:id', auth, asyncHandler(c.remove));

module.exports = router;

