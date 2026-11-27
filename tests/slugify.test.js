const slugify = require('../src/utils/slugify');

describe('slugify', () => {
  test('converte texto com acentos em slug', () => {
    expect(slugify('Tênis de Corrida')).toBe('tenis-de-corrida');
  });
  test('remove hífens duplicados e das pontas', () => {
    expect(slugify('  Camiseta   Básica!  ')).toBe('camiseta-basica');
  });
});
