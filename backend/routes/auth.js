const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');

const saltRounds = 10;

// Đăng ký
router.post('/register', async (req, res) => {
  const { username, password, full_name, phone } = req.body;
  
  // Bỏ role trong req.body, ép role mặc định là customer
  if (!username || !password || !full_name) 
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });

  try {
    const existing = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const role = 'customer'; // ép role mặc định

    const result = await db.query(
      'INSERT INTO users (username, password, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, full_name, role, phone',
      [username, hashedPassword, full_name, phone, role]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


// Đăng nhập
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Thiếu username hoặc password' });

  try {
    const result = await db.query('SELECT * FROM users WHERE username=$1', [username]);
    if (result.rows.length === 0)
      return res.status(400).json({ message: 'Tài khoản không tồn tại' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Sai mật khẩu' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Route mới tạo user do admin tạo
router.post('/create-user', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') 
    return res.status(403).json({ message: 'Không có quyền tạo tài khoản' });

  const { username, password, full_name, phone, role } = req.body;

  if (!username || !password || !full_name || !role)
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });

  if (!['staff', 'admin'].includes(role))
    return res.status(400).json({ message: 'Role không hợp lệ' });

  try {
    const existing = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      'INSERT INTO users (username, password, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, full_name, role, phone',
      [username, hashedPassword, full_name, phone, role]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy thông tin người dùng hiện tại
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, full_name, role, phone FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
