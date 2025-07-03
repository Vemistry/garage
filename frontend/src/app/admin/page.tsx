"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [showModal, setShowModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [staff, setStaff] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStaff = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users/staff", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const staffArray = data.data;
        const staffNames = staffArray.map((u: any) => u.full_name);
        setStaff(staffNames);
      } else {
        console.error(
          "Lỗi khi lấy dữ liệu staff:",
          res.status,
          await res.text()
        );
      }
    } catch (err) {
      console.error("Lỗi mạng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      return setError("Vui lòng điền đầy đủ thông tin.");
    }
    if (newPassword.length < 6) {
      return setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
    }
    if (newPassword !== confirmPassword) {
      return setError("Xác nhận mật khẩu không khớp.");
    }

    try {
      const res = await fetch(
        "http://localhost:3001/api/users/change-password",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSuccess("Đổi mật khẩu thành công!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setShowModal(false), 1500);
      } else {
        setError(data.message || "Lỗi đổi mật khẩu.");
      }
    } catch (err) {
      setError("Lỗi kết nối đến server.");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const navItems = [
    { label: "Trang chủ", icon: "🏠", path: "/admin" },
    { label: "Quản lý nhân viên", icon: "👥", path: "/admin/staff" },
    { label: "Quản lý khách hàng", icon: "👤", path: "/admin/customers" },
    { label: "Quản lý xe", icon: "🚗", path: "/admin/cars" },
    { label: "Thư viện xe", icon: "📖", path: "/admin/cars_categorical" },
    { label: "Lịch sửa chữa", icon: "📅", path: "/admin/lich_hen" },
    { label: "Phiếu sửa chữa", icon: "🧾", path: "/admin/phieu_sua_chua" },
    { label: "Quản lý dịch vụ", icon: "🧰", path: "/admin/services" },
    { label: "Quản lý kho", icon: "🛠️", path: "/admin/kho" },
    { label: "Báo cáo doanh thu", icon: "📊", path: "/admin/doanh_thu" },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        console.error("Lỗi khi logout:", await res.text());
      }
    } catch (err) {
      console.error("Lỗi logout:", err);
    }
  };

  const cars: string[] = [];
  const schedules: string[] = [];
  const inventory: string[] = [];
  const revenue = [{ month: "Tháng 6/2025", amount: "50,000,000 VNĐ" }];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-7 text-3xl font-bold">Auto Garage</div>
        <nav className="mt-4 flex-1">
          <ul>
            {navItems.map((item, index) => (
              <li
                key={index}
                onClick={() => router.push(item.path)}
                className={`p-4 flex items-center cursor-pointer hover:bg-gray-700 ${
                  pathname === item.path ? "bg-gray-700 font-bold" : ""
                }`}
              >
                <span className="mr-2">{item.icon}</span> {item.label}
              </li>
            ))}

            <li
              onClick={() => setShowModal(true)}
              className="p-4 flex items-center cursor-pointer hover:bg-gray-700 border-t border-gray-700"
            >
              <span className="mr-2">🔒</span> Đổi mật khẩu
            </li>

            <li
              onClick={handleLogout}
              className="p-4 flex items-center cursor-pointer hover:bg-gray-700 border-t border-gray-700"
            >
              <span className="mr-2">🚪</span> Đăng xuất
            </li>
          </ul>
        </nav>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Tile
            title="Quản lý nhân viên"
            value={staff.length.toString()}
            valueLabel="Số nhân viên"
            icon="👥"
            items={[]}
            color="bg-green-500"
            onClick={() => router.push("/admin/staff")}
          />
          <Tile
            title="Quản lý xe"
            value={cars.length.toString()}
            valueLabel="Số xe đang quản lý"
            icon="🚗"
            items={[]}
            color="bg-blue-500"
            onClick={() => router.push("/admin/cars")}
          />
          <Tile
            title="Lịch sửa chữa"
            value={schedules.length.toString()}
            valueLabel="Số lịch sửa chữa"
            icon="📅"
            items={[]}
            color="bg-red-500"
            onClick={() => router.push("/admin/lich_hen")}
          />
          <Tile
            title="Quản lý kho"
            value={inventory.length.toString()}
            valueLabel="Số phụ tùng"
            icon="🛠️"
            items={[]}
            color="bg-blue-400"
            onClick={() => router.push("/admin/kho")}
          />
          <Tile
            title="Báo cáo doanh thu"
            value={revenue[0]?.amount || "0 VNĐ"}
            valueLabel={revenue[0]?.month || "Chưa có"}
            icon="📊"
            items={[]}
            color="bg-gray-500"
            onClick={() => router.push("/admin/doanh_thu")}
          />
        </div>
      </div>

      {/* Modal đổi mật khẩu */}
      {showModal && (
        <div className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-96 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-red-500 text-xl"
            >
              ×
            </button>
          </div>

          <input
            type="password"
            placeholder="Mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded mb-3"
          />

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleChangePassword}
              className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Đổi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface TileProps {
  title: string;
  value: string;
  valueLabel: string;
  icon: string;
  items: string[];
  color: string;
  onClick?: () => void;
}

const Tile: React.FC<TileProps> = ({
  title,
  value,
  valueLabel,
  icon,
  items,
  color,
  onClick,
}) => (
  <div
    className={`${color} text-white p-4 rounded-lg shadow-md cursor-pointer`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <h2 className="tile-header">{title}</h2>
      <span className="text-3xl">{icon}</span>
    </div>
    <p className="tile-number text-3xl font-bold mt-2">{value}</p>
    <p className="text-sm font-medium opacity-90 mb-2">{valueLabel}</p>
  </div>
);

export default AdminDashboard;
