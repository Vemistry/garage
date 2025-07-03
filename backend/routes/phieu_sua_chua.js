const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("../middleware/auth");

// =============================
// TẠO PHIẾU SỬA CHỮA MỚI
// =============================
router.post("/", authenticateToken, async (req, res) => {
  const { bienso, nv_tiepnhan, nv_suachua, tgtiepnhan, trangthaithanhtoan } =
    req.body;

  try {
    await db.query(
      `INSERT INTO phieusuachua (
        bienso, nvtiepnhan, nvsuachua, tgtiepnhan, trangthaithanhtoan
      ) VALUES ($1, $2, $3, $4::timestamptz, $5)`,
      [bienso, nv_tiepnhan, nv_suachua, tgtiepnhan, trangthaithanhtoan]
    );

    res.status(201).json({ message: "Tạo phiếu thành công" });
  } catch (err) {
    console.error("Lỗi khi tạo phiếu sửa chữa:", err);
    res.status(500).json({ error: "Không thể tạo phiếu sửa chữa" });
  }
});

// =============================
// LẤY TẤT CẢ PHIẾU SỬA CHỮA
// =============================
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.mapsc AS maphieu,
        p.bienso,
        p.tgtiepnhan AS tg_tiepnhan,
        p.tghoanthanh AS tg_hoanthanh,
        p.tongtien,
        p.trangthaithanhtoan AS trangthai,

        v.makh,
        kh.phone,

        nv1.full_name AS nv_tiepnhan,
        nv2.full_name AS nv_suachua

      FROM phieusuachua p
      LEFT JOIN vehicles v ON p.bienso = v.bienso
      LEFT JOIN users kh ON v.makh = kh.id
      LEFT JOIN users nv1 ON p.nvtiepnhan = nv1.id
      LEFT JOIN users nv2 ON p.nvsuachua = nv2.id

      ORDER BY p.mapsc DESC
    `);

    res.json({ data: result.rows });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phiếu:", err);
    res.status(500).json({ error: "Không thể lấy danh sách phiếu" });
  }
});

// =============================
// LẤY CHI TIẾT 1 PHIẾU
// =============================
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const psc = await db.query(
      `SELECT 
  p.mapsc AS maphieu,
  p.bienso,
  p.tgtiepnhan AS tg_tiepnhan,
  p.tghoanthanh AS tg_hoanthanh,
  p.tongtien,
  p.trangthaithanhtoan AS trangthai,

  v.makh,
  kh.phone,

  nv1.full_name AS nv_tiepnhan,
  nv2.full_name AS nv_suachua

FROM phieusuachua p
LEFT JOIN vehicles v ON p.bienso = v.bienso
LEFT JOIN users kh ON v.makh = kh.id
LEFT JOIN users nv1 ON p.nvtiepnhan = nv1.id
LEFT JOIN users nv2 ON p.nvsuachua = nv2.id

WHERE p.mapsc = $1
  `,
      [parseInt(id)] // nhớ ép kiểu để tránh lỗi
    );

    if (psc.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy phiếu" });
    }

    // Trả về chỉ dữ liệu phiếu, không lấy lịch sử nữa
    return res.json({
      phieu: psc.rows[0],
    });
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết phiếu:", err);
    res.status(500).json({ error: "Không thể lấy chi tiết phiếu" });
  }
});

// =============================
// CẬP NHẬT PHIẾU
// =============================
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { nvsuachua, tghoanthanh, tiencong } = req.body;

  try {
    const result = await db.query(
      `UPDATE phieusuachua 
       SET nvsuachua = $1, tghoanthanh = $2, tiencong = $3
       WHERE mapsc = $4
       RETURNING *`,
      [nvsuachua, tghoanthanh, tiencong, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi khi cập nhật phiếu:", err);
    res.status(500).json({ error: "Không thể cập nhật phiếu sửa chữa" });
  }
});

// =============================
// THÊM DỊCH VỤ VÀO PHIẾU
// =============================
router.post("/:id/dichvu", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { madv, ghichu, thanhtien } = req.body;

  try {
    await db.query(
      `INSERT INTO ct_psc_dichvu (mapsc, madv, ghichu, thanhtien)
       VALUES ($1, $2, $3, $4)`,
      [id, madv, ghichu || "", thanhtien || 0]
    );
    res.json({ message: "Đã thêm dịch vụ" });
  } catch (err) {
    console.error("Lỗi khi thêm dịch vụ:", err);
    res.status(500).json({ error: "Không thể thêm dịch vụ" });
  }
});

// =============================
// THÊM PHỤ TÙNG VÀO PHIẾU
// =============================
router.post("/:id/phutung", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { mapt, soluong, thanhtien } = req.body;

  try {
    await db.query(
      `INSERT INTO ct_psc_phutung (mapsc, mapt, soluong, thanhtien)
       VALUES ($1, $2, $3, $4)`,
      [id, mapt, soluong, thanhtien || 0]
    );
    res.json({ message: "Đã thêm phụ tùng" });
  } catch (err) {
    console.error("Lỗi khi thêm phụ tùng:", err);
    res.status(500).json({ error: "Không thể thêm phụ tùng" });
  }
});

// =============================
// CẬP NHẬT TRẠNG THÁI PHIẾU
// =============================
router.post("/:id/trangthai", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { trangthai, nguoicapnhat } = req.body;

  try {
    await db.query(
      `UPDATE phieusuachua SET trangthaithanhtoan = $1 WHERE mapsc = $2`,
      [trangthai, id]
    );

    await db.query(
      `INSERT INTO lichsutrangthaipsc (mapsc, trangthai, nguoicapnhat)
       VALUES ($1, $2, $3)`,
      [id, trangthai, nguoicapnhat || "Không rõ"]
    );

    res.json({ message: "Đã cập nhật trạng thái" });
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái:", err);
    res.status(500).json({ error: "Không thể cập nhật trạng thái phiếu" });
  }
});

module.exports = router;
