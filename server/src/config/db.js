const mysql = require('mysql2/promise')
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'webdb',
  port: parseInt(process.env.DB_PORT) || 8820,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

const getConnection = async () => {
  return pool
}

console.log('Database Connected via Docker Port 8820 (Pool)!')

module.exports = { getConnection }