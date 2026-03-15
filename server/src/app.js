const express = require('express')
const cors = require('cors')
const path = require('path')
const errorHandler = require('./middlewares/errorHandler')

const productRoutes = require('./routes/products')
const userRoutes = require('./routes/users')
const orderRoutes = require('./routes/orders')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/', userRoutes)

app.use(errorHandler)

module.exports = app