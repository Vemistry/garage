"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Customer {
  id: number;
  full_name: string;
  phone: string;
  username: string;
  password: string;
  so_no: number;
  note: string;
}

const CustomerPage = () => {
  const [CustomerList, setCustomerList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    phone: "",
    username: "",
    password: "",
    so_no: 0,
    note: "",
  });
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const fetchCustomer = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users/customer", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();

        // ✅ Sửa tại đây
        const CustomerArray = data.data; // đây mới là array

        const CustomerData = CustomerArray.map((u: any) => ({
          id: u.id,
          full_name: u.full_name,
          note: u.note,
          phone: u.phone,
          username: u.username,
          so_no: u.so_no,
          password: "", // mật khẩu không show
        }));

        setCustomerList(CustomerData);
      } else {
        console.error(
          "Lỗi khi lấy dữ liệu Customer:",
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
    fetchCustomer();
  }, []);

  const handleAddCustomer = async () => {
    const { full_name, phone, username, password } = newCustomer;
    if (
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
      const res = await fetch("http://localhost:3001/api/users/customer", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      if (res.ok) {
        toast.success("✅ Thêm khách hàng thành công!");
        setShowAddForm(false);
        setNewCustomer({
          full_name: "",
          phone: "",
          username: "",
          password: "",
          so_no: 0,
          note: "",
        });
        fetchCustomer();
      } else {
        toast.error("❌ Lỗi khi thêm: " + (await res.text()));
      }
    } catch (err) {
      console.error("Lỗi mạng:", err);
      toast.error("❌ Lỗi mạng khi thêm khách hàng.");
    }
  };

  const handleUpdateCustomer = async () => {
    if (!editCustomer) return;
    const { full_name, phone, username } = editCustomer;
    if (!full_name.trim() || !phone.trim() || !username.trim()) {
      toast.error("❌ Vui lòng điền đủ thông tin.");
      return;
    }
    if (!/^0\d{9}$/.test(phone)) {
      toast.error("❌ Số điện thoại phải bắt đầu bằng 0 và đủ 10 số.");
      return;
    }
    try {
      const updatedData: any = {
        full_name: editCustomer.full_name,
        phone: editCustomer.phone,
        username: editCustomer.username,
        note: editCustomer.note,
      };
      if (editCustomer.password && editCustomer.password.trim() !== "") {
        updatedData.password = editCustomer.password;
      }
      const res = await fetch(
        `http://localhost:3001/api/users/${editCustomer.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );
      if (res.ok) {
        toast.success("✅ Cập nhật khách hàng thành công!");
        setShowEditForm(false);
        setEditCustomer(null);
        fetchCustomer();
      } else {
        toast.error("❌ Lỗi khi cập nhật: " + (await res.text()));
      }
    } catch (err) {
      console.error("Lỗi mạng:", err);
      toast.error("❌ Lỗi mạng khi cập nhật khách hàng.");
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("🗑️ Xóa khách hàng thành công!");
        fetchCustomer();
      } else {
        toast.error("❌ Xóa thất bại!");
      }
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error("❌ Lỗi khi xóa.");
    }
  };

  const showDeleteConfirmToast = (Customer: Customer) => {
    toast.info(
      ({ closeToast }) => (
        <div className="space-y-2">
          <p>
            Bạn có chắc muốn xoá <strong>{Customer.full_name}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                handleDeleteCustomer(Customer.id);
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

  const handleEditClick = (Customer: Customer) => {
    setEditCustomer({
      id: Customer.id,
      full_name: Customer.full_name,
      phone: Customer.phone,
      username: Customer.username || "",
      password: "",
      so_no: Customer.so_no,
      note: Customer.note || "",
    });
    setShowEditForm(true);
  };

  return (
    <AdminLayout>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          ➕ Thêm khách hàng
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">➕ Thêm khách hàng</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Họ và tên"
              className="p-2 border rounded"
              value={newCustomer.full_name}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, full_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="SĐT"
              className="p-2 border rounded"
              value={newCustomer.phone}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, phone: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Tên đăng nhập"
              className="p-2 border rounded"
              value={newCustomer.username}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, username: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="p-2 border rounded"
              value={newCustomer.password}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, password: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Ghi chú"
              className="p-2 border rounded"
              value={newCustomer.note}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, note: e.target.value })
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddCustomer}
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

      {showEditForm && editCustomer && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">✏️ Sửa khách hàng</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Họ tên"
              className="p-2 border rounded"
              value={editCustomer.full_name}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, full_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="SĐT"
              className="p-2 border rounded"
              value={editCustomer.phone}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, phone: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Tên đăng nhập"
              className="p-2 border rounded"
              value={editCustomer.username}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, username: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Mật khẩu mới (bỏ trống nếu không đổi)"
              className="p-2 border rounded"
              value={editCustomer.password}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, password: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Ghi chú"
              className="p-2 border rounded"
              value={editCustomer.note}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, note: e.target.value })
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleUpdateCustomer}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Cập nhật
            </button>
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditCustomer(null);
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
            <th className="border px-4 py-2">Họ tên</th>
            <th className="border px-4 py-2">SĐT</th>
            <th className="border px-4 py-2">Số nợ</th>
            <th className="border px-4 py-2">Ghi chú</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {CustomerList.slice()
            .sort((a, b) => {
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
            .map((Customer, index) => (
              <tr key={Customer.id}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{Customer.full_name}</td>
                <td className="border px-4 py-2">
                  {Customer.phone.replace(
                    /^(\d{4})(\d{3})(\d{3})$/,
                    "$1.$2.$3"
                  )}
                </td>
                <td className="border px-4 py-2 text-right">
                  <div>
                    {Customer.so_no.toLocaleString("vi-VN")}
                    <div className="text-xs text-gray-500">VNĐ</div>
                  </div>
                </td>
                <td className="border px-4 py-2">{Customer.note}</td>
                <td className="border px-4 py-2 text-center">
                  <div className="inline-flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(Customer)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => showDeleteConfirmToast(Customer)}
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

export default CustomerPage;
