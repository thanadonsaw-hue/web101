const { create, findAll, findByUserId, updateStatus, findItemsByOrderId } = require('../models/orders')
const { getConnection } = require('../config/db')

const getAll = async (req, res, next) => {
  try {
    const orders = await findAll()
    res.json(orders)
  } catch (error) {
    next(error)
  }
}

const getByUserId = async (req, res, next) => {
  try {
    const orders = await findByUserId(req.params.userId)
    res.json(orders)
  } catch (error) {
    next(error)
  }
}

const createOrder = async (req, res, next) => {
  try {
    const result = await create(req.body)
    res.json({ message: 'บันทึกคำสั่งซื้อสำเร็จ', data: result })
  } catch (error) {
    next(error)
  }
}

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const orderId = req.params.id

    const db = await getConnection()

    const [rows] = await db.query('SELECT status FROM orders WHERE id = ?', [orderId])
    
    if (rows && rows.length > 0) {
      const currentStatus = rows[0].status

      if (status === 'cancelled' && currentStatus !== 'cancelled') {
        const items = await findItemsByOrderId(orderId)
        
        if (items && items.length > 0) {
          for (const item of items) {
            await db.query(
              'UPDATE products SET stock = stock + ? WHERE id = ?',
              [item.quantity, item.product_id]
            )
          }
        }
      }
    }

    const result = await updateStatus(orderId, status)
    res.json({ message: 'อัปเดตสถานะสำเร็จ', data: result })
  } catch (error) {
    console.error("Update Status Error:", error)
    res.status(500).json({ error: 'ไม่สามารถอัปเดตสถานะได้' })
  }
}

const getItems = async (req, res, next) => {
  try {
    const items = await findItemsByOrderId(req.params.id)
    res.json(items)
  } catch (error) {
    next(error)
  }
}

module.exports = { 
  getAll, 
  getByUserId, 
  create: createOrder, 
  updateStatus: updateOrderStatus, 
  getItems 
}