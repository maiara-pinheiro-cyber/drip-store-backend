process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test_user';
process.env.DB_HOST = '127.0.0.1';
process.env.JWT_SECRET = 'test-secret-for-jest';

jest.mock('../src/models', () => ({ User: { unscoped: jest.fn() } }));
jest.mock('bcryptjs', () => ({ compare: jest.fn() }));

const { User } = require('../src/models');
const bcrypt = require('bcryptjs');
const controller = require('../src/controllers/userController');

function response() {
  return { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

describe('POST /v1/user/token controller', () => {
  beforeEach(() => jest.clearAllMocks());
  test('retorna 400 quando faltam credenciais', async () => {
    const res = response();
    await controller.token({ body: {} }, res);
    expect(res.statusCode).toBe(400);
  });
  test('consulta usuário sem escopo para recuperar hash e gera token', async () => {
    const user = { id: 4, email: 'teste@email.com', password: '$2a$hash' };
    const findOne = jest.fn().mockResolvedValue(user);
    User.unscoped.mockReturnValue({ findOne });
    bcrypt.compare.mockResolvedValue(true);
    const res = response();
    await controller.token({ body: { email: user.email, password: 'senha' } }, res);
    expect(User.unscoped).toHaveBeenCalled();
    expect(findOne).toHaveBeenCalledWith({ where: { email: user.email } });
    expect(res.statusCode).toBe(200);
    expect(typeof res.body.token).toBe('string');
  });
  test('retorna 400 para senha não correspondente', async () => {
    User.unscoped.mockReturnValue({ findOne: jest.fn().mockResolvedValue({ email: 'teste@email.com', password: 'hash' }) });
    bcrypt.compare.mockResolvedValue(false);
    const res = response();
    await controller.token({ body: { email: 'teste@email.com', password: 'errada' } }, res);
    expect(res.statusCode).toBe(400);
  });
});
