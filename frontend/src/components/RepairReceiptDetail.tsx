import React, { useEffect, useState } from "react";

interface Item {
  id: number;
  tenphutung?: string;
  tendv?: string;
  soluong?: number;
  dongia: number;
  type: "dichvu" | "phutung";
}

interface RepairReceiptDetailProps {
  maphieu: string;
  onAddItem?: (item: Item) => void;
  onDeleteItem?: (id: number) => void;
  onClose?: () => void;
  onSave?: (data: { dichvu: Item[]; phutung: Item[] }) => void;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN");
};

const RepairReceiptDetail: React.FC<RepairReceiptDetailProps> = ({
  maphieu,
  onAddItem,
  onDeleteItem,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(true);
  const [phieu, setPhieu] = useState<any>(null);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<Partial<Item>>({});
  const [serviceSuggestions, setServiceSuggestions] = useState<any[]>([]);
  const [partSuggestions, setPartSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const [newDV, setNewDV] = useState<Item>({
    id: Date.now() + 1,
    tendv: "",
    dongia: 0,
    type: "dichvu",
  });

  const [newPT, setNewPT] = useState<Item>({
    id: Date.now(),
    tenphutung: "",
    soluong: 1,
    dongia: 0,
    type: "phutung",
  });

  const fetchServiceSuggestions = async (keyword: string) => {
    if (!keyword.trim()) return;
    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/services?search=${encodeURIComponent(
          keyword
        )}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      console.log("Kết quả tìm kiếm dịch vụ:", data);
      setServiceSuggestions(data);
    } catch (err) {
      console.error("❌ Lỗi tìm dịch vụ:", err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const fetchPartSuggestions = async (keyword: string) => {
    if (!keyword.trim()) return;
    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/products?search=${encodeURIComponent(
          keyword
        )}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      console.log("Kết quả tìm kiếm phụ tùng:", data);
      setPartSuggestions(data);
    } catch (err) {
      console.error("❌ Lỗi tìm phụ tùng:", err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    const fetchPhieu = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/phieu_sua_chua/${maphieu}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setPhieu(data.phieu);
      } catch (err) {
        console.error("❌ Lỗi khi lấy chi tiết phiếu:", err);
      } finally {
        setLoading(false);
      }
    };

    if (maphieu) fetchPhieu();
  }, [maphieu]);

  if (loading) return <div>Đang tải phiếu...</div>;
  if (!phieu) return <div>Không tìm thấy phiếu.</div>;

  const chitiet: Item[] = phieu.chitiet ?? [];
  const dichvuList = chitiet.filter((i) => i.type === "dichvu");
  const phutungList = chitiet.filter((i) => i.type === "phutung");

  const calcTotal = () =>
    chitiet.reduce((sum, i) => sum + (i.soluong || 1) * i.dongia, 0);

  const handleAdd = (
    item: Item,
    setFunc: React.Dispatch<React.SetStateAction<Item>>
  ) => {
    const isValid =
      (item.tenphutung ?? item.tendv)?.trim() &&
      item.dongia > 0 &&
      (item.type === "phutung" ? item.soluong && item.soluong > 0 : true);

    if (isValid) {
      onAddItem?.(item);
      setFunc({
        id: Date.now(),
        tenphutung: "",
        tendv: "",
        soluong: 1,
        dongia: 0,
        type: item.type,
      });
    }
  };

  const handleSaveAll = () => {
    onSave?.({
      dichvu: dichvuList,
      phutung: phutungList,
    });
  };

  const applyEdit = () => {
    if (editItemId == null) return;

    const updated = phieu.chitiet.map((item: Item) =>
      item.id === editItemId ? { ...item, ...editValue } : item
    );
    setPhieu({ ...phieu, chitiet: updated });
    setEditItemId(null);
    setEditValue({});
    setServiceSuggestions([]);
    setPartSuggestions([]);
  };
  const renderEditableCell = (
    item: Item,
    key: keyof Item,
    align: "left" | "center" | "right" = "left",
    isSuggestion = false,
    suggestionType: "dichvu" | "phutung" = "dichvu"
  ) => {
    const isEditing = editItemId === item.id;
    const suggestions =
      suggestionType === "dichvu" ? serviceSuggestions : partSuggestions;

    console.log("📋 Suggestions:", suggestions);

    return (
      <td className={`border px-3 py-2 text-${align}`}>
        {isEditing && isSuggestion ? (
          <div className="relative">
            <input
              type="text"
              value={editValue[key]?.toString() ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setEditValue((prev) => ({ ...prev, [key]: value }));
                suggestionType === "dichvu"
                  ? fetchServiceSuggestions(value)
                  : fetchPartSuggestions(value);
              }}
              className="border p-1 w-full"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-50 bg-white border left-0 right-0 max-h-40 overflow-y-auto shadow-lg">
                {suggestions.map((s) => {
                  const nameField =
                    suggestionType === "dichvu" ? "tendv" : "tenphutung";
                  return (
                    <li
                      key={s.madv || s.mapt}
                      className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => {
                        setEditValue((prev) => ({
                          ...prev,
                          [key]: s[nameField], // set đúng key đang binding
                        }));
                        setServiceSuggestions([]);
                        setPartSuggestions([]);
                        applyEdit(); // Gọi lưu luôn nếu cần
                      }}
                    >
                      {s.tendv || s.tenphutung}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : isEditing ? (
          <input
            type={typeof item[key] === "number" ? "number" : "text"}
            value={editValue[key]?.toString() ?? ""}
            onChange={(e) =>
              setEditValue((prev) => ({
                ...prev,
                [key]:
                  typeof item[key] === "number"
                    ? Number(e.target.value)
                    : e.target.value,
              }))
            }
            onBlur={applyEdit}
            className="border p-1 w-full"
          />
        ) : (
          <span
            className="cursor-pointer"
            onClick={() => {
              setEditItemId(item.id);
              setEditValue(item);
            }}
          >
            {item[key]}
          </span>
        )}
      </td>
    );
  };

  return (
    <div className="relative p-6 bg-white shadow-xl rounded w-full max-w-[900px] mx-auto">
      <button
        className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-xl"
        onClick={onClose}
      >
        ×
      </button>

      <h2 className="text-2xl font-bold mb-4">
        Chi tiết Phiếu #{phieu.maphieu}
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <p>
          <strong>Biển số:</strong> {phieu.bienso}
        </p>
        <p>
          <strong>SĐT:</strong> {phieu.phone}
        </p>
        <p>
          <strong>NV tiếp nhận:</strong> {phieu.nv_tiepnhan}
        </p>
        <p>
          <strong>NV sửa chữa:</strong> {phieu.nv_suachua}
        </p>
        <p>
          <strong>Thời gian tiếp nhận:</strong> {formatDate(phieu.tg_tiepnhan)}
        </p>
      </div>

      <h3 className="font-semibold mb-2">Dịch vụ</h3>
      <table className="w-full border mb-4 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">STT</th>
            <th className="border px-3 py-2">Tên dịch vụ</th>
            <th className="border px-3 py-2">Đơn giá</th>
          </tr>
        </thead>
        <tbody>
          {dichvuList.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-3 text-gray-500">
                Chưa có dữ liệu
              </td>
            </tr>
          ) : (
            dichvuList.map((dv, idx) => (
              <tr key={dv.id}>
                <td className="border px-3 py-2 text-center">{idx + 1}</td>
                {renderEditableCell(dv, "tendv", "left", true, "dichvu")}
                {renderEditableCell(dv, "dongia", "right")}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <input
          type="text"
          placeholder="Tên dịch vụ"
          value={newDV.tendv}
          onChange={(e) => {
            const val = e.target.value;
            setNewDV((prev) => ({ ...prev, tendv: val }));
            fetchServiceSuggestions(val);
          }}
          className="border p-2 col-span-2"
        />
        <input
          type="number"
          placeholder="Đơn giá"
          value={newDV.dongia}
          onChange={(e) =>
            setNewDV((prev) => ({ ...prev, dongia: Number(e.target.value) }))
          }
          className="border p-2"
        />
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
        onClick={() => handleAdd(newDV, setNewDV)}
      >
        ➕ Thêm dịch vụ
      </button>

      <h3 className="font-semibold mb-2">Phụ tùng</h3>
      <table className="w-full border mb-4 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">STT</th>
            <th className="border px-3 py-2">Tên phụ tùng</th>
            <th className="border px-3 py-2">Số lượng</th>
            <th className="border px-3 py-2">Đơn giá</th>
            <th className="border px-3 py-2">Thành tiền</th>
            <th className="border px-3 py-2">Xoá</th>
          </tr>
        </thead>
        <tbody>
          {phutungList.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-3 text-gray-500">
                Chưa có dữ liệu
              </td>
            </tr>
          ) : (
            phutungList.map((pt, idx) => (
              <tr key={pt.id}>
                <td className="border px-3 py-2 text-center">{idx + 1}</td>
                {renderEditableCell(pt, "tenphutung", "left", true, "phutung")}
                {renderEditableCell(pt, "soluong", "center")}
                {renderEditableCell(pt, "dongia", "right")}
                <td className="border px-3 py-2 text-right">
                  {(pt.soluong! * pt.dongia).toLocaleString("vi-VN")}
                </td>
                <td className="border px-3 py-2 text-center">
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => onDeleteItem?.(pt.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
        <input
          type="text"
          placeholder="Tên phụ tùng"
          value={newPT.tenphutung}
          onChange={(e) => {
            const val = e.target.value;
            setNewPT((prev) => ({ ...prev, tenphutung: val }));
            fetchPartSuggestions(val);
          }}
          className="border p-2 col-span-2"
        />
        <input
          type="number"
          placeholder="Số lượng"
          value={newPT.soluong}
          onChange={(e) =>
            setNewPT((prev) => ({ ...prev, soluong: Number(e.target.value) }))
          }
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Đơn giá"
          value={newPT.dongia}
          onChange={(e) =>
            setNewPT((prev) => ({ ...prev, dongia: Number(e.target.value) }))
          }
          className="border p-2"
        />
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
        onClick={() => handleAdd(newPT, setNewPT)}
      >
        ➕ Thêm phụ tùng
      </button>

      <div className="text-right text-lg font-semibold mb-2">
        Tổng tiền phụ tùng + dịch vụ: {calcTotal().toLocaleString("vi-VN")} ₫
      </div>

      <div className="text-right">
        <button
          onClick={handleSaveAll}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          💾 Lưu tất cả
        </button>
      </div>
    </div>
  );
};

export default RepairReceiptDetail;
