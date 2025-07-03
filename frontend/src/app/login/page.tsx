"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Tên đăng nhập không được để trống.");
      return;
    }
    if (!password) {
      setError("Mật khẩu không được để trống.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Bắt buộc để gửi cookie HTTP-only
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }

      // Không cần set cookie token thủ công nữa
      // Lưu thông tin user để sử dụng ở client
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect theo role
      switch (data.user.role) {
        case "admin":
          router.push("/admin");
          break;
        case "staff":
          router.push("/staff");
          break;
        case "customer":
          router.push("/customer");
          break;
        default:
          router.push("/");
          break;
      }
    } catch (err) {
      setError("Lỗi mạng, thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/background.png')] bg-cover bg-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-90 p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-600">
          Đăng nhập
        </h2>

        <label
          htmlFor="username"
          className="block mb-2 font-semibold text-gray-600"
        >
          Tên đăng nhập
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nhập tên đăng nhập"
          className="w-full p-2 mb-4 border border-gray-300 rounded placeholder:text-gray-300 placeholder:font-semibold text-gray-600 font-semibold"
          required
          autoComplete="username"
          disabled={loading}
        />

        <label
          htmlFor="password"
          className="block mb-2 font-semibold text-gray-600"
        >
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          className="w-full p-2 mb-4 border border-gray-300 rounded placeholder:text-gray-300 placeholder:font-semibold text-gray-600 font-semibold"
          required
          autoComplete="current-password"
          disabled={loading}
        />

        {error && (
          <p className="text-red-600 mb-4 text-center font-semibold">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } transition`}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <div className="flex justify-between items-center mt-4 text-sm text-gray-600 font-semibold">
          <a
            href="/forgot-password"
            className="hover:text-blue-600 cursor-pointer"
          >
            Quên mật khẩu
          </a>

          <div>
            <span>Chưa có tài khoản? </span>
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-blue-600 hover:underline ml-1"
            >
              Đăng ký
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
