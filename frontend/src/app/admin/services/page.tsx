"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Service {
  madv: number;
  tendv: string;
  description?: string;
}

const ServicePage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState<Partial<Service>>({
    tendv: "",
    description: "",
  });
  const [editService, setEditService] = useState<Service | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/services", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Lỗi khi gọi API");

      const data = await res.json();
      console.log(data); // Xem thử có madv và tendv không
      if (Array.isArray(data)) {
        setServices(data);
      } else {
        console.error("❌ API không trả về mảng:", data);
        setServices([]);
      }
    } catch (err) {
      console.error("Lỗi khi fetch dịch vụ:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.tendv)
      return toast.error("Tên dịch vụ không được để trống");

    const res = await fetch("http://localhost:3001/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newService),
    });

    if (res.ok) {
      toast.success("Đã thêm dịch vụ");
      setNewService({ tendv: "", description: "" });
      setShowAddForm(false);
      fetchServices();
    } else {
      toast.error("Lỗi khi thêm dịch vụ");
    }
  };

  const handleEditClick = (service: Service) => {
    setEditService(service);
    setShowEditForm(true);
  };

  const handleUpdateService = async () => {
    if (!editService?.tendv)
      return toast.error("Tên dịch vụ không được để trống");

    const res = await fetch(
      `http://localhost:3001/api/services/${editService.madv}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editService),
      }
    );

    if (res.ok) {
      toast.success("Đã cập nhật dịch vụ");
      setShowEditForm(false);
      setEditService(null);
      fetchServices();
    } else {
      toast.error("Lỗi khi cập nhật dịch vụ");
    }
  };

  const handleDeleteService = async (madv: number) => {
    const res = await fetch(`http://localhost:3001/api/services/${madv}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      toast.success("Đã xoá dịch vụ");
      fetchServices();
    } else {
      toast.error("Lỗi khi xoá dịch vụ");
    }
  };

  return (
    <AdminLayout>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý dịch vụ</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          ➕ Thêm dịch vụ
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">➕ Thêm dịch vụ</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Tên dịch vụ"
              className="p-2 border rounded"
              value={newService.tendv || ""}
              onChange={(e) =>
                setNewService({ ...newService, tendv: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Mô tả"
              className="p-2 border rounded"
              value={newService.description || ""}
              onChange={(e) =>
                setNewService({ ...newService, description: e.target.value })
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddService}
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

      {showEditForm && editService && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">✏️ Sửa dịch vụ</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Tên dịch vụ"
              className="p-2 border rounded"
              value={editService.tendv}
              onChange={(e) =>
                setEditService({ ...editService, tendv: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Mô tả"
              className="p-2 border rounded"
              value={editService.description || ""}
              onChange={(e) =>
                setEditService({ ...editService, description: e.target.value })
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleUpdateService}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Cập nhật
            </button>
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditService(null);
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
            <th className="border px-4 py-2">Tên</th>
            <th className="border px-4 py-2">Mô tả</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {services
            .sort((a, b) => a.tendv.localeCompare(b.tendv)) // Sắp xếp theo tên
            .map((service, index) => (
              <tr key={service.madv}>
                <td className="border px-4 py-2 text-center">{index + 1}</td>
                <td className="border px-4 py-2">{service.tendv}</td>
                <td className="border px-4 py-2">{service.description}</td>
                <td className="border px-4 py-2 text-center">
                  <div className="inline-flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(service)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.madv)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                    >
                      🗑️
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

export default ServicePage;
