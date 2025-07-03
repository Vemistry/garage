require("dotenv").config(); // <- Đọc file .env

const express = require("express");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const carsRouter = require("./routes/cars");
const cars_categoricalRouter = require("./routes/cars_categorical")
const productRouter = require("./routes/products");
const lichHenRoute = require("./routes/lich_hen");
const servicesRoute = require("./routes/services");
const phieuSuaChuaRoutes = require("./routes/phieu_sua_chua");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/cars", carsRouter);
app.use("/api/cars_categorical", cars_categoricalRouter);
app.use("/api/products", productRouter);
app.use("/api/lich_hen", lichHenRoute);
app.use("/api/services", servicesRoute);
app.use("/api/phieu_sua_chua", phieuSuaChuaRoutes);


app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 3001}`);
});
