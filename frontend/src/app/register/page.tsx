"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate
    if (!username.trim() || !fullName.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    if (!/^0\d{9}$/.test(phone)) {
      setError("Số điện thoại phải bắt đầu bằng số 0 và đủ 10 số.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          full_name: fullName,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Đăng ký thất bại");
      } else {
        // Đăng ký thành công, chuyển sang đăng nhập
        router.push("/login");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  // Giới hạn input số điện thoại chỉ nhập số và max 10 ký tự
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^0?\d{0,9}$/.test(val)) {
      setPhone(val);
      setError("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/background.png')] bg-cover bg-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-90 p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-600">
          Đăng ký
        </h2>

        <label className="block mb-2 font-semibold text-gray-600">
          Tên đăng nhập
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Tên đăng nhập"
          className="w-full p-2 mb-4 border border-gray-300 rounded placeholder:text-gray-300 placeholder:font-semibold text-gray-600 font-semibold"
          required
        />

        <label className="block mb-2 font-semibold text-gray-600">
          Họ và tên
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Họ và tên"
          className="w-full p-2 mb-4 border border-gray-300 rounded placeholder:text-gray-300 placeholder:font-semibold text-gray-600 font-semibold"
          required
        />

        <label className="block mb-2 font-semibold text-gray-600">
          Số điện thoại
        </label>
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          maxLength={10}
          placeholder="Nhập số điện thoại"
          className="w-full p-2 mb-4 border border-gray-300 rounded placeholder:text-gray-300 placeholder:font-semibold text-gray-600 font-semibold"
          required
        />

        <label className="block mb-2 font-semibold text-gray-600">
          Mật khẩu
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          className="w-full p-2 mb-4 border border-gray-300 rounded placeholder:text-gray-300 placeholder:font-semibold text-gray-600 font-semibold"
          required
        />

        {error && (
          <p className="text-red-600 mb-4 text-center font-semibold">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <div className="flex justify-center mt-4 text-sm text-gray-600 font-semibold">
          <span>Đã có tài khoản? </span>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-blue-600 hover:underline ml-1"
          >
            Đăng nhập
          </button>
        </div>
      </form>
    </div>
  );
}
