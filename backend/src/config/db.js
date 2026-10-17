/**
 * PostgreSQL Database Connection Pool
 * Uses 'pg' Pool with parameterized query support to prevent SQL injection.
 * Course Outcome: CO-6 (Databases and Deployment)
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Max concurrent clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]: Unexpected error on idle client', err.message);
});

/**
 * Execute a parameterized SQL query
 * @param {string} text - SQL statement with placeholders ($1, $2, etc.)
 * @param {Array} params - Array of parameter values
 * @returns {Promise<pg.QueryResult>}
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 500) {
      console.warn(`[Slow Query] ${duration}ms: ${text.substring(0, 100)}`);
    }
    return res;
  } catch (error) {
    console.error(`[DB Query Error] Query: ${text} | Params: ${JSON.stringify(params)} | Message: ${error.message}`);
    throw error;
  }
}

/**
 * Test the database connection during server startup
 */
async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log(`[PostgreSQL Connected]: Database "${res.rows[0].db_name}" ready at ${res.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error('[PostgreSQL Connection Failed]:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  query,
  testConnection,
};
