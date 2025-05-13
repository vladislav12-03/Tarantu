const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://tarantul_admin_db_1nd8_user:VzivR432aXblPYWxyTyW02Wxs06UBbFK@dpg-d0h2baq4d50c738cnttg-a.oregon-postgres.render.com/tarantul_admin_db_1nd8',
  ssl: { rejectUnauthorized: false }
});

module.exports = pool; 