const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'voice_crm_mvp',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Test connection and handle errors gracefully
pool.on('error', (err) => {
  console.warn('Database connection error:', err.message);
});

// Test initial connection
pool.connect((err, client, release) => {
  if (err) {
    console.warn('Failed to connect to database:', err.message);
    console.warn('App will run in demo mode without database persistence');
  } else {
    console.log('Database connected successfully');
    release();
  }
});

module.exports = pool;