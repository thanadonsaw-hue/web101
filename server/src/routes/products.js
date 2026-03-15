const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const productController = require('../controllers/products')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

router.get('/', productController.getAll)
router.get('/:id', productController.getById)
router.post('/', upload.single('image'), productController.create)
router.put('/:id', upload.single('image'), productController.update)
router.delete('/:id', productController.remove)

module.exports = router