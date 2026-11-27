const jwt = require('jsonwebtoken');
const auth = require('../src/middleware/auth');

function response() {
  return { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

describe('middleware de autenticação', () => {
  beforeEach(() => { process.env.JWT_SECRET = 'test-secret-for-jest'; });
  test('rejeita requisição sem Bearer token', () => {
    const res = response();
    const next = jest.fn();
    auth({ headers: {} }, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
  test('aceita token válido e preenche req.auth', () => {
    const token = jwt.sign({ id: 7 }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    auth(req, response(), next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.auth.id).toBe(7);
  });
  test('rejeita token inválido', () => {
    const res = response();
    const next = jest.fn();
    auth({ headers: { authorization: 'Bearer token-invalido' } }, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});
