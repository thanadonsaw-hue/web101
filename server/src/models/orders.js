const { getConnection } = require('../config/db')

const create = async (data) => {
  const { userId, cartItems, totalPrice } = data
  const pool = await getConnection()
  const conn = await pool.getConnection()
  
  try {
    await conn.beginTransaction()
    
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
      [userId, totalPrice]
    )
    const orderId = orderResult.insertId

    for (const item of cartItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      )
      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      )
    }

    await conn.commit()
    return orderId
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

const findByUserId = async (userId) => {
  const conn = await getConnection()
  const [rows] = await conn.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  )
  return rows
}

const findAll = async () => {
  const conn = await getConnection()
  const [rows] = await conn.query(
    'SELECT orders.*, users.username FROM orders JOIN users ON orders.user_id = users.id ORDER BY orders.created_at DESC'
  )
  return rows
}

const updateStatus = async (orderId, status) => {
  const conn = await getConnection()
  const [result] = await conn.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, orderId]
  )
  return result
}

const findItemsByOrderId = async (orderId) => {
  const conn = await getConnection()
  const [rows] = await conn.query(
    'SELECT order_items.*, products.name, products.image_url FROM order_items LEFT JOIN products ON order_items.product_id = products.id WHERE order_items.order_id = ?',
    [orderId]
  )
  return rows
}

module.exports = {
  create,
  findByUserId,
  findAll,
  updateStatus,
  findItemsByOrderId
}