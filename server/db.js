// server/db.js

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'vehicle_management',
  password: '190902',
  port: 5432,
});

module.exports = pool;
