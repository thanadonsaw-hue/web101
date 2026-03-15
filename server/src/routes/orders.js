const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orders')

router.post('/', orderController.create)
router.get('/admin/all', orderController.getAll) 
router.put('/:id/status', orderController.updateStatus)
router.get('/:id/items', orderController.getItems)
router.get('/:userId', orderController.getByUserId) 

module.exports = router