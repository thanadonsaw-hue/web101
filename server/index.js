const express = require('express')
const bodyparser = require('body-parser')
const mysql = require('mysql2/promise')
const cors = require('cors')
const app = express()

app.use(bodyparser.json())
app.use(cors())

const port = 8000

let conn = null

const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'webdb',
    port: 8820
  })
}

// ===================================================
// USERS
// ===================================================

const validateUser = (userData) => {
  let errors = []
  if (!userData.firstname) errors.push('กรุณากรอกชื่อ')
  if (!userData.lastname) errors.push('กรุณากรอกนามสกุล')
  if (!userData.age) errors.push('กรุณากรอกอายุ')
  if (!userData.gender) errors.push('กรุณาเลือกเพศ')
  if (!userData.interests) errors.push('กรุณาเลือกความสนใจ')
  if (!userData.description) errors.push('กรุณากรอกคำอธิบาย')
  return errors
}

// GET /users — ดึงผู้ใช้ทั้งหมด
app.get('/users', async (req, res) => {
  try {
    const results = await conn.query('SELECT * FROM users')
    res.json(results[0])
  } catch (error) {
    res.status(500).json({ message: 'something wrong', errorMessage: error.message })
  }
})

// POST /users — สร้างผู้ใช้ใหม่
app.post('/users', async (req, res) => {
  try {
    const user = req.body
    const errors = validateUser(user)
    if (errors.length > 0) throw { message: 'กรอกข้อมูลไม่ครบ', errors }

    const { firstname, lastname, age, gender, interests, description } = user
    const results = await conn.query(
      'INSERT INTO users (firstname, lastname, age, gender, interests, description) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, lastname, age, gender, interests, description]
    )
    res.json({ message: 'insert ok', data: results[0] })
  } catch (error) {
    res.status(500).json({ message: error.message || 'something wrong', errors: error.errors || [] })
  }
})

// GET /users/:id — ดึงผู้ใช้รายคน
app.get('/users/:id', async (req, res) => {
  try {
    const results = await conn.query('SELECT * FROM users WHERE id = ?', [req.params.id])
    if (results[0].length === 0) throw { statusCode: 404, message: 'หาไม่เจอ' }
    res.json(results[0][0])
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'something wrong' })
  }
})

// PUT /users/:id — แก้ไขผู้ใช้
app.put('/users/:id', async (req, res) => {
  try {
    const { firstname, lastname, age, gender, interests, description } = req.body
    const results = await conn.query(
      'UPDATE users SET firstname=?, lastname=?, age=?, gender=?, interests=?, description=? WHERE id=?',
      [firstname, lastname, age, gender, interests, description, req.params.id]
    )
    res.json({ message: 'update ok', data: results[0] })
  } catch (error) {
    res.status(500).json({ message: 'something wrong', errorMessage: error.message })
  }
})

// DELETE /users/:id — ลบผู้ใช้
app.delete('/users/:id', async (req, res) => {
  try {
    const results = await conn.query('DELETE FROM users WHERE id = ?', [parseInt(req.params.id)])
    res.json({ message: 'delete ok', data: results[0] })
  } catch (error) {
    res.status(500).json({ message: 'something wrong', errorMessage: error.message })
  }
})

// ===================================================
// PROJECTS
// ===================================================

// GET /projects — ดึงทุก project พร้อมชื่อเจ้าของ (JOIN users)
app.get('/projects', async (req, res) => {
  try {
    const results = await conn.query(`
      SELECT projects.*, users.firstname, users.lastname
      FROM projects
      JOIN users ON projects.user_id = users.id
      ORDER BY projects.created_at DESC
    `)
    res.json(results[0])
  } catch (error) {
    res.status(500).json({ message: 'something wrong', errorMessage: error.message })
  }
})

