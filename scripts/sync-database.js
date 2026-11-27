require('dotenv').config();
const { sequelize } = require('../src/models');
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Tabelas sincronizadas com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('Falha ao sincronizar banco:', error.message);
    process.exit(1);
  }
})();
