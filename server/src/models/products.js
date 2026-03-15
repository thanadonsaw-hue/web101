const { getConnection } = require('../config/db')

const findAll = async () => {
  const conn = await getConnection()
  const [rows] = await conn.query('SELECT * FROM products')
  return rows
}

const findById = async (id) => {
  const conn = await getConnection()
  const [rows] = await conn.query('SELECT * FROM products WHERE id = ?', [id])
  return rows[0]
}

const create = async (data) => {
  const { name, price, stock, image_url } = data
  const conn = await getConnection()
  const [result] = await conn.query(
    'INSERT INTO products (name, price, stock, image_url) VALUES (?, ?, ?, ?)',
    [name, price, stock, image_url]
  )
  return result
}

const update = async (id, data) => {
  const conn = await getConnection()
  if (data.image_url) {
    const [result] = await conn.query(
      'UPDATE products SET name = ?, price = ?, stock = ?, image_url = ? WHERE id = ?',
      [data.name, data.price, data.stock, data.image_url, id]
    )
    return result
  } else {
    const [result] = await conn.query(
      'UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?',
      [data.name, data.price, data.stock, id]
    )
    return result
  }
}

const remove = async (id) => {
  const conn = await getConnection()
  const [result] = await conn.query('DELETE FROM products WHERE id = ?', [id])
  return result
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
}