// GET /projects/:id — ดึง project + tasks ทั้งหมดใน project (JOIN tasks, users)
app.get('/projects/:id', async (req, res) => {
  try {
    const [projects] = await conn.query(`
      SELECT projects.*, users.firstname, users.lastname
      FROM projects
      JOIN users ON projects.user_id = users.id
      WHERE projects.id = ?
    `, [req.params.id])

    if (projects.length === 0) throw { statusCode: 404, message: 'ไม่พบ project' }

    const [tasks] = await conn.query(`
      SELECT tasks.*, users.firstname AS assigned_firstname, users.lastname AS assigned_lastname
      FROM tasks
      LEFT JOIN users ON tasks.assigned_user_id = users.id
      WHERE tasks.project_id = ?
      ORDER BY tasks.created_at DESC
    `, [req.params.id])

    res.json({ ...projects[0], tasks })
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'something wrong' })
  }
})

// POST /projects — สร้าง project ใหม่
app.post('/projects', async (req, res) => {
  try {
    const { name, description, user_id } = req.body
    if (!name) throw { message: 'กรุณากรอกชื่อ project', errors: ['กรุณากรอกชื่อ project'] }
    if (!user_id) throw { message: 'กรุณาระบุ user_id', errors: ['กรุณาระบุ user_id'] }

    const results = await conn.query(
      'INSERT INTO projects (name, description, user_id) VALUES (?, ?, ?)',
      [name, description || '', user_id]
    )
    res.json({ message: 'insert ok', data: results[0] })
  } catch (error) {
    res.status(500).json({ message: error.message || 'something wrong', errors: error.errors || [] })
  }
})

// PUT /projects/:id — แก้ไข project
app.put('/projects/:id', async (req, res) => {
  try {
    const { name, description } = req.body
    const results = await conn.query(
      'UPDATE projects SET name=?, description=? WHERE id=?',
      [name, description, req.params.id]
    )
    res.json({ message: 'update ok', data: results[0] })
  } catch (error) {
    res.status(500).json({ message: 'something wrong', errorMessage: error.message })
  }
})

// DELETE /projects/:id — ลบ project (tasks จะถูกลบตาม ON DELETE CASCADE)
app.delete('/projects/:id', async (req, res) => {
  try {
    const results = await conn.query('DELETE FROM projects WHERE id = ?', [parseInt(req.params.id)])
    res.json({ message: 'delete ok', data: results[0] })
  } catch (error) {
    res.status(500).json({ message: 'something wrong', errorMessage: error.message })
  }
})

// ===================================================
// TASKS
// ===================================================

// GET /tasks — ดึงทุก task พร้อม project + ผู้รับผิดชอบ (JOIN projects, users)
app.get('/tasks', async (req, res) => {
  try {
    const results = await conn.query(`
      SELECT
        tasks.*,
        projects.name AS project_name,
        users.firstname AS assigned_firstname,
        users.lastname AS assigned_lastname
      FROM tasks
      JOIN projects ON tasks.project_id = projects.id
      LEFT JOIN users ON tasks.assigned_user_id = users.id
      ORDER BY tasks.created_at DESC
    `)
    res.json(results[0])
  } catch (error) {
    res.status(500).json({ message: 'something wrong', errorMessage: error.message })
  }
})

// GET /tasks/:id — ดึง task + tags ทั้งหมด (JOIN task_tags, tags)
app.get('/tasks/:id', async (req, res) => {
  try {
    const [tasks] = await conn.query(`
      SELECT
        tasks.*,
        projects.name AS project_name,
        users.firstname AS assigned_firstname,
        users.lastname AS assigned_lastname
      FROM tasks
      JOIN projects ON tasks.project_id = projects.id
      LEFT JOIN users ON tasks.assigned_user_id = users.id
      WHERE tasks.id = ?
    `, [req.params.id])

    if (tasks.length === 0) throw { statusCode: 404, message: 'ไม่พบ task' }

    const [tags] = await conn.query(`
      SELECT tags.id, tags.name
      FROM tags
      JOIN task_tags ON tags.id = task_tags.tag_id
      WHERE task_tags.task_id = ?
    `, [req.params.id])

    res.json({ ...tasks[0], tags })
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'something wrong' })
  }
})

