"use client";

import React, { useState } from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [showModal, setShowModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navItems = [
    { label: "Trang chủ", icon: "\uD83C\uDFE0", path: "/admin" },
    { label: "Quản lý nhân viên", icon: "\uD83D\uDC65", path: "/admin/staff" },
    {
      label: "Quản lý khách hàng",
      icon: "\uD83D\uDC64",
      path: "/admin/customers",
    },
    { label: "Quản lý xe", icon: "\uD83D\uDE97", path: "/admin/cars" },
    { label: "Thư viện xe", icon: "📖", path: "/admin/cars_categorical" },
    { label: "Lịch sửa chữa", icon: "\uD83D\uDCC5", path: "/admin/lich_hen" },
    { label: "Phiếu sửa chữa", icon: "🧾", path: "/admin/phieu_sua_chua" },
    { label: "Quản lý dịch vụ", icon: "🧰", path: "/admin/services" },
    { label: "Quản lý kho", icon: "\uD83D\uDEE0\uFE0F", path: "/admin/kho" },
    {
      label: "Báo cáo doanh thu",
      icon: "\uD83D\uDCCA",
      path: "/admin/doanh_thu",
    },
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
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
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
              className="p-4 flex items-center cursor-pointer hover:bg-gray-700"
            >
              <span className="mr-2">🔚</span> Đăng xuất
            </li>
          </ul>
        </nav>
      </div>

      <div className="flex-1 p-6 overflow-auto">{children}</div>

      {showModal && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-xl rounded-lg w-96 p-4 z-50 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-red-500 text-lg"
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
            className="w-full p-2 border rounded mb-2"
          />

          {error && <p className="text-red-600 mb-2">{error}</p>}
          {success && <p className="text-green-600 mb-2">{success}</p>}

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

export default AdminLayout;
