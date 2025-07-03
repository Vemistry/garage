"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RepairReceiptDetail from "@/components/RepairReceiptDetail";

interface PhieuSuaChua {
  maphieu: number;
  bienso: string;
  phone: string;
  nv_tiepnhan: string;
  nv_suachua: string;
  tg_tiepnhan: string;
  tg_hoanthanh?: string;
  tongtien?: number;
  trangthai?: string;
}

const PhieuSuaChuaPage = () => {
  const [phieuList, setPhieuList] = useState<PhieuSuaChua[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [nvTiepNhanList, setNvTiepNhanList] = useState<any[]>([]);
  const [nvSuaChuaList, setNvSuaChuaList] = useState<any[]>([]);
  const [newPhieu, setNewPhieu] = useState({
    bienso: "",
    makh: 0,
    nv_tiepnhan: 0,
    nv_suachua: 0,
  });

  const [selectedMaphieu, setSelectedMaphieu] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetchStaff();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/phieu_sua_chua", {
        credentials: "include",
      });
      const data = await res.json();
      setPhieuList(data.data || []);
    } catch (err) {
      console.error("Lỗi fetch phiếu sửa chữa:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users/staff", {
        credentials: "include",
      });
      const result = await res.json();

      if (Array.isArray(result.data)) {
        const allStaff = result.data;
        setNvTiepNhanList(allStaff.filter((s: any) => s.chucvu === "NV"));
        setNvSuaChuaList(allStaff.filter((s: any) => s.chucvu === "KTV"));
      }
    } catch (err) {
      console.error("Lỗi fetch nhân viên:", err);
    }
  };

  const handleAdd = async () => {
    const { bienso, makh, nv_tiepnhan, nv_suachua } = newPhieu;

    if (!bienso || !makh || !nv_tiepnhan || !nv_suachua) {
      toast.error("❌ Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const requestBody = {
      bienso,
      nv_tiepnhan,
      nv_suachua,
      tgtiepnhan: new Date().toISOString(),
      trangthaithanhtoan: "Chưa thanh toán",
    };

    try {
      const res = await fetch("http://localhost:3001/api/phieu_sua_chua", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        toast.success("✅ Tạo phiếu thành công!");
        setShowAddForm(false);
        fetchData();
        setNewPhieu({ bienso: "", makh: 0, nv_tiepnhan: 0, nv_suachua: 0 });
        setPhoneInput("");
      } else {
        const text = await res.text();
        toast.error("❌ Lỗi: " + text);
      }
    } catch (err) {
      toast.error("❌ Lỗi mạng khi tạo phiếu.");
    }
  };

  const handleViewDetail = (maphieu: number) => {
    setSelectedMaphieu(String(maphieu));
  };

  return (
    <AdminLayout>
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Phiếu sửa chữa</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          ➕ Tạo phiếu
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-100 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">➕ Tạo phiếu</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Biển số xe"
              className="p-2 border rounded"
              value={newPhieu.bienso}
              onChange={(e) =>
                setNewPhieu((prev) => ({ ...prev, bienso: e.target.value }))
              }
            />
            <input
              type="text"
              placeholder="SĐT khách hàng"
              className="p-2 border rounded"
              value={phoneInput}
              onChange={async (e) => {
                const phone = e.target.value;
                if (!/^[0-9]*$/.test(phone)) return;
                setPhoneInput(phone);

                if (phone.length === 10) {
                  const res = await fetch(
                    `http://localhost:3001/api/users/find_by_phone/${phone}`,
                    { credentials: "include" }
                  );
                  const data = await res.json();
                  if (data?.id) {
                    setNewPhieu((prev) => ({ ...prev, makh: data.id }));
                  } else {
                    toast.error("❌ Không tìm thấy khách hàng.");
                  }
                }
              }}
            />
            <select
              value={newPhieu.nv_tiepnhan}
              onChange={(e) =>
                setNewPhieu((prev) => ({
                  ...prev,
                  nv_tiepnhan: parseInt(e.target.value),
                }))
              }
              className="border rounded p-2"
            >
              <option value={0}>-- Chọn nhân viên tiếp nhận --</option>
              {nvTiepNhanList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.full_name} ({staff.chucvu})
                </option>
              ))}
            </select>
            <select
              value={newPhieu.nv_suachua}
              onChange={(e) =>
                setNewPhieu((prev) => ({
                  ...prev,
                  nv_suachua: parseInt(e.target.value),
                }))
              }
              className="border rounded p-2"
            >
              <option value={0}>-- Chọn nhân viên sửa chữa --</option>
              {nvSuaChuaList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.full_name} ({staff.chucvu})
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Lưu
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <table className="table-auto w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">STT</th>
            <th className="border px-4 py-2">Biển số</th>
            <th className="border px-4 py-2">SĐT</th>
            <th className="border px-4 py-2">NV tiếp nhận</th>
            <th className="border px-4 py-2">NV sửa chữa</th>
            <th className="border px-4 py-2">TG tiếp nhận</th>
            <th className="border px-4 py-2">TG hoàn thành</th>
            <th className="border px-4 py-2">Tổng tiền</th>
            <th className="border px-4 py-2">Trạng thái</th>
            <th className="border px-4 py-2">Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {phieuList.map((psc, idx) => (
            <tr key={psc.maphieu}>
              <td className="border px-4 py-2">{idx + 1}</td>
              <td className="border px-4 py-2">{psc.bienso}</td>
              <td className="border px-4 py-2">{psc.phone}</td>
              <td className="border px-4 py-2">{psc.nv_tiepnhan}</td>
              <td className="border px-4 py-2">{psc.nv_suachua}</td>
              <td className="border px-4 py-2">
                {new Date(psc.tg_tiepnhan).toLocaleString("vi-VN")}
              </td>
              <td className="border px-4 py-2">
                {psc.tg_hoanthanh
                  ? new Date(psc.tg_hoanthanh).toLocaleString("vi-VN")
                  : "—"}
              </td>
              <td className="border px-4 py-2 text-right">
                {psc.tongtien?.toLocaleString("vi-VN") || "0"}
              </td>
              <td className="border px-4 py-2">
                {psc.trangthai || "Chưa thanh toán"}
              </td>
              <td className="border px-4 py-2 text-center">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleViewDetail(psc.maphieu)}
                >
                  👁️ Chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 👇 Hiển thị popup chi tiết phiếu */}
      {selectedMaphieu && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <RepairReceiptDetail
            maphieu={selectedMaphieu}
            onClose={() => setSelectedMaphieu(null)}
          />
        </div>
      )}
    </AdminLayout>
  );
};

export default PhieuSuaChuaPage;
