const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // Lấy token từ cookie
  const token = req.cookies.token; // <-- đây nhé

  if (!token) return res.status(401).json({ message: "Thiếu token xác thực" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc hết hạn" });
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
