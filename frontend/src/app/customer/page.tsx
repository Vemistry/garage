"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, User } from "lucide-react";

type UserType = {
  full_name: string;
  email: string;
  role: "admin" | "staff" | "customer";
};

export default function HomePage() {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const [showChangePass, setShowChangePass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toggleUserMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        toggleUserMenuRef.current &&
        !toggleUserMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      return setError("Vui lòng điền đầy đủ thông tin.");
    }
    if (newPassword.length < 6) {
      return setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
    }
    if (newPassword !== confirmPassword) {
      return setError("Xác nhận mật khẩu không khớp.");
    }

    try {
      const res = await fetch(
        "http://localhost:3001/api/users/change-password",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSuccess("Đổi mật khẩu thành công!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setShowChangePass(false), 1500);
      } else {
        setError(data.message || "Lỗi đổi mật khẩu.");
      }
    } catch (err) {
      setError("Lỗi kết nối đến server.");
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="fixed top-0 left-0 w-full z-30 bg-gray-800 bg-opacity-70 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div
            className="text-2xl font-bold cursor-pointer mr-12"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            🚗 Auto SE
          </div>
          <nav className="hidden md:flex space-x-6">
            <button
              className="hover:text-blue-400"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Trang chủ
            </button>
            <button
              className="hover:text-blue-400"
              onClick={() => router.push("/services")}
            >
              Dịch vụ
            </button>
          </nav>
        </div>

        {user && (
          <div
            ref={toggleUserMenuRef}
            className="relative hidden md:flex items-center space-x-4 cursor-pointer"
            onClick={toggleUserMenu}
          >
            <User size={28} className="mr-2" />
            <span>Chào mừng, {user.full_name}</span>

            {userMenuOpen && (
              <div
                ref={userMenuRef}
                className="absolute right-0 top-full mt-2 w-48 bg-white text-black rounded shadow-lg py-2 z-50"
              >
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setShowChangePass(true);
                    setUserMenuOpen(false);
                  }}
                >
                  Đổi mật khẩu
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}

        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed top-16 left-0 w-full bg-gray-900 bg-opacity-95 text-white flex flex-col items-center space-y-4 py-4 z-20 md:hidden">
          <button
            className="hover:text-blue-400"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setMenuOpen(false);
            }}
          >
            Trang chủ
          </button>
          <button
            className="hover:text-blue-400"
            onClick={() => {
              router.push("/services");
              setMenuOpen(false);
            }}
          >
            Dịch vụ
          </button>

          {user && (
            <div
              ref={toggleUserMenuRef}
              className="relative flex flex-col items-center text-center mt-2"
            >
              <span className="mb-1">Chào mừng, {user.full_name}</span>
              <button
                className="px-4 py-2 bg-gray-700 rounded mb-1"
                onClick={() => setShowChangePass(true)}
              >
                Đổi mật khẩu
              </button>
              <button
                className="px-4 py-2 bg-red-600 rounded"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}

      {/* Popup đổi mật khẩu */}
      {showChangePass && (
        <div className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-96 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
            <button
              onClick={() => setShowChangePass(false)}
              className="text-gray-500 hover:text-red-500 text-xl"
            >
              ×
            </button>
          </div>
          <input
            type="password"
            placeholder="Mật khẩu cũ"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded mb-3"
          />
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowChangePass(false)}
              className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleChangePassword}
              className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Đổi
            </button>
          </div>
        </div>
      )}

      {/* Main Section */}
      <main
        id="intro-section"
        className="relative flex flex-col items-center justify-center text-center text-white pt-20 min-h-screen w-full"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-5xl font-extrabold mb-4">
          Chào mừng đến với Auto SE
        </h1>
        <p className="text-lg max-w-xl px-4">
          Hệ thống quản lý garage ô tô thông minh: đặt lịch, theo dõi tiến độ,
          thanh toán dễ dàng.
        </p>
      </main>

      {/* About & Contact Sections */}
      <div className="bg-white w-full">
        <section
          id="about"
          className="max-w-6xl mx-auto py-12 px-6 text-center text-gray-800"
        >
          <h2 className="text-3xl font-bold mb-6">Giới thiệu về Auto SE</h2>
          <p className="mb-10 text-gray-600">
            Auto SE mang đến giải pháp quản lý garage ô tô thông minh, giúp bạn
            tiết kiệm thời gian, nâng cao hiệu quả và mang đến trải nghiệm tốt
            nhất cho khách hàng.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg shadow-xl border border-gray-300 hover:shadow-2xl transition">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">
                Dịch vụ chuyên nghiệp
              </h3>
              <p className="text-gray-600">
                Đội ngũ kỹ thuật viên giàu kinh nghiệm, đảm bảo xe bạn được chăm
                sóc tốt nhất.
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-xl border border-gray-300 hover:shadow-2xl transition">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">Đảm bảo chất lượng</h3>
              <p className="text-gray-600">
                Sử dụng phụ tùng chính hãng, quy trình kiểm tra nghiêm ngặt, đảm
                bảo chất lượng dịch vụ.
              </p>
            </div>
            <div className="p-6 rounded-lg shadow-xl border border-gray-300 hover:shadow-2xl transition">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Hỗ trợ nhanh chóng</h3>
              <p className="text-gray-600">
                Đặt lịch online, tư vấn trực tuyến, hỗ trợ khách hàng mọi lúc
                mọi nơi.
              </p>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="max-w-6xl mx-auto py-12 px-6 text-gray-800"
        >
          <h2 className="text-3xl font-bold mb-10 text-center">
            Liên hệ với chúng tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Hotline tư vấn:</h3>
                <p>0123.456.789</p>
                <p>0888.888.888</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Địa chỉ:</h3>
                <p>
                  VRC2+2MP, Phường Linh Trung, Thủ Đức, Hồ Chí Minh, Vietnam
                </p>
              </div>
            </div>
            <div className="w-full h-64 rounded overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.900620356283!2d106.79915527504354!3d10.870426357473366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527e7e8abb0eb%3A0xec43e4b99472c18a!2sUIT%20-%20C%E1%BB%95ng%20A!5e0!3m2!1svi!2s!4v1716743103251!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
