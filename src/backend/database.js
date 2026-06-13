// Database Connection
const { Pool } = require('pg');
const logger = require('./logger');

let pool;

const connectDatabase = () => {
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'humans',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  pool.on('connect', () => {
    logger.info('Database connected successfully');
  });

  pool.on('error', (err) => {
    logger.error('Unexpected error on idle database client', { error: err });
    process.exit(-1);
  });

  return pool;
};

const getClient = async () => {
  const client = await pool.connect();
  return client;
};

const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    logger.error('Query error', { text, error: err.message });
    throw err;
  }
};

module.exports = {
  connectDatabase,
  getClient,
  query
};