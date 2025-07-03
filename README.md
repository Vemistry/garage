Dự án phần mềm quản lý garage bao gồm 3 phần chính:

- **Backend**: Node.js (Express)
- **Frontend**: React
- **SQL**: File `.sql` dùng để tạo cơ sở dữ liệu PostgreSQL

---

## 📁 Cấu trúc thư mục

```bash
garage/
├── backend/      # API server (Node.js + Express)
├── frontend/     # Giao diện người dùng (React)
├── sql/          # File SQL để khởi tạo cơ sở dữ liệu PostgreSQL
├── README.md     # Hướng dẫn sử dụng

---

## 🚀 Hướng dẫn chạy dự án

> **Yêu cầu**:
> - Node.js (tải tại: https://nodejs.org)
> - PostgreSQL (cài đặt DBMS để tạo CSDL)

### 1. Tạo cơ sở dữ liệu PostgreSQL

- Mở phần mềm quản lý PostgreSQL (pgAdmin, DBeaver, hoặc dùng psql CLI)
- Tạo một database mới `garage`
- Chạy file SQL trong thư mục `/sql` để tạo bảng và dữ liệu mẫu

### 2. Chạy Backend

cd backend
npm install           # Cài đặt dependencies
npm run dev           # Chạy server backend

### 3. Chạy Frontend

cd frontend
npm install           # Cài đặt dependencies
npm run dev           # Chạy ứng dụng React
