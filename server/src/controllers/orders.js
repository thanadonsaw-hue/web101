const { create, findAll, findByUserId, updateStatus, findItemsByOrderId } = require('../models/orders')

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
    const result = await updateStatus(req.params.id, status)
    res.json({ message: 'อัปเดตสถานะสำเร็จ', data: result })
  } catch (error) {
    next(error)
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