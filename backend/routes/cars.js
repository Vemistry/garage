const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const db = require("../db");

// Regex kiểm tra định dạng biển số xe: 2 số đầu, 1 chữ cái hoa, 5 số cuối
const licensePlateRegex = /^\d{2}[A-Z]\d{5}$/;

// Lấy danh sách xe, kèm tên chủ xe, số điện thoại, brand và model
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        v.bienso,
        v.ghichu,
        v.makh,
        u.full_name AS full_name,
        u.phone AS phone,
        c.brand,
        c.model
      FROM vehicles v
      JOIN users u ON v.makh = u.id
      JOIN car_categorical c ON v.maxe = c.maxe
      ORDER BY v.bienso
    `);
    res.json({ data: result.rows }); // ✅ frontend expects { data: [...] }
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách xe:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Thêm xe mới (chỉ admin hoặc staff)
router.post("/", authenticateToken, async (req, res) => {
  const { user } = req;
  if (!["admin", "staff"].includes(user.role)) {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }

  let { phone, bienso, maxe, ghichu } = req.body;

  // Kiểm tra đầu vào cơ bản
  if (!phone || !bienso || !maxe) {
    return res
      .status(400)
      .json({ message: "Thiếu số điện thoại, biển số hoặc mã xe" });
  }

  phone = phone.trim();
  bienso = bienso.trim().toUpperCase();

  if (!/^\d{10}$/.test(phone)) {
    return res
      .status(400)
      .json({ message: "Số điện thoại không hợp lệ (10 số)" });
  }

  if (!licensePlateRegex.test(bienso)) {
    return res
      .status(400)
      .json({ message: "Biển số xe không đúng định dạng (VD: 12A34567)" });
  }

  try {
    // Kiểm tra biển số đã tồn tại chưa
    const checkLicense = await db.query(
      "SELECT bienso FROM vehicles WHERE bienso = $1",
      [bienso]
    );
    if (checkLicense.rows.length > 0) {
      return res.status(400).json({ message: "Biển số xe đã tồn tại" });
    }

    // Kiểm tra mã xe (maxe) có tồn tại không
    const carTypeRes = await db.query(
      "SELECT * FROM car_categorical WHERE maxe = $1",
      [maxe]
    );
    if (carTypeRes.rows.length === 0) {
      return res.status(400).json({ message: "Mã xe (maxe) không tồn tại" });
    }

    // Kiểm tra khách hàng
    const ownerRes = await db.query(
      "SELECT id FROM users WHERE phone = $1 AND role = 'customer'",
      [phone]
    );
    if (ownerRes.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy khách hàng" });
    }

    const makh = ownerRes.rows[0].id;

    // Thêm xe mới
    const insertRes = await db.query(
      `INSERT INTO vehicles (bienso, maxe, makh, ghichu)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [bienso, maxe, makh, ghichu || null]
    );

    res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error("Lỗi khi thêm xe:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật xe theo biển số
router.put("/:bienso", authenticateToken, async (req, res) => {
  const { user } = req;
  if (!["admin", "staff"].includes(user.role)) {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }

  let biensoParam = req.params.bienso.trim().toUpperCase();
  let { phone, newBienso, maxe, ghichu } = req.body;

  if (!phone || !newBienso || !maxe) {
    return res
      .status(400)
      .json({ message: "Thiếu số điện thoại, biển số mới hoặc mã xe" });
  }

  newBienso = newBienso.trim().toUpperCase();
  phone = phone.trim();

  if (!licensePlateRegex.test(newBienso)) {
    return res.status(400).json({
      message: "Biển số xe không đúng định dạng (VD: 12A34567)",
    });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res
      .status(400)
      .json({ message: "Số điện thoại không hợp lệ (10 số)" });
  }

  try {
    // Kiểm tra xe hiện tại tồn tại chưa
    const checkVehicle = await db.query(
      "SELECT * FROM vehicles WHERE bienso = $1",
      [biensoParam]
    );
    if (checkVehicle.rows.length === 0) {
      return res.status(404).json({ message: "Xe không tồn tại" });
    }

    // Check trùng biển số nếu biển số mới khác biển số cũ
    if (newBienso !== biensoParam) {
      const checkNewLicense = await db.query(
        "SELECT bienso FROM vehicles WHERE bienso = $1",
        [newBienso]
      );
      if (checkNewLicense.rows.length > 0) {
        return res.status(400).json({ message: "Biển số mới đã tồn tại" });
      }
    }

    // Kiểm tra mã xe có tồn tại không
    const carTypeRes = await db.query(
      "SELECT * FROM car_categorical WHERE maxe = $1",
      [maxe]
    );
    if (carTypeRes.rows.length === 0) {
      return res.status(400).json({ message: "Mã xe không tồn tại" });
    }

    // Kiểm tra khách hàng
    const ownerRes = await db.query(
      "SELECT id FROM users WHERE phone = $1 AND role = 'customer'",
      [phone]
    );
    if (ownerRes.rows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy chủ xe" });
    }

    const makh = ownerRes.rows[0].id;

    // Cập nhật
    const result = await db.query(
      `UPDATE vehicles
       SET bienso = $1, maxe = $2, makh = $3, ghichu = $4
       WHERE bienso = $5
       RETURNING *`,
      [newBienso, maxe, makh, ghichu || null, biensoParam]
    );

    const fullVehicle = await db.query(
      `
  SELECT v.*, u.full_name, u.phone
  FROM vehicles v
  JOIN users u ON v.makh = u.id
  WHERE v.bienso = $1
`,
      [newBienso]
    );

    res.json(fullVehicle.rows[0]);
  } catch (err) {
    console.error("Lỗi khi cập nhật xe:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xoá xe theo biển số
router.delete("/:bienso", authenticateToken, async (req, res) => {
  const { user } = req;
  if (!["admin", "staff"].includes(user.role)) {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }

  const bienso = req.params.bienso.trim().toUpperCase();

  try {
    const result = await db.query(
      "DELETE FROM vehicles WHERE bienso = $1 RETURNING *",
      [bienso]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Xe không tồn tại" });
    }

    res.json({ message: "Xoá xe thành công", xe: result.rows[0] });
  } catch (err) {
    console.error("Lỗi khi xoá xe:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
