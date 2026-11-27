const mockFindAndCountAll = jest.fn();
const mockLiteral = jest.fn((sql) => ({ sql }));

jest.mock('../src/models', () => ({
  sequelize: { escape: (value) => `'${String(value).replace(/'/g, "''")}'`, literal: mockLiteral },
  Product: { findAndCountAll: mockFindAndCountAll },
  Category: {},
  ProductImage: {},
  ProductOption: {},
}));

const { Op } = require('sequelize');
const controller = require('../src/controllers/productController');

describe('product search option filters', () => {
  beforeEach(() => {
    mockFindAndCountAll.mockResolvedValue({ rows: [], count: 0 });
    mockLiteral.mockClear();
  });

  test('uses one options association and applies every option filter with EXISTS', async () => {
    const req = { query: { 'option[45]': 'GG,PP', 'option[46]': 'Azul' } };
    const res = { json: jest.fn((body) => body), status: jest.fn().mockReturnThis() };

    await controller.search(req, res);

    const query = mockFindAndCountAll.mock.calls[0][0];
    expect(query.include.filter((item) => item.as === 'options')).toHaveLength(1);
    expect(query.where[Op.and]).toHaveLength(2);
    expect(mockLiteral).toHaveBeenCalledTimes(2);
    expect(mockLiteral.mock.calls[0][0]).toContain("FIND_IN_SET('GG', po.values)");
    expect(mockLiteral.mock.calls[0][0]).toContain("FIND_IN_SET('PP', po.values)");
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [], total: 0 }));
  });

  test('rejects an empty option filter', async () => {
    const req = { query: { 'option[45]': ' , ' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.search(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockFindAndCountAll).not.toHaveBeenCalled();
  });
});
