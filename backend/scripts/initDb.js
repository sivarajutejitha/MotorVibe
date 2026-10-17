/**
 * MotorVibe Database Initialization Script
 * Runs database/schema.sql and database/seed.sql against PostgreSQL.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL is not defined in backend/.env');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL database...');
    console.log(`Target Database: ${pool.options.database || 'motorvibe_db'}`);

    // 1. Read and execute schema.sql
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying database schema from schema.sql...');
    await client.query(schemaSql);
    console.log('Schema tables and indexes created successfully.');

    // 2. Check if motors table exists and has rows
    const countRes = await client.query('SELECT COUNT(*) FROM motors');
    const motorCount = parseInt(countRes.rows[0].count, 10);

    const forceSeed = process.argv.includes('--force') || process.argv.includes('--seed');

    if (motorCount === 0 || forceSeed) {
      console.log('Applying seed data from seed.sql...');
      const seedPath = path.resolve(__dirname, '../../database/seed.sql');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSql);
      console.log('Seed data inserted successfully.');
    } else {
      console.log(`Database already contains ${motorCount} motors. Applying seed to ensure latest test data...`);
      const seedPath = path.resolve(__dirname, '../../database/seed.sql');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSql);
      console.log('Seed data updated successfully.');
    }

    // Print summary
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const motorsCount = await client.query('SELECT COUNT(*) FROM motors');
    const readingsCount = await client.query('SELECT COUNT(*) FROM sensor_readings');
    const alertsCount = await client.query('SELECT COUNT(*) FROM alerts');
    const maintenanceCount = await client.query('SELECT COUNT(*) FROM maintenance_records');
    const activityCount = await client.query('SELECT COUNT(*) FROM activity_logs');

    console.log('\n================ MOTORVIBE DATABASE READY ================');
    console.log(` Users:               ${usersCount.rows[0].count}`);
    console.log(` Industrial Motors:   ${motorsCount.rows[0].count}`);
    console.log(` Telemetry Readings:  ${readingsCount.rows[0].count}`);
    console.log(` Active/Total Alerts: ${alertsCount.rows[0].count}`);
    console.log(` Maintenance Logs:    ${maintenanceCount.rows[0].count}`);
    console.log(` Activity Audit Logs: ${activityCount.rows[0].count}`);
    console.log('==========================================================\n');

  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase();
