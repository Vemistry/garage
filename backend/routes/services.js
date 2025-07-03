const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("../middleware/auth");

// Lấy tất cả hoặc tìm kiếm dịch vụ theo tên
router.get("/", authenticateToken, async (req, res) => {
  const { search } = req.query;

  try {
    if (search) {
      const { rows } = await db.query(
        `SELECT madv, tendv FROM services WHERE LOWER(tendv) LIKE LOWER($1) LIMIT 10`,
        [`%${search}%`]
      );
      return res.json(rows);
    }

    // Nếu không có từ khóa search -> trả về toàn bộ
    const { rows } = await db.query("SELECT * FROM services");
    res.json(rows);
  } catch (err) {
    console.error("Lỗi khi lấy dịch vụ:", err);
    res.status(500).json({ error: "Không thể lấy danh sách dịch vụ" });
  }
});

// Thêm dịch vụ mới
router.post("/", authenticateToken, async (req, res) => {
  const { TenDV, description } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO services (TenDV, description) VALUES ($1, $2) RETURNING *",
      [TenDV, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Không thể thêm dịch vụ" });
  }
});

// Cập nhật dịch vụ
router.put("/:MaDV", authenticateToken, async (req, res) => {
  const { MaDV } = req.params;
  const { tendv, description } = req.body;

  if (!tendv)
    return res.status(400).json({ error: "Tên dịch vụ không được để trống" });

  try {
    await db.query(
      "UPDATE services SET TenDV = $1, description = $2 WHERE MaDV = $3",
      [tendv, description, MaDV]
    );
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật dịch vụ:", err);
    res.status(500).json({ error: "Không thể cập nhật dịch vụ" });
  }
});

// Xoá dịch vụ
router.delete("/:MaDV", authenticateToken, async (req, res) => {
  const { MaDV } = req.params;
  try {
    await db.query("DELETE FROM services WHERE MaDV = $1", [MaDV]);
    res.json({ message: "Đã xoá dịch vụ" });
  } catch (err) {
    res.status(500).json({ error: "Không thể xoá dịch vụ" });
  }
});

module.exports = router;
