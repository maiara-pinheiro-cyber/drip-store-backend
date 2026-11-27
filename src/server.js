require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = Number(process.env.PORT || 3000);
async function start() {
  if (!process.env.JWT_SECRET) throw new Error('Configure JWT_SECRET no arquivo .env.');
  await sequelize.authenticate();
  console.log('Conexão com MySQL estabelecida.');
  app.listen(PORT, () => console.log(`API disponível em http://localhost:${PORT}`));
}
start().catch((error) => {
  console.error('Não foi possível iniciar a API:', error.message);
  process.exit(1);
});
