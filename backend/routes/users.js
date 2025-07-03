const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const db = require("../db");
const bcrypt = require("bcrypt");

const saltRounds = 10;

// ------------------ NGƯỜI DÙNG ĐỔI MẬT KHẨU ------------------
router.put("/change-password", authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
  }

  try {
    const userRes = await db.query("SELECT password FROM users WHERE id = $1", [req.user.id]);

    if (!userRes.rows.length) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    const isMatch = await bcrypt.compare(oldPassword, userRes.rows[0].password);

    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu cũ không đúng" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await db.query("UPDATE users SET password = $1 WHERE id = $2", [hashedNewPassword, req.user.id]);

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
});


// ------------------ DANH SÁCH NHÂN VIÊN ------------------
router.get("/staff", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });

  try {
    const result = await db.query(
      `SELECT id, username, full_name, phone, role, chucvu, note FROM users WHERE role = 'staff' ORDER BY id`
    );
    res.json({
      message: "Lấy danh sách nhân viên thành công",
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ------------------ THÊM NHÂN VIÊN ------------------
router.post("/staff", authenticateToken, async (req, res) => {
  console.log("Request body:", req.body);
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ message: "Bạn không có quyền thêm nhân viên" });

  const { username, password, full_name, phone, note, chucvu } = req.body;
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  const phoneRegex = /^\d{10}$/;

  try {
    if (!username || !password || !full_name || !phone)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

    if (!usernameRegex.test(username))
      return res.status(400).json({ message: "Username không hợp lệ" });

    if (!phoneRegex.test(phone))
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });

    const [checkUser, checkPhone] = await Promise.all([
      db.query("SELECT id FROM users WHERE username = $1", [username]),
      db.query("SELECT id FROM users WHERE phone = $1", [phone]),
    ]);

    if (checkUser.rows.length)
      return res.status(409).json({ message: "Username đã tồn tại" });
    if (checkPhone.rows.length)
      return res.status(409).json({ message: "Số điện thoại đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await db.query(
      `INSERT INTO users (username, password, full_name, phone, role, chucvu, note)
       VALUES ($1, $2, $3, $4, 'staff', $5, $6)
       RETURNING id, username, full_name, phone, role, chucvu, note`,
      [username, hashedPassword, full_name, phone, chucvu || null, note]
    );

    res
      .status(201)
      .json({ message: "Tạo nhân viên thành công", data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ------------------ CẬP NHẬT NHÂN VIÊN ------------------
router.put("/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Không có quyền chỉnh sửa" });

  const staffId = req.params.id;
  const { username, password, full_name, phone, note, chucvu } = req.body;

  const usernameRegex = /^[a-zA-Z0-9]+$/;
  const phoneRegex = /^\d{10}$/;

  try {
    if (username && !usernameRegex.test(username))
      return res.status(400).json({ message: "Username không hợp lệ" });

    if (phone && !phoneRegex.test(phone))
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });

    const [checkUser, checkPhone] = await Promise.all([
      username
        ? db.query("SELECT id FROM users WHERE username=$1 AND id<>$2", [
            username,
            staffId,
          ])
        : { rows: [] },
      phone
        ? db.query("SELECT id FROM users WHERE phone=$1 AND id<>$2", [
            phone,
            staffId,
          ])
        : { rows: [] },
    ]);

    if (checkUser.rows.length)
      return res.status(409).json({ message: "Username đã tồn tại" });
    if (checkPhone.rows.length)
      return res.status(409).json({ message: "Số điện thoại đã tồn tại" });

    let hashedPassword = password
      ? await bcrypt.hash(password, saltRounds)
      : null;

    const fields = [];
    const values = [];
    let idx = 1;

    if (username) fields.push(`username=$${idx++}`), values.push(username);
    if (hashedPassword)
      fields.push(`password=$${idx++}`), values.push(hashedPassword);
    if (full_name) fields.push(`full_name=$${idx++}`), values.push(full_name);
    if (phone) fields.push(`phone=$${idx++}`), values.push(phone);
    if (chucvu !== undefined)
      fields.push(`chucvu=$${idx++}`), values.push(chucvu);
    if (note !== undefined) fields.push(`note=$${idx++}`), values.push(note);

    if (!fields.length)
      return res
        .status(400)
        .json({ message: "Không có trường nào cần cập nhật" });

    values.push(staffId);
    const query = `
      UPDATE users SET ${fields.join(", ")}
      WHERE id=$${idx} AND role='staff'
      RETURNING id, username, full_name, phone, role, chucvu, note
    `;

    const result = await db.query(query, values);

    if (!result.rows.length)
      return res.status(404).json({ message: "Nhân viên không tồn tại" });

    res.json({ message: "Cập nhật thành công", data: result.rows[0] });
  } catch (err) {
    console.error("Lỗi cập nhật nhân viên:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ------------------ DANH SÁCH KHÁCH HÀNG ------------------
router.get("/customer", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });

  try {
    const result = await db.query(
      `SELECT id, username, full_name, phone, so_no, note FROM users WHERE role = 'customer' ORDER BY id`
    );
    res.json({
      message: "Lấy danh sách khách hàng thành công",
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ------------------ THÊM KHÁCH HÀNG ------------------
router.post("/customer", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Bạn không có quyền thêm khách hàng" });

  const { username, password, full_name, phone, note, so_no } = req.body;

  const usernameRegex = /^[a-zA-Z0-9]+$/;
  const phoneRegex = /^\d{10}$/;

  try {
    if (!username || !password || !full_name || !phone)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

    if (!usernameRegex.test(username))
      return res.status(400).json({ message: "Username không hợp lệ" });

    if (!phoneRegex.test(phone))
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });

    const [checkUser, checkPhone] = await Promise.all([
      db.query("SELECT id FROM users WHERE username = $1", [username]),
      db.query("SELECT id FROM users WHERE phone = $1", [phone]),
    ]);

    if (checkUser.rows.length)
      return res.status(409).json({ message: "Username đã tồn tại" });
    if (checkPhone.rows.length)
      return res.status(409).json({ message: "SĐT đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await db.query(
      `INSERT INTO users (username, password, full_name, phone, role, so_no, note)
       VALUES ($1, $2, $3, $4, 'customer', $5, $6)
       RETURNING id, username, full_name, phone, so_no, role, note`,
      [username, hashedPassword, full_name, phone, so_no || 0, note]
    );

    res.status(201).json({
      message: "Tạo khách hàng thành công",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ------------------ CẬP NHẬT KHÁCH HÀNG ------------------
router.put("/customer/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Không có quyền chỉnh sửa" });

  const customerId = req.params.id;
  const { username, password, full_name, phone, so_no, note } = req.body;

  const usernameRegex = /^[a-zA-Z0-9]+$/;
  const phoneRegex = /^\d{10}$/;

  try {
    if (username && !usernameRegex.test(username))
      return res.status(400).json({ message: "Username không hợp lệ" });

    if (phone && !phoneRegex.test(phone))
      return res.status(400).json({ message: "SĐT không hợp lệ" });

    const [checkUser, checkPhone] = await Promise.all([
      username
        ? db.query("SELECT id FROM users WHERE username=$1 AND id<>$2", [
            username,
            customerId,
          ])
        : { rows: [] },
      phone
        ? db.query("SELECT id FROM users WHERE phone=$1 AND id<>$2", [
            phone,
            customerId,
          ])
        : { rows: [] },
    ]);

    if (checkUser.rows.length)
      return res.status(409).json({ message: "Username đã tồn tại" });
    if (checkPhone.rows.length)
      return res.status(409).json({ message: "SĐT đã tồn tại" });

    let hashedPassword = password
      ? await bcrypt.hash(password, saltRounds)
      : null;

    const fields = [];
    const values = [];
    let idx = 1;

    if (username) fields.push(`username=$${idx++}`), values.push(username);
    if (hashedPassword)
      fields.push(`password=$${idx++}`), values.push(hashedPassword);
    if (full_name) fields.push(`full_name=$${idx++}`), values.push(full_name);
    if (phone) fields.push(`phone=$${idx++}`), values.push(phone);
    if (so_no !== undefined) fields.push(`so_no=$${idx++}`), values.push(so_no);
    if (note !== undefined) fields.push(`note=$${idx++}`), values.push(note);

    if (!fields.length)
      return res
        .status(400)
        .json({ message: "Không có trường nào để cập nhật" });

    values.push(customerId);
    const query = `
      UPDATE users SET ${fields.join(", ")}
      WHERE id=$${idx} AND role='customer'
      RETURNING id, username, full_name, phone, role, so_no, note
    `;

    const result = await db.query(query, values);

    if (!result.rows.length)
      return res.status(404).json({ message: "Khách hàng không tồn tại" });

    res.json({ message: "Cập nhật thành công", data: result.rows[0] });
  } catch (err) {
    console.error("Lỗi cập nhật khách hàng:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
});


// ------------------ XOÁ USER ------------------
router.delete("/:id", authenticateToken, async (req, res) => {
  const userRole = req.user.role;
  const userId = req.params.id;

  if (userRole !== "admin" && userRole !== "staff")
    return res.status(403).json({ message: "Không có quyền xoá user" });

  try {
    // Lấy role của user cần xoá
    const target = await db.query(
      "SELECT id, role FROM users WHERE id = $1",
      [userId]
    );

    if (!target.rows.length)
      return res.status(404).json({ message: "User không tồn tại" });

    const targetRole = target.rows[0].role;

    // Kiểm tra quyền xoá:
    if (userRole === "staff" && targetRole !== "customer") {
      return res
        .status(403)
        .json({ message: "Nhân viên chỉ được xoá khách hàng" });
    }

    // Thực hiện xoá
    const result = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [userId]
    );

    res.json({ message: "Xoá user thành công", data: result.rows[0] });
  } catch (err) {
    console.error("Lỗi khi xoá user:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Tìm khách hàng theo số điện thoại
router.get("/find_by_phone/:phone", authenticateToken, async (req, res) => {
  const { phone } = req.params;

  try {
    const result = await db.query(
      `SELECT id, full_name, phone FROM users WHERE phone = $1 AND role = 'customer'`,
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Lỗi tìm khách theo SĐT:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


module.exports = router;
