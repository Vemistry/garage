const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const db = require("../db");

// Lấy danh sách các loại xe
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM car_categorical ORDER BY maxe DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách loại xe" });
  }
});

// Thêm loại xe mới (chỉ Admin mới được thêm)
router.post("/", authenticateToken, async (req, res) => {
  console.log("Dữ liệu nhận từ client:", req.body);
  const { user } = req;
  if (user.role !== "admin")
    return res.status(403).json({ message: "Chỉ admin mới được thêm loại xe" });

  const { brand, model } = req.body;

  if (!brand || !model)
    return res
      .status(400)
      .json({ message: "Thiếu thông tin brand hoặc model" });

  try {
    // Kiểm tra loại xe đã tồn tại chưa
    const check = await db.query(
      "SELECT * FROM car_categorical WHERE brand=$1 AND model=$2",
      [brand, model]
    );
    if (check.rows.length > 0)
      return res.status(400).json({ message: "Loại xe đã tồn tại" });

    const result = await db.query(
      `INSERT INTO car_categorical (brand, model)
       VALUES ($1, $2) RETURNING *`,
      [brand, model]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi thêm loại xe" });
  }
});

// Cập nhật loại xe
router.put("/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ message: "Chỉ admin mới được cập nhật loại xe" });

  const carId = req.params.id;
  const { brand, model } = req.body;

  if (!brand || !model)
    return res
      .status(400)
      .json({ message: "Thiếu thông tin brand hoặc model" });

  try {
    // Kiểm tra loại xe có tồn tại không
    const checkExist = await db.query(
      "SELECT * FROM car_categorical WHERE maxe=$1",
      [carId]
    );
    if (checkExist.rows.length === 0)
      return res.status(404).json({ message: "Loại xe không tồn tại" });

    // Kiểm tra trùng brand + model
    const checkDuplicate = await db.query(
      "SELECT * FROM car_categorical WHERE brand=$1 AND model=$2 AND maxe<>$3",
      [brand, model, carId]
    );
    if (checkDuplicate.rows.length > 0)
      return res
        .status(400)
        .json({ message: "Loại xe đã tồn tại với brand và model này" });

    const result = await db.query(
      `UPDATE car_categorical
       SET brand=$1, model=$2
       WHERE maxe=$3
       RETURNING *`,
      [brand, model, carId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi cập nhật loại xe" });
  }
});

// Xóa loại xe
router.delete("/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Chỉ admin mới được xóa loại xe" });

  const carId = req.params.id;

  try {
    const result = await db.query(
      "DELETE FROM car_categorical WHERE maxe=$1 RETURNING *",
      [carId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Loại xe không tồn tại" });

    res.json({ message: "Xóa loại xe thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi xóa loại xe" });
  }
});

module.exports = router;
