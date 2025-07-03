"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Vehicle {
  bienso: string;
  makh: number;
  brand: string;
  model: string;
  full_name: string;
  phone: string;
  ghichu?: string;
  originalBienso?: string; // 👈 Thêm dòng này để TypeScript không báo lỗi
}

interface CarType {
  maxe: number;
  brand: string;
  model: string;
}

const CarsPage = () => {
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const [newVehicle, setNewVehicle] = useState({
    bienso: "",
    phone: "",
    makh: 0,
    brand: "",
    model: "",
    ghichu: "",
  });

  const licensePlateRegex = /^\d{2}[A-Z]\d{5}$/;

  const fetchVehicles = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/cars", {
        credentials: "include",
      });
      const data = await res.json();
      setVehicleList(data.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi fetch xe:", err);
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
    fetchVehicles();
    fetchCarTypes();
  }, []);

  useEffect(() => {
    if (editVehicle) {
      setSelectedBrand(editVehicle.brand || "");
      setSelectedModel(editVehicle.model || "");
    }
  }, [editVehicle]);

  const handleAddVehicle = async () => {
    const { bienso, phone, ghichu, makh } = newVehicle;

    if (!bienso || !licensePlateRegex.test(bienso)) {
      toast.error("❌ Biển số xe không hợp lệ (VD: 51A12345).");
      return;
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      toast.error("❌ Số điện thoại không hợp lệ.");
      return;
    }

    if (!selectedBrand || !selectedModel) {
      toast.error("❌ Vui lòng chọn hãng và dòng xe.");
      return;
    }

    // ✅ Tìm maxe từ brand + model
    const matchedCar = carTypes.find(
      (car) => car.brand === selectedBrand && car.model === selectedModel
    );

    if (!matchedCar) {
      toast.error("❌ Không tìm thấy loại xe tương ứng.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/cars", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bienso: bienso.toUpperCase(),
          phone,
          ghichu,
          makh,
          maxe: matchedCar.maxe, // 👈 Đúng key
        }),
      });

      if (res.ok) {
        toast.success("✅ Thêm xe thành công!");
        fetchVehicles();
        setShowAddForm(false);
        setNewVehicle({
          bienso: "",
          phone: "",
          makh: 0,
          brand: "",
          model: "",
          ghichu: "",
        });
        setPhoneInput("");
        setSelectedBrand("");
        setSelectedModel("");
      } else {
        const error = await res.json();
        toast.error("❌ Thất bại: " + error.message);
      }
    } catch (err) {
      toast.error("❌ Lỗi mạng khi thêm xe.");
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editVehicle) return;

    const { bienso, phone, ghichu } = editVehicle;

    if (!phone || !/^\d{10}$/.test(phone)) {
      toast.error("❌ Số điện thoại không hợp lệ.");
      return;
    }

    const matchedCar = carTypes.find(
      (car) =>
        car.brand === (selectedBrand || editVehicle.brand) &&
        car.model === (selectedModel || editVehicle.model)
    );

    if (!matchedCar) {
      toast.error("❌ Không tìm thấy loại xe phù hợp.");
      return;
    }

    const newBienso = editVehicle.bienso.trim().toUpperCase();
    if (!/^\d{2}[A-Z]\d{5}$/.test(newBienso)) {
      toast.error("❌ Biển số không đúng định dạng (VD: 12A34567)");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3001/api/cars/${editVehicle.originalBienso}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: phone.trim(),
            newBienso,
            maxe: matchedCar.maxe,
            ghichu,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        toast.error("❌ Lỗi cập nhật: " + error.message);
        return;
      }

      const updatedVehicle = await res.json();
      const updatedList = vehicleList.map((v, i) =>
        i === editIndex ? updatedVehicle : v
      );
      setVehicleList(updatedList);
      setEditVehicle(null);
      setEditIndex(null);
      setShowEditForm(false);
      toast.success("✅ Cập nhật xe thành công!");
      await fetchVehicles();
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi cập nhật xe.");
    }
  };

  const handleDelete = async (bienso: string) => {
    if (!confirm(`Bạn có chắc muốn xoá xe biển số ${bienso}?`)) return;

    try {
      const res = await fetch(`http://localhost:3001/api/cars/${bienso}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("🗑️ Đã xoá xe thành công!");
        await fetchVehicles();
        setVehicleList((prev) => prev.filter((v) => v.bienso !== bienso));
      } else {
        const error = await res.json();
        toast.error("❌ Lỗi xoá xe: " + error.message);
      }
    } catch (err) {
      toast.error("❌ Lỗi xoá xe.");
    }
  };

  const filteredModels = carTypes.filter((car) => car.brand === selectedBrand);

  return (
    <AdminLayout>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý xe</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          ➕ Thêm xe mới
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">➕ Thêm xe mới</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Biển số xe (VD: 51A12345)"
              className="p-2 border rounded"
              value={newVehicle.bienso}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, bienso: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Số điện thoại khách hàng"
              inputMode="numeric"
              className="p-2 border rounded"
              value={phoneInput}
              onChange={async (e) => {
                const phone = e.target.value;
                if (!/^\d*$/.test(phone)) return;
                setPhoneInput(phone);
                setNewVehicle((prev) => ({ ...prev, phone }));

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
                      setNewVehicle((prev) => ({ ...prev, makh: data.id }));
                    } else {
                      toast.error("❌ Không tìm thấy khách hàng.");
                      setNewVehicle((prev) => ({ ...prev, makh: 0 }));
                    }
                  } catch (err) {
                    toast.error("❌ Lỗi khi tìm khách hàng.");
                  }
                } else {
                  setNewVehicle((prev) => ({ ...prev, makh: 0 }));
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
            <textarea
              placeholder="Ghi chú"
              className="p-2 border rounded col-span-2"
              value={newVehicle.ghichu}
              onChange={(e) =>
                setNewVehicle({ ...newVehicle, ghichu: e.target.value })
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddVehicle}
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

      {showEditForm && editVehicle && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">✏️ Sửa thông tin xe</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Biển số xe mới"
              value={editVehicle.bienso || ""}
              onChange={(e) =>
                setEditVehicle((prev) =>
                  prev
                    ? { ...prev, bienso: e.target.value.toUpperCase() }
                    : null
                )
              }
              className="p-2 border rounded"
            />

            <input
              type="text"
              inputMode="numeric"
              placeholder="Số điện thoại khách hàng"
              className="p-2 border rounded"
              value={editVehicle.phone}
              onChange={async (e) => {
                const phone = e.target.value;
                if (!/^\d*$/.test(phone)) return;
                setEditVehicle((prev) => (prev ? { ...prev, phone } : null));

                if (phone.length === 10) {
                  try {
                    const res = await fetch(
                      `http://localhost:3001/api/users/find_by_phone/${phone}`,
                      { credentials: "include" }
                    );
                    const data = await res.json();
                    if (data && data.id) {
                      setEditVehicle((prev) =>
                        prev ? { ...prev, makh: data.id } : null
                      );
                    } else {
                      toast.error("❌ Không tìm thấy khách hàng.");
                      setEditVehicle((prev) =>
                        prev ? { ...prev, makh: 0 } : null
                      );
                    }
                  } catch (err) {
                    toast.error("❌ Lỗi khi tìm khách hàng.");
                  }
                } else {
                  setEditVehicle((prev) =>
                    prev ? { ...prev, makh: 0 } : null
                  );
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
              {carTypes
                .filter((car) => car.brand === selectedBrand)
                .map((car) => (
                  <option key={car.maxe} value={car.model}>
                    {car.model}
                  </option>
                ))}
            </select>

            <textarea
              placeholder="Ghi chú"
              className="p-2 border rounded col-span-2"
              value={editVehicle?.ghichu || ""}
              onChange={(e) =>
                setEditVehicle((prev) =>
                  prev ? { ...prev, ghichu: e.target.value } : null
                )
              }
            />
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleUpdateVehicle}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Lưu thay đổi
            </button>
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditVehicle(null);
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
            <th className="border px-4 py-2">Biển số</th>
            <th className="border px-4 py-2">Xe</th>
            <th className="border px-4 py-2">Tên KH</th>
            <th className="border px-4 py-2">SĐT</th>
            <th className="border px-4 py-2">Ghi chú</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {vehicleList.map((vehicle, index) => (
            <tr key={vehicle.bienso}>
              <td className="border px-4 py-2 text-center">{index + 1}</td>
              <td className="border px-4 py-2">{vehicle.bienso}</td>
              <td className="border px-4 py-2">
                {vehicle.brand} {vehicle.model}
              </td>
              <td className="border px-4 py-2">{vehicle.full_name}</td>
              <td className="border px-4 py-2">{vehicle.phone}</td>
              <td className="border px-4 py-2">{vehicle.ghichu || ""}</td>
              <td className="border px-4 py-2 text-center">
                <div className="inline-flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setEditIndex(index);
                      setEditVehicle({
                        ...vehicle,
                        originalBienso: vehicle.bienso,
                      }); // 👈 dòng cần thêm
                      setSelectedBrand(vehicle.brand);
                      setSelectedModel(vehicle.model);
                      setShowEditForm(true);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.bienso)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                  >
                    🗑️ Xoá
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

export default CarsPage;
