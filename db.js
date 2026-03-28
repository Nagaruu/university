const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'justatee'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_DATABASE || 'university_db'}`;

// Tự động bật SSL nếu không phải là localhost (kết nối từ xa tới Render)
const useSSL = isProduction || (connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1'));

const pool = new Pool({
  connectionString: connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
