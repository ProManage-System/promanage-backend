const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'tu_password',
  database: process.env.DB_NAME || 'tu_db_name',
  port: process.env.DB_PORT || 5432,
});

pool.query('SELECT NOW()')
  .then(() => console.log("✅ Conexión a PostgreSQL exitosa"))
  .catch(err => console.error("❌ Error conectando a PostgreSQL:", err.message));

module.exports = pool;