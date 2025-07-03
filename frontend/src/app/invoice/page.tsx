"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";

type Product = {
  product_id: string;
  quantity: number;
};

export default function InvoicePage() {
  const [token, setToken] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState("");
  const [products, setProducts] = useState<Product[]>([
    { product_id: "", quantity: 1 },
  ]);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) router.push("/");
    else setToken(t);
  }, [router]);

  const handleProductChange = (
    index: number,
    field: "product_id" | "quantity",
    value: string
  ) => {
    setProducts((prevProducts) => {
      const updated = [...prevProducts];
      if (field === "product_id") {
        updated[index].product_id = value;
      } else {
        updated[index].quantity = Number(value);
      }
      return updated;
    });
  };

  const addProduct = () =>
    setProducts([...products, { product_id: "", quantity: 1 }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("Bạn chưa đăng nhập");
      return;
    }

    const res = await fetch("http://localhost:3000/api/inventory/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ appointment_id: appointmentId, products }),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: 500, margin: "auto" }}>
        <h2>Tạo hóa đơn</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Appointment ID"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            style={{ display: "block", marginBottom: 10, width: "100%" }}
          />
          {products.map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <input
                placeholder="Product ID"
                value={p.product_id}
                onChange={(e) =>
                  handleProductChange(i, "product_id", e.target.value)
                }
                style={{ marginRight: 10 }}
              />
              <input
                type="number"
                min={1}
                placeholder="Quantity"
                value={p.quantity}
                onChange={(e) =>
                  handleProductChange(i, "quantity", e.target.value)
                }
              />
            </div>
          ))}
          <button type="button" onClick={addProduct}>
            Thêm sản phẩm
          </button>
          <br />
          <br />
          <button type="submit">Tạo hóa đơn</button>
        </form>
      </div>
    </>
  );
}
