const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://tarantul_admin_db_1nd8_user:VzivR432aXblPYWxyTyW02Wxs06UBbFK@dpg-d0h2baq4d50c738cnttg-a.oregon-postgres.render.com/tarantul_admin_db_1nd8',
  ssl: { rejectUnauthorized: false }
});

// Function to generate unique 10-digit ID
async function generateUniqueId() {
  while (true) {
    const id = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const result = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return id;
    }
  }
}

// Initialize database schema
async function initDb() {
  try {
    // Create users table with unique ID
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(10) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin_access table to store admin panel access code
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_access (
        id SERIAL PRIMARY KEY,
        access_code VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin access code if not exists
    const adminCodeResult = await pool.query('SELECT * FROM admin_access LIMIT 1');
    if (adminCodeResult.rows.length === 0) {
      const defaultCode = 'admin123'; // You should change this to a more secure code
      await pool.query('INSERT INTO admin_access (access_code) VALUES ($1)', [defaultCode]);
    }

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

// Initialize database on startup
initDb().catch(console.error);

module.exports = {
  pool,
  generateUniqueId
}; 