// POST /tasks — สร้าง task ใหม่
app.post('/tasks', async (req, res) => {
  try {
    const { title, description, status, project_id, assigned_user_id } = req.body
    if (!title) throw { message: 'กรุณากรอกชื่อ task', errors: ['กรุณากรอกชื่อ task'] }
    if (!project_id) throw { message: 'กรุณาระบุ project_id', errors: ['กรุณาระบุ project_id'] }

    const results = await conn.query(
      'INSERT INTO tasks (title, description, status, project_id, assigned_user_id) VALUES (?, ?, ?, ?, ?)',
      [title, description || '', status || 'todo', project_id, assigned_user_id || null]
    )
    res.json({ message: 'insert ok', data: results[0] })
  } catch (error) {
    res.status(500).json({ message: error.message || 'something wrong', errors: error.errors || [] })
  }
})

// PUT /tasks/:id — แก้ไข task / เปลี่ยน status
app.put('/tasks/:id', async (req, res) => {
  try {
    const { title, description, status, assigned_user_id } = req.body
    const results = await conn.query(
      'UPDATE tasks SET title=?, description=?, status=?, assigned_user_id=? WHERE id=?',
      [title, description, status, assigned_user_id || null, req.params.id]
    )
    res.json({ message: 'update ok', data: results[0] })
  } catch (error) {
    res.status(500).json({ message: 'something wrong', errorMessage: error.message })
  }
})

// DELETE /tasks/:id — ลบ task (task_tags จะถูกลบตาม ON DELETE CASCADE)
app.delete('/tasks/:id', async (req, res) => {
  try {
    const results = await conn.query('DELETE FROM tasks WHERE id = ?', [parseInt(req.params.id)])
    res.json({ message: 'delete ok', data: results[0] })
  } catch (error) {
    res.status(500).json({ message: 'something wrong', errorMessage: error.message })
  }
})

// ===================================================
// TAGS
// ===================================================

// GET /tags — ดึง tag ทั้งหมด
app.get('/tags', async (req, res) => {
  try {
    const results = await conn.query('SELECT * FROM tags ORDER BY name')
    res.json(results[0])
  } catch (error) {
    res.status(500).json({ message: 'something wrong', errorMessage: error.message })
  }
})

// POST /tags — สร้าง tag ใหม่
app.post('/tags', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) throw { message: 'กรุณากรอกชื่อ tag', errors: ['กรุณากรอกชื่อ tag'] }

    const results = await conn.query('INSERT INTO tags (name) VALUES (?)', [name])
    res.json({ message: 'insert ok', data: results[0] })
  } catch (error) {
    res.status(500).json({ message: error.message || 'something wrong', errors: error.errors || [] })
  }
})

// ===================================================
// TASK-TAGS (Many-to-Many)
// ===================================================

// POST /tasks/:id/tags — เพิ่ม tag ให้ task
app.post('/tasks/:id/tags', async (req, res) => {
  try {
    const { tag_id } = req.body
    if (!tag_id) throw { message: 'กรุณาระบุ tag_id', errors: ['กรุณาระบุ tag_id'] }

    await conn.query(
      'INSERT IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)',
      [req.params.id, tag_id]
    )
    res.json({ message: 'add tag ok' })
  } catch (error) {
    res.status(500).json({ message: error.message || 'something wrong', errors: error.errors || [] })
  }
})

// DELETE /tasks/:id/tags/:tagId — ลบ tag ออกจาก task
app.delete('/tasks/:id/tags/:tagId', async (req, res) => {
  try {
    await conn.query(
      'DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?',
      [req.params.id, req.params.tagId]
    )
    res.json({ message: 'remove tag ok' })
  } catch (error) {
    res.status(500).json({ message: 'something wrong', errorMessage: error.message })
  }
})

// ===================================================
// START SERVER
// ===================================================
app.listen(port, async () => {
  await initMySQL()
  console.log('http server run at ' + port)
})
