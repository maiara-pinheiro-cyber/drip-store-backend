const { pagination, selectedFields } = require('../src/services/pagination');

describe('pagination', () => {
  test('usa os valores padrão', () => {
    expect(pagination({})).toEqual({ limit: 12, page: 1, offset: 0 });
  });
  test('calcula deslocamento da página', () => {
    expect(pagination({ limit: '10', page: '3' })).toEqual({ limit: 10, page: 3, offset: 20 });
  });
  test('permite buscar todos os registros com limit -1', () => {
    expect(pagination({ limit: '-1', page: '4' })).toEqual({ limit: -1, page: 4, offset: 0 });
  });
  test.each([{ limit: '0' }, { limit: '-2' }, { page: '0' }, { page: 'abc' }])('rejeita parâmetros inválidos: %o', (query) => {
    expect(() => pagination(query)).toThrow('Parâmetros limit/page inválidos.');
  });
});

describe('selectedFields', () => {
  const allowed = ['name', 'slug'];
  test('inclui id e remove campos repetidos', () => {
    expect(selectedFields('name,name,slug', allowed)).toEqual(['id', 'name', 'slug']);
  });
  test('retorna undefined quando não há seleção', () => {
    expect(selectedFields(undefined, allowed)).toBeUndefined();
  });
  test('rejeita campos não permitidos', () => {
    expect(() => selectedFields('password', allowed)).toThrow('Um ou mais campos solicitados não são permitidos.');
  });
});
