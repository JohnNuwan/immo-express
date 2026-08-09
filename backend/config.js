require('dotenv').config();

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is missing in production environment!');
}

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 8000,
  JWT_SECRET: process.env.JWT_SECRET || 'immo-express-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  DB_PATH: process.env.DB_PATH || './immo_express.db',
};