const { Sequelize } = require('sequelize');

const required = ['DB_NAME', 'DB_USER', 'DB_HOST'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Variável ${key} não definida no .env`);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? false : false,
    define: { underscored: true, timestamps: true },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  }
);

module.exports = sequelize;
