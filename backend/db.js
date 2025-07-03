const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ví dụ: postgres://user:pass@localhost:5432/garage
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
