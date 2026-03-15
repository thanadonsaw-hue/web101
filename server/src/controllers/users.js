const User = require('../models/users')

const register = async (req, res, next) => {
  const { username, password, firstname, lastname } = req.body
  try {
    const exists = await User.findByUsername(username)
    if (exists.length > 0) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' })
    }

    await User.create(username, password, firstname, lastname, 'user')
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  const { username, password } = req.body
  try {
    const users = await User.login(username, password)
    if (users.length > 0) {
      res.json({ user: users[0] })
    } else {
      res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
    }
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login }