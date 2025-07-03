"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Staff {
  id: number;
  chucvu: string;
  full_name: string;
  phone: string;
  username: string;
  password: string;
  note: string;
}

const StaffPage = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    chucvu: "",
    full_name: "",
    phone: "",
    username: "",
    password: "",
    note: "",
  });
  const [editStaff, setEditStaff] = useState<Staff | null>(null);

  const fetchStaff = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users/staff", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();

        // ✅ Sửa tại đây
        const staffArray = data.data; // đây mới là array

        const staffData = staffArray.map((u: any) => ({
          id: u.id,
          chucvu: u.chucvu,
          full_name: u.full_name,
          note: u.note,
          phone: u.phone,
          username: u.username,
          password: "", // mật khẩu không show
        }));

        setStaffList(staffData);
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

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async () => {
    const { chucvu, full_name, phone, username, password } = newStaff;
    if (
      !chucvu.trim() ||
      !full_name.trim() ||
      !phone.trim() ||
      !username.trim() ||
      !password.trim()
    ) {
      toast.error("❌ Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    if (!/^0\d{9}$/.test(phone)) {
      toast.error("❌ Số điện thoại phải bắt đầu bằng 0 và đủ 10 số.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/api/users/staff", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });
      if (res.ok) {
        toast.success("✅ Thêm nhân viên thành công!");
        setShowAddForm(false);
        setNewStaff({
          chucvu: "",
          full_name: "",
          phone: "",
          username: "",
          password: "",
          note: "",
        });
        fetchStaff();
      } else {
        toast.error("❌ Lỗi khi thêm: " + (await res.text()));
      }
    } catch (err) {
      console.error("Lỗi mạng:", err);
      toast.error("❌ Lỗi mạng khi thêm nhân viên.");
    }
  };

  const handleUpdateStaff = async () => {
    if (!editStaff) return;
    const { chucvu, full_name, phone, username } = editStaff;
    if (
      !chucvu.trim() ||
      !full_name.trim() ||
      !phone.trim() ||
      !username.trim()
    ) {
      toast.error("❌ Vui lòng điền đủ thông tin.");
      return;
    }
    if (!/^0\d{9}$/.test(phone)) {
      toast.error("❌ Số điện thoại phải bắt đầu bằng 0 và đủ 10 số.");
      return;
    }
    try {
      const updatedData: any = {
        chucvu: editStaff.chucvu,
        full_name: editStaff.full_name,
        phone: editStaff.phone,
        username: editStaff.username,
        note: editStaff.note,
      };
      if (editStaff.password && editStaff.password.trim() !== "") {
        updatedData.password = editStaff.password;
      }
      const res = await fetch(
        `http://localhost:3001/api/users/${editStaff.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );
      if (res.ok) {
        toast.success("✅ Cập nhật nhân viên thành công!");
        setShowEditForm(false);
        setEditStaff(null);
        fetchStaff();
      } else {
        toast.error("❌ Lỗi khi cập nhật: " + (await res.text()));
      }
    } catch (err) {
      console.error("Lỗi mạng:", err);
      toast.error("❌ Lỗi mạng khi cập nhật nhân viên.");
    }
  };

  const handleDeleteStaff = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("🗑️ Xóa nhân viên thành công!");
        fetchStaff();
      } else {
        toast.error("❌ Xóa thất bại!");
      }
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error("❌ Lỗi khi xóa.");
    }
  };

  const showDeleteConfirmToast = (staff: Staff) => {
    toast.info(
      ({ closeToast }) => (
        <div className="space-y-2">
          <p>
            Bạn có chắc muốn xoá <strong>{staff.full_name}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                handleDeleteStaff(staff.id);
                closeToast();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              ✅ Xác nhận
            </button>
            <button
              onClick={closeToast}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
            >
              ❌ Huỷ
            </button>
          </div>
        </div>
      ),
      {
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const handleEditClick = (staff: Staff) => {
    setEditStaff({
      id: staff.id,
      chucvu: staff.chucvu,
      full_name: staff.full_name,
      phone: staff.phone,
      username: staff.username || "",
      password: "",
      note: staff.note || "",
    });
    setShowEditForm(true);
  };

  return (
    <AdminLayout>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          ➕ Thêm nhân viên
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">➕ Thêm nhân viên</h2>
          <div className="grid grid-cols-2 gap-4">
            <select
              className="p-2 border rounded"
              value={newStaff.chucvu}
              onChange={(e) =>
                setNewStaff({ ...newStaff, chucvu: e.target.value })
              }
            >
              <option value="">-- Chọn chức vụ --</option>
              <option value="NV">Nhân viên</option>
              <option value="KTV">Kỹ thuật viên</option>
            </select>
            <input
              type="text"
              placeholder="Họ và tên"
              className="p-2 border rounded"
              value={newStaff.full_name}
              onChange={(e) =>
                setNewStaff({ ...newStaff, full_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="SĐT"
              className="p-2 border rounded"
              value={newStaff.phone}
              onChange={(e) =>
                setNewStaff({ ...newStaff, phone: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Tên đăng nhập"
              className="p-2 border rounded"
              value={newStaff.username}
              onChange={(e) =>
                setNewStaff({ ...newStaff, username: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="p-2 border rounded"
              value={newStaff.password}
              onChange={(e) =>
                setNewStaff({ ...newStaff, password: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Ghi chú"
              className="p-2 border rounded"
              value={newStaff.note}
              onChange={(e) =>
                setNewStaff({ ...newStaff, note: e.target.value })
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddStaff}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Lưu
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {showEditForm && editStaff && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">✏️ Sửa nhân viên</h2>
          <div className="grid grid-cols-2 gap-4">
            <select
              className="p-2 border rounded"
              value={editStaff.chucvu}
              onChange={(e) =>
                setEditStaff({ ...editStaff, chucvu: e.target.value })
              }
            >
              <option value="">-- Chọn chức vụ --</option>
              <option value="NV">Nhân viên</option>
              <option value="KTV">Kỹ thuật viên</option>
            </select>
            <input
              type="text"
              placeholder="Họ tên"
              className="p-2 border rounded"
              value={editStaff.full_name}
              onChange={(e) =>
                setEditStaff({ ...editStaff, full_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="SĐT"
              className="p-2 border rounded"
              value={editStaff.phone}
              onChange={(e) =>
                setEditStaff({ ...editStaff, phone: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Tên đăng nhập"
              className="p-2 border rounded"
              value={editStaff.username}
              onChange={(e) =>
                setEditStaff({ ...editStaff, username: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Mật khẩu mới (bỏ trống nếu không đổi)"
              className="p-2 border rounded"
              value={editStaff.password}
              onChange={(e) =>
                setEditStaff({ ...editStaff, password: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Ghi chú"
              className="p-2 border rounded"
              value={editStaff.note}
              onChange={(e) =>
                setEditStaff({ ...editStaff, note: e.target.value })
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleUpdateStaff}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Cập nhật
            </button>
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditStaff(null);
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">STT</th>
            <th className="border px-4 py-2">Chức vụ</th>
            <th className="border px-4 py-2">Họ tên</th>
            <th className="border px-4 py-2">SĐT</th>
            <th className="border px-4 py-2">Ghi chú</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {staffList
            .slice()
            .sort((a, b) => {
              // 1. So sánh theo chức vụ trước
              const chucvuCompare = a.chucvu.localeCompare(b.chucvu, "vi");
              if (chucvuCompare !== 0) return chucvuCompare;

              // 2. Nếu cùng chức vụ thì so sánh theo tên (tên chính, không phải họ)
              const getFirstName = (fullName: string) => {
                const parts = fullName.trim().split(/\s+/);
                return parts[parts.length - 1]; // lấy tên cuối
              };

              const tenA = getFirstName(a.full_name);
              const tenB = getFirstName(b.full_name);

              if (tenA === tenB) {
                // Nếu tên giống nhau, fallback sắp xếp full_name để giữ ổn định
                return a.full_name.localeCompare(b.full_name, "vi");
              }

              return tenA.localeCompare(tenB, "vi");
            })
            .map((staff, index) => (
              <tr key={staff.id}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{staff.chucvu}</td>
                <td className="border px-4 py-2">{staff.full_name}</td>
                <td className="border px-4 py-2">
                  {staff.phone.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1.$2.$3")}
                </td>
                <td className="border px-4 py-2">{staff.note}</td>
                <td className="border px-4 py-2 text-center">
                  <div className="inline-flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(staff)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => showDeleteConfirmToast(staff)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default StaffPage;
