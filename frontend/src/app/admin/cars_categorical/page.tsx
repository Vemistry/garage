"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface cars_categorical {
  maxe: number;
  brand: string;
  model: string;
}

const CarsCategoricalPage = () => {
  const [cars_categoricals, setcars_categoricals] = useState<
    cars_categorical[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newcars_categorical, setNewcars_categorical] = useState({
    brand: "",
    model: "",
  });
  const [editcars_categorical, setEditcars_categorical] =
    useState<cars_categorical | null>(null);

  const fetchcars_categoricals = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/cars_categorical", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setcars_categoricals(data);
      } else {
        toast.error("❌ Lỗi khi tải danh sách xe!");
      }
    } catch (error) {
      toast.error("❌ Lỗi mạng khi tải danh sách xe!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchcars_categoricals();
  }, []);

  const handleAddcars_categorical = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/cars_categorical", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newcars_categorical),
      });

      if (res.ok) {
        toast.success("✅ Thêm thành công!");
        setShowAddForm(false);
        setNewcars_categorical({ brand: "", model: "" });
        fetchcars_categoricals();
      } else {
        const text = await res.text();
        toast.error("❌ Lỗi khi thêm: " + text);
      }
    } catch (error) {
      toast.error("❌ Lỗi mạng khi thêm xe.");
    }
  };

  const handleUpdatecars_categorical = async () => {
    if (!editcars_categorical) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/cars_categorical/${editcars_categorical.maxe}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editcars_categorical),
        }
      );

      if (res.ok) {
        toast.success("✅ Cập nhật thành công!");
        setShowEditForm(false);
        setEditcars_categorical(null);
        fetchcars_categoricals();
      } else {
        const text = await res.text();
        toast.error("❌ Lỗi khi cập nhật: " + text);
      }
    } catch (error) {
      toast.error("❌ Lỗi mạng khi cập nhật xe.");
    }
  };

  const handleDeletecars_categorical = async (id: number) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/cars_categorical/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        toast.success("🗑️ Xóa thành công!");
        fetchcars_categoricals();
      } else {
        toast.error("❌ Xóa thất bại!");
      }
    } catch (error) {
      toast.error("❌ Lỗi khi xóa xe.");
    }
  };

  const showDeleteConfirmToast = (car: cars_categorical) => {
    toast.info(
      ({ closeToast }) => (
        <div className="space-y-2">
          <p>
            Bạn có chắc muốn xoá xe <strong>{car.model}</strong> của hãng{" "}
            <strong>{car.brand}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                handleDeletecars_categorical(car.maxe);
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

  const handleEditClick = (car: cars_categorical) => {
    setEditcars_categorical(car);
    setShowEditForm(true);
  };

  const groupedByBrand = cars_categoricals.reduce(
    (acc: Record<string, cars_categorical[]>, car) => {
      if (!acc[car.brand]) acc[car.brand] = [];
      acc[car.brand].push(car);
      return acc;
    },
    {}
  );

  const sortedBrandKeys = Object.keys(groupedByBrand).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <AdminLayout>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý các loại xe</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          ➕ Thêm loại xe
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">➕ Thêm loại xe</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Hãng xe (Brand)"
              className="p-2 border rounded"
              value={newcars_categorical.brand}
              onChange={(e) =>
                setNewcars_categorical({
                  ...newcars_categorical,
                  brand: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Model"
              className="p-2 border rounded"
              value={newcars_categorical.model}
              onChange={(e) =>
                setNewcars_categorical({
                  ...newcars_categorical,
                  model: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddcars_categorical}
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

      {showEditForm && editcars_categorical && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">✏️ Sửa loại xe</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Hãng xe (Brand)"
              className="p-2 border rounded"
              value={editcars_categorical.brand}
              onChange={(e) =>
                setEditcars_categorical({
                  ...editcars_categorical,
                  brand: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Model"
              className="p-2 border rounded"
              value={editcars_categorical.model}
              onChange={(e) =>
                setEditcars_categorical({
                  ...editcars_categorical,
                  model: e.target.value,
                })
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleUpdatecars_categorical}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Cập nhật
            </button>
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditcars_categorical(null);
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {sortedBrandKeys.map((brand) => (
        <div key={brand} className="mb-8">
          <h2 className="text-xl font-bold mb-2">{brand.toUpperCase()}</h2>
          <table className="w-full table-fixed border  border-gray-300 ">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-1/4 border px-4 py-2">ID</th>
                <th className="w-1/2 border px-4 py-2">Model</th>
                <th className="w-1/4 border px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {groupedByBrand[brand].map((car) => (
                <tr key={car.maxe}>
                  <td className="border px-4 py-2 break-words">{car.maxe}</td>
                  <td className="border px-4 py-2 break-words">{car.model}</td>
                  <td className="border px-4 py-2 text-center">
                    <div className="inline-flex justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(car)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => showDeleteConfirmToast(car)}
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
        </div>
      ))}

      {!loading && cars_categoricals.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          Không có dữ liệu loại xe.
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500 py-4">
          Đang tải dữ liệu...
        </div>
      )}
    </AdminLayout>
  );
};

export default CarsCategoricalPage;
