const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const db = require("../db");

// Validate số nguyên không âm
function isPositiveNumber(val) {
  return typeof val === "number" && val >= 0;
}

// ✅ Nhập kho (chỉ admin)
router.post("/stock-in", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới được nhập kho" });
  }

  const { product_id, quantity } = req.body;
  if (
    !Number.isInteger(product_id) ||
    !isPositiveNumber(quantity) ||
    quantity === 0
  ) {
    return res.status(400).json({ message: "Thông tin không hợp lệ" });
  }

  try {
    const productRes = await db.query("SELECT * FROM products WHERE id = $1", [
      product_id,
    ]);
    if (productRes.rows.length === 0) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    await db.query(
      "UPDATE products SET quantity = quantity + $1 WHERE id = $2",
      [quantity, product_id]
    );
    res.json({ message: "Nhập kho thành công" });
  } catch (error) {
    console.error("Lỗi nhập kho:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ✅ Lấy danh sách phụ tùng
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT mapt, tenpt, soluongton, dongia, min FROM products"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách sản phẩm" });
  }
});

// ✅ Thêm sản phẩm mới (admin, staff)
router.post("/", authenticateToken, async (req, res) => {
  if (!["admin", "staff"].includes(req.user.role))
    return res.status(403).json({ message: "Không có quyền truy cập" });

  const { tenpt, soluongton, dongia, min } = req.body;

  if (
    !tenpt ||
    typeof tenpt !== "string" ||
    !isPositiveNumber(soluongton) ||
    !isPositiveNumber(dongia) ||
    (min !== undefined && !isPositiveNumber(min))
  ) {
    return res.status(400).json({ message: "Thông tin sản phẩm không hợp lệ" });
  }

  try {
    const check = await db.query(
      "SELECT * FROM products WHERE LOWER(tenpt) = LOWER($1)",
      [tenpt.trim()]
    );
    if (check.rows.length > 0) {
      return res.status(409).json({ message: "Tên sản phẩm đã tồn tại" });
    }

    const result = await db.query(
      `INSERT INTO products (tenpt, soluongton, dongia, min)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [tenpt.trim(), soluongton, dongia, min ?? 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi thêm sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi thêm sản phẩm" });
  }
});

// ✅ Nhập kho hàng loạt
router.post("/import", authenticateToken, async (req, res) => {
  const items = req.body; // [{tenpt, soluongton, dongia, min}, ...]

  try {
    for (const item of items) {
      const existing = await db.query(
        "SELECT * FROM products WHERE tenpt = $1",
        [item.tenpt]
      );

      if (existing.rows.length > 0) {
        // cập nhật số lượng tồn và đơn giá
        await db.query(
          "UPDATE products SET soluongton = soluongton + $1, dongia = $2 WHERE tenpt = $3",
          [item.soluongton, item.dongia, item.tenpt]
        );
      } else {
        // thêm mới
        await db.query(
          "INSERT INTO products (tenpt, soluongton, dongia, min) VALUES ($1, $2, $3, $4)",
          [item.tenpt, item.soluongton, item.dongia, item.min ?? 0]
        );
      }
    }

    res.status(200).json({ message: "Import thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi nhập kho" });
  }
});

// ✅ Cập nhật sản phẩm
router.put("/:mapt", authenticateToken, async (req, res) => {
  if (!["admin", "staff"].includes(req.user.role))
    return res.status(403).json({ message: "Không có quyền truy cập" });

  const { mapt } = req.params;
  const { tenpt, soluongton, dongia, min } = req.body;

  try {
    const productRes = await db.query(
      "SELECT * FROM products WHERE mapt = $1",
      [mapt]
    );
    if (productRes.rows.length === 0)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    if (tenpt) {
      const checkName = await db.query(
        "SELECT * FROM products WHERE LOWER(tenpt) = LOWER($1) AND mapt != $2",
        [tenpt.trim(), mapt]
      );
      if (checkName.rows.length > 0)
        return res.status(409).json({ message: "Tên sản phẩm đã tồn tại" });
    }

    const updated = await db.query(
      `UPDATE products SET 
        tenpt = COALESCE($1, tenpt),
        soluongton = COALESCE($2, soluongton),
        dongia = COALESCE($3, dongia),
        min = COALESCE($4, min)
       WHERE mapt = $5 RETURNING *`,
      [tenpt, soluongton, dongia, min, mapt]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    console.error("Lỗi sửa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi sửa sản phẩm" });
  }
});

// ✅ Xóa sản phẩm
router.delete("/:mapt", authenticateToken, async (req, res) => {
  if (!["admin", "staff"].includes(req.user.role))
    return res.status(403).json({ message: "Không có quyền truy cập" });

  const { mapt } = req.params;
  try {
    const productRes = await db.query(
      "SELECT * FROM products WHERE mapt = $1",
      [mapt]
    );
    if (productRes.rows.length === 0)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    await db.query("DELETE FROM products WHERE mapt = $1", [mapt]);
    res.json({ message: "Xóa phụ tùng thành công" });
  } catch (error) {
    console.error("Lỗi xóa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi xóa sản phẩm" });
  }
});

module.exports = router;
