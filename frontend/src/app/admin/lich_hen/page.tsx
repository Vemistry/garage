"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setHours, setMinutes } from "date-fns";

interface LichHen {
  malh: number;
  bienso: string;
  makh: number;
  full_name?: string;
  phone: string;
  ngaygiohen: string;
  ghichu: string;
  trangthai: string;
  brand?: string;
  model?: string;
}

interface CarType {
  maxe: number;
  brand: string;
  model: string;
}

function formatDateTimeLocal(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

const LichHenPage = () => {
  const [lichHenList, setLichHenList] = useState<LichHen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [phoneInput, setPhoneInput] = useState<string>("");

  const [newLichHen, setNewLichHen] = useState({
    bienso: "",
    makh: 0,
    ngaygiohen: "",
    ghichu: "",
    trangthai: "Đã đặt",
  });

  const licensePlateRegex = /^\d{2}[A-Z]\d{5}$/;

  const fetchLichHen = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/lich_hen", {
        credentials: "include",
      });
      const data = await res.json();
      setLichHenList(data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi fetch lịch hẹn:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarTypes = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/cars_categorical", {
        credentials: "include",
      });
      const data = await res.json();
      setCarTypes(data || []);
    } catch (err) {
      console.error("❌ Lỗi khi fetch loại xe:", err);
    }
  };

  useEffect(() => {
    fetchLichHen();
    fetchCarTypes();
  }, []);

  const handleAddLichHen = async () => {
    const { bienso, makh, ngaygiohen } = newLichHen;

    if (!makh || makh === 0) {
      toast.error("❌ Vui lòng nhập số điện thoại hợp lệ để tìm khách hàng.");
      return;
    }

    if (bienso && !licensePlateRegex.test(bienso)) {
      toast.error("❌ Biển số xe không hợp lệ (VD: 51A12345).");
      return;
    }

    if (!ngaygiohen || !selectedBrand || !selectedModel) {
      toast.error("❌ Vui lòng điền đủ thông tin.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/lich_hen", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLichHen,
          brand: selectedBrand,
          model: selectedModel,
        }),
      });

      if (res.ok) {
        toast.success("✅ Đặt lịch thành công!");
        fetchLichHen();
        setShowAddForm(false);
        setNewLichHen({
          bienso: "",
          makh: 0,
          ngaygiohen: "",
          ghichu: "",
          trangthai: "Đã đặt",
        });
        setPhoneInput("");
        setSelectedDate(null);
        setSelectedBrand("");
        setSelectedModel("");
      } else {
        toast.error("❌ Thất bại: " + (await res.text()));
      }
    } catch (err) {
      toast.error("❌ Lỗi mạng khi thêm lịch hẹn.");
    }
  };

  const handleDeleteLichHen = async (id: number) => {
    if (!id || isNaN(id)) {
      toast.error("❌ ID lịch hẹn không hợp lệ.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/api/lich_hen/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("🗑️ Xóa lịch hẹn thành công!");
        fetchLichHen();
      } else {
        toast.error("❌ Không thể xoá lịch hẹn.");
      }
    } catch (err) {
      toast.error("❌ Lỗi khi xoá lịch hẹn.");
    }
  };

  const filteredModels = carTypes.filter((car) => car.brand === selectedBrand);

  return (
    <AdminLayout>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý lịch hẹn</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          ➕ Đặt lịch mới
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">➕ Đặt lịch mới</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="BSX (VD: 51A11111)"
              className="p-2 border rounded"
              value={newLichHen.bienso}
              onChange={(e) =>
                setNewLichHen({ ...newLichHen, bienso: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              inputMode="numeric"
              className="p-2 border rounded"
              value={phoneInput}
              onChange={async (e) => {
                const phone = e.target.value;
                if (!/^\d*$/.test(phone)) return;
                setPhoneInput(phone);

                if (phone.length === 10) {
                  try {
                    const res = await fetch(
                      `http://localhost:3001/api/users/find_by_phone/${phone}`,
                      {
                        credentials: "include",
                      }
                    );
                    const data = await res.json();
                    if (data && data.id) {
                      setNewLichHen((prev) => ({ ...prev, makh: data.id }));
                    } else {
                      toast.error(
                        "❌ Không tìm thấy khách hàng với số điện thoại này."
                      );
                      setNewLichHen((prev) => ({ ...prev, makh: 0 }));
                    }
                  } catch (err) {
                    toast.error(
                      "❌ Lỗi khi tìm khách hàng theo số điện thoại."
                    );
                  }
                } else {
                  setNewLichHen((prev) => ({ ...prev, makh: 0 }));
                }
              }}
            />
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedModel("");
              }}
              className="p-2 border rounded"
            >
              <option value="">-- Chọn hãng xe --</option>
              {[...new Set(carTypes.map((car) => car.brand))]
                .sort()
                .map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
            </select>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="p-2 border rounded"
              disabled={!selectedBrand}
            >
              <option value="">-- Chọn dòng xe --</option>
              {filteredModels.map((car) => (
                <option key={car.maxe} value={car.model}>
                  {car.model}
                </option>
              ))}
            </select>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                if (date) {
                  const rounded = new Date(date);
                  rounded.setMinutes(0, 0, 0);
                  setSelectedDate(rounded);
                  const formattedLocal = formatDateTimeLocal(rounded);
                  setNewLichHen({
                    ...newLichHen,
                    ngaygiohen: formattedLocal,
                  });
                }
              }}
              showTimeSelect
              timeIntervals={60}
              timeCaption="Giờ"
              dateFormat="dd/MM/yyyy HH'h'"
              placeholderText="Chọn ngày giờ hẹn"
              minTime={setHours(
                setMinutes(new Date(selectedDate || new Date()), 0),
                8
              )}
              maxTime={setHours(
                setMinutes(new Date(selectedDate || new Date()), 0),
                16
              )}
              className="p-2 border rounded w-full"
              withPortal
              popperClassName="z-50"
            />
            <input
              type="text"
              placeholder="Ghi chú"
              className="p-2 border rounded"
              value={newLichHen.ghichu}
              onChange={(e) =>
                setNewLichHen({ ...newLichHen, ghichu: e.target.value })
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddLichHen}
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

      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">STT</th>
            <th className="border px-4 py-2">Biển số</th>
            <th className="border px-4 py-2">Xe</th>
            <th className="border px-4 py-2">Tên KH</th>
            <th className="border px-4 py-2">SĐT</th>
            <th className="border px-4 py-2">Ngày giờ hẹn</th>
            <th className="border px-4 py-2">Ghi chú</th>
            <th className="border px-4 py-2">Trạng thái</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {lichHenList.map((lh, index) => (
            <tr key={`lichhen-${lh?.malh ?? `fallback-${index}`}`}>
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">{lh.bienso || "—"}</td>
              <td className="border px-4 py-2">
                {lh.brand && lh.model ? `${lh.brand} ${lh.model}` : "—"}
              </td>
              <td className="border px-4 py-2">{lh.full_name || "—"}</td>
              <td className="border px-4 py-2">{lh.phone.replace(
                    /^(\d{4})(\d{3})(\d{3})$/,
                    "$1.$2.$3"
                  ) || "—"}</td>
              <td className="border px-4 py-2">
                {new Date(lh.ngaygiohen).toLocaleString("vi-VN")}
              </td>
              <td className="border px-4 py-2">{lh.ghichu}</td>
              <td className="border px-4 py-2">{lh.trangthai}</td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => handleDeleteLichHen(lh.malh)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  🗑️ Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default LichHenPage;
