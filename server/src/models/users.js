const { getConnection } = require('../config/db')

const findByUsername = async (username) => {
  const conn = await getConnection()
  const [rows] = await conn.query('SELECT * FROM users WHERE username = ?', [username])
  return rows
}

const create = async (username, password, firstname, lastname, role) => {
  const conn = await getConnection()
  const [result] = await conn.query(
    'INSERT INTO users (username, password, firstname, lastname, role) VALUES (?, ?, ?, ?, ?)',
    [username, password, firstname, lastname, role]
  )
  return result
}

const login = async (username, password) => {
  const conn = await getConnection()
  const [rows] = await conn.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password]
  )
  return rows
}

module.exports = {
  findByUsername,
  create,
  login
}