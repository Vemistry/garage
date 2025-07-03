-- SCHEMA HỆ THỐNG QUẢN LÝ GARAGE Ô TÔ
-- PostgreSQL compatible

-- Danh mục loại xe
CREATE TABLE car_categorical (
    MaXe SERIAL PRIMARY KEY,
    Brand VARCHAR(100) NOT NULL,
    Model VARCHAR(100) NOT NULL
);

-- Người dùng hệ thống: admin, staff, customer
CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    username VARCHAR(50) UNIQUE NOT NULL CHECK (username ~ '^[A-Za-z0-9]+$'),
    password VARCHAR(255) NOT NULL, -- Mật khẩu đã hash

    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(10) CHECK (phone ~ '^0[0-9]{9}$'),

    role VARCHAR(20) NOT NULL, -- 'admin', 'staff', 'customer'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    note VARCHAR(255),
    chucvu VARCHAR(100),        -- Dành riêng cho staff
    so_no NUMERIC               -- Dành riêng cho customer
);

-- Thông tin xe
CREATE TABLE vehicles (
    BienSo VARCHAR(20) PRIMARY KEY CHECK (BienSo ~ '^[0-9]{2}[A-Z]{1}[0-9]{5}$'),
    MaXe INT REFERENCES car_categorical(MaXe),
    MaKH INT REFERENCES users(id), -- role = 'customer'
    GhiChu TEXT
);

-- Phụ tùng
CREATE TABLE products (
    MaPT SERIAL PRIMARY KEY,
    TenPT VARCHAR(100) NOT NULL,
    SoLuongTon INT NOT NULL CHECK (SoLuongTon >= 0),
    DonGia NUMERIC(12,2) NOT NULL CHECK (DonGia >= 0),
    Min INTEGER DEFAULT 0
);

-- Dịch vụ
CREATE TABLE services (
    MaDV SERIAL PRIMARY KEY,
    TenDV VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

-- Lịch hẹn sửa chữa
CREATE TABLE lichhen (
    MaLH SERIAL PRIMARY KEY,
    BienSo VARCHAR(20) REFERENCES vehicles(BienSo),
    MaKH INT REFERENCES users(id), -- role = 'customer'

    NgayGioHen TIMESTAMP NOT NULL CHECK (
        EXTRACT(HOUR FROM NgayGioHen) BETWEEN 8 AND 16 AND
        EXTRACT(MINUTE FROM NgayGioHen) = 0 AND
        EXTRACT(SECOND FROM NgayGioHen) = 0
    ),

    GhiChu TEXT,
    TrangThai VARCHAR(50) NOT NULL
);

-- Phiếu sửa chữa
CREATE TABLE phieusuachua (
    MaPSC SERIAL PRIMARY KEY,
    BienSo VARCHAR(20) REFERENCES vehicles(BienSo),

    NVTiepNhan INT REFERENCES users(id), -- role = 'staff'
    NVSuaChua INT REFERENCES users(id),  -- role = 'staff'

    TGTiepNhan TIMESTAMP NOT NULL,
    TGHoanThanh TIMESTAMP,

    TienCong NUMERIC(12,2) DEFAULT 0,
    TongTien NUMERIC(12,2) DEFAULT 0,

    TrangThaiThanhToan VARCHAR(50) NOT NULL -- ví dụ: 'Chưa thanh toán'
);

-- Chi tiết phiếu sửa chữa - dịch vụ
CREATE TABLE ct_psc_dichvu (
    MaPSC INT REFERENCES phieusuachua(MaPSC),
    MaDV INT REFERENCES services(MaDV),
    GhiChu TEXT,
    ThanhTien NUMERIC(12,2) DEFAULT 0,
    PRIMARY KEY (MaPSC, MaDV)
);

-- Chi tiết phiếu sửa chữa - phụ tùng
CREATE TABLE ct_psc_phutung (
    MaPSC INT REFERENCES phieusuachua(MaPSC),
    MaPT INT REFERENCES products(MaPT),
    SoLuong INT NOT NULL CHECK (SoLuong > 0),
    ThanhTien NUMERIC(12,2) DEFAULT 0,
    PRIMARY KEY (MaPSC, MaPT)
);

-- Lịch sử thay đổi trạng thái phiếu sửa chữa
CREATE TABLE lichsutrangthaipsc (
    MaPSC INT REFERENCES phieusuachua(MaPSC),
    ThoiGian TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TrangThai VARCHAR(50) NOT NULL,
    NguoiCapNhat VARCHAR(100),
    PRIMARY KEY (MaPSC, ThoiGian)
);
