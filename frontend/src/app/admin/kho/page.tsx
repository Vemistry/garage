"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Product {
  mapt: number;
  tenpt: string;
  soluongton: number;
  dongia: number;
  min: number;
}

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    tenpt: "",
    soluongton: 0,
    dongia: 0,
    min: 0,
  });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importItems, setImportItems] = useState<
    { tenpt: string; soluongton: number; dongia: number; min: number }[]
  >([{ tenpt: "", soluongton: 0, dongia: 0, min: 0 }]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/products", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        toast.error("❌ Lỗi khi tải danh sách phụ tùng!");
      }
    } catch (error) {
      toast.error("❌ Lỗi mạng khi tải danh sách phụ tùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        toast.success("✅ Thêm phụ tùng thành công!");
        setShowAddForm(false);
        setNewProduct({ tenpt: "", soluongton: 0, dongia: 0, min: 0 });
        fetchProducts();
      } else {
        const text = await res.text();
        toast.error("❌ Lỗi khi thêm phụ tùng: " + text);
      }
    } catch (error) {
      toast.error("❌ Lỗi mạng khi thêm phụ tùng.");
    }
  };

  const handleImportProducts = async () => {
    // Chỉ giữ lại những dòng có tenpt không rỗng và soluongton > 0
    const validItems = importItems.filter(
      (item) => item.tenpt.trim() !== "" && item.soluongton > 0
    );

    if (validItems.length === 0) {
      toast.error("❌ Vui lòng nhập ít nhất một dòng hợp lệ (Tên + Số lượng)!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/products/import", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validItems),
      });

      if (res.ok) {
        toast.success("✅ Nhập kho thành công!");
        setShowImportForm(false);
        setImportItems([{ tenpt: "", soluongton: 0, dongia: 0, min: 0 }]);
        fetchProducts(); // reload lại danh sách sản phẩm
      } else {
        const text = await res.text();
        toast.error("❌ Lỗi khi nhập kho: " + text);
      }
    } catch (err) {
      toast.error("❌ Lỗi mạng khi nhập kho.");
    }
  };

  const handleUpdateProduct = async () => {
    if (!editProduct) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/products/${editProduct.mapt}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editProduct),
        }
      );

      if (res.ok) {
        toast.success("✅ Cập nhật phụ tùng thành công!");
        setShowEditForm(false);
        setEditProduct(null);
        fetchProducts();
      } else {
        const text = await res.text();
        toast.error("❌ Lỗi khi cập nhật phụ tùng: " + text);
      }
    } catch (error) {
      toast.error("❌ Lỗi mạng khi cập nhật phụ tùng.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("🗑️ Xóa phụ tùng thành công!");
        fetchProducts();
      } else {
        toast.error("❌ Xóa phụ tùng thất bại!");
      }
    } catch (error) {
      toast.error("❌ Lỗi khi xóa phụ tùng.");
    }
  };

  const showDeleteConfirmToast = (product: Product) => {
    toast.info(
      ({ closeToast }) => (
        <div className="space-y-2">
          <p>
            Bạn có chắc muốn xoá phụ tùng <strong>{product.tenpt}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                handleDeleteProduct(product.mapt);
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

  const handleEditClick = (product: Product) => {
    setEditProduct(product);
    setShowEditForm(true);
  };

  return (
    <AdminLayout>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý phụ tùng</h1>
        <div className="flex gap-x-2">
          <button
            onClick={() => setShowImportForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow"
          >
            📦 Nhập kho
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            ➕ Thêm phụ tùng
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">➕ Thêm phụ tùng</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Tên phụ tùng"
              className="p-2 border rounded"
              value={newProduct.tenpt}
              onChange={(e) =>
                setNewProduct({ ...newProduct, tenpt: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Số lượng tồn"
              className="p-2 border rounded"
              value={
                newProduct.soluongton === 0
                  ? ""
                  : newProduct.soluongton.toString()
              }
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  soluongton: Number(e.target.value),
                })
              }
            />
            <input
              type="number"
              placeholder="Đơn giá"
              className="p-2 border rounded"
              value={
                newProduct.dongia === 0 ? "" : newProduct.dongia.toString()
              }
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  dongia: Number(e.target.value),
                })
              }
            />
            <input
              type="number"
              placeholder="Số lượng nhắc cảnh báo"
              className="p-2 border rounded"
              value={newProduct.min === 0 ? "" : newProduct.min.toString()}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  min: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddProduct}
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

      {showImportForm && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">📦 Nhập kho</h2>

          {importItems.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-4 mb-2 items-center"
            >
              <input
                type="text"
                placeholder="Tên phụ tùng"
                className="p-2 border rounded"
                value={item.tenpt}
                onChange={(e) => {
                  const newItems = [...importItems];
                  newItems[index].tenpt = e.target.value;
                  setImportItems(newItems);
                }}
              />

              <input
                type="number"
                placeholder="Nhập số lượng"
                className="p-2 border rounded"
                value={item.soluongton === 0 ? "" : item.soluongton}
                onChange={(e) => {
                  const newItems = [...importItems];
                  newItems[index].soluongton = Number(e.target.value) || 0;
                  setImportItems(newItems);
                }}
              />

              <input
                type="number"
                placeholder="Số lượng nhắc cảnh báo"
                className="p-2 border rounded"
                value={item.min === 0 ? "" : item.min}
                onChange={(e) => {
                  const newItems = [...importItems];
                  newItems[index].min = Number(e.target.value) || 0;
                  setImportItems(newItems);
                }}
              />

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Đơn giá"
                  className="p-2 border rounded w-full"
                  value={item.dongia === 0 ? "" : item.dongia}
                  onChange={(e) => {
                    const newItems = [...importItems];
                    newItems[index].dongia = Number(e.target.value) || 0;
                    setImportItems(newItems);
                  }}
                />
                <button
                  onClick={() => {
                    const newItems = importItems.filter((_, i) => i !== index);
                    setImportItems(newItems);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded"
                  title="Xoá dòng"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() =>
                setImportItems([
                  ...importItems,
                  { tenpt: "", soluongton: 0, dongia: 0, min: 0 },
                ])
              }
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded"
            >
              ➕ Thêm sản phẩm
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleImportProducts}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              ✅ Nhập kho
            </button>
            <button
              onClick={() => setShowImportForm(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {showEditForm && editProduct && (
        <div className="p-4 bg-gray-100 rounded mb-6 shadow-md">
          <h2 className="text-lg font-semibold mb-2">✏️ Sửa phụ tùng</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Tên phụ tùng"
              className="p-2 border rounded"
              value={editProduct.tenpt}
              onChange={(e) =>
                setEditProduct({ ...editProduct, tenpt: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Số lượng tồn"
              className="p-2 border rounded"
              value={
                editProduct.soluongton === 0
                  ? ""
                  : editProduct.soluongton.toString()
              }
              onChange={(e) =>
                setEditProduct({
                  ...editProduct,
                  soluongton: Number(e.target.value),
                })
              }
            />
            <input
              type="number"
              placeholder="Số lượng nhắc cảnh báo"
              className="p-2 border rounded"
              value={editProduct.min === 0 ? "" : editProduct.min.toString()}
              onChange={(e) =>
                setEditProduct({
                  ...editProduct,
                  min: Number(e.target.value),
                })
              }
            />
            <input
              type="number"
              placeholder="Đơn giá"
              className="p-2 border rounded"
              value={
                editProduct.dongia === 0 ? "" : editProduct.dongia.toString()
              }
              onChange={(e) =>
                setEditProduct({
                  ...editProduct,
                  dongia: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleUpdateProduct}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Cập nhật
            </button>
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditProduct(null);
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
            <th className="border px-4 py-2">Mã PT</th>
            <th className="border px-4 py-2">Tên</th>
            <th className="border px-4 py-2">Số lượng tồn</th>
            <th className="px-3 py-2 border">Tồn tối thiểu</th>
            <th className="border px-4 py-2">Đơn giá</th>
            <th className="border px-4 py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.mapt}>
              <td className="border px-4 py-2">{product.mapt}</td>
              <td className="border px-4 py-2">{product.tenpt}</td>
              <td className="border px-4 py-2">{product.soluongton}</td>
              <td className="border px-4 py-2">{product.min}</td>
              <td className="border px-4 py-2 text-right">
                {product.dongia.toLocaleString("vi-VN")}{" "}
                <span className="text-xs text-gray-500">VNĐ</span>
              </td>
              <td className="border px-4 py-2 text-center">
                <div className="inline-flex justify-center gap-2">
                  <button
                    onClick={() => handleEditClick(product)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => showDeleteConfirmToast(product)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {loading && (
            <tr>
              <td colSpan={5} className="text-center p-4">
                Đang tải dữ liệu...
              </td>
            </tr>
          )}
          {!loading && products.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">
                Không có phụ tùng nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default ProductPage;
