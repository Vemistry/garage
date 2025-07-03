const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("../middleware/auth");

// Lấy tất cả lịch hẹn
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        lh.malh,
        lh.bienso,
        lh.makh,
        lh.ngaygiohen,
        lh.ghichu,
        lh.trangthai,
        lh.maxe,
        u.full_name,
        u.phone,
        cc.brand,
        cc.model
      FROM lichhen lh
      JOIN users u ON lh.makh = u.id
      LEFT JOIN car_categorical cc ON lh.maxe = cc.maxe
      ORDER BY lh.ngaygiohen DESC;
    `);
    res.json({ data: result.rows });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách lịch hẹn:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Tạo lịch hẹn mới
// Tạo lịch hẹn mới
router.post("/", authenticateToken, async (req, res) => {
  const { bienso, makh, ngaygiohen, ghichu, trangthai, brand, model } =
    req.body;

  // Kiểm tra dữ liệu cơ bản
  if (!makh || !ngaygiohen || !trangthai || !brand || !model) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }

  // Kiểm tra thời gian hợp lệ (giờ tròn từ 8h đến 16h)
  const date = new Date(ngaygiohen);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  if (hour < 8 || hour > 16 || minute !== 0 || second !== 0) {
    return res.status(400).json({
      message:
        "Thời gian hẹn không hợp lệ. Chỉ chấp nhận giờ nguyên từ 8h đến 16h.",
    });
  }

  try {
    // Tìm mã xe tương ứng với brand + model
    const carResult = await db.query(
      "SELECT maxe FROM car_categorical WHERE brand = $1 AND model = $2",
      [brand, model]
    );

    if (carResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy xe với brand và model đã chọn." });
    }

    const maxe = carResult.rows[0].maxe;

    // Thêm lịch hẹn
    const result = await db.query(
      `INSERT INTO lichhen (bienso, makh, ngaygiohen, ghichu, trangthai, maxe)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [bienso || null, makh, ngaygiohen, ghichu || "", trangthai, maxe]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Lỗi tạo lịch hẹn:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật trạng thái lịch hẹn
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { trangthai } = req.body;

  try {
    const result = await db.query(
      `UPDATE lichhen SET trangthai = $1 WHERE malh = $2 RETURNING *`,
      [trangthai, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Lỗi cập nhật lịch hẹn:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xóa lịch hẹn
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const idNumber = parseInt(id);

  if (isNaN(idNumber)) {
    return res.status(400).json({ message: "ID lịch hẹn không hợp lệ" });
  }

  try {
    const result = await db.query("DELETE FROM lichhen WHERE malh = $1", [
      idNumber,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lịch hẹn để xoá" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("❌ Lỗi xóa lịch hẹn:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
