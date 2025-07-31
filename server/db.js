const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // For Azure SQL Database
    trustServerCertificate: true // Change to false for production
  }
};

let pool;

async function getConnection() {
  try {
    if (pool && pool.connected) {
      return pool;
    }
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Database connected successfully!');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}

module.exports = {
  getConnection,
  sql
};
