"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header */}
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

        <div className="hidden md:flex space-x-4">
          <button
            className="px-4 py-2 border border-blue-400 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition"
            onClick={() => router.push("/login")}
          >
            Đăng nhập
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={() => router.push("/register")}
          >
            Đăng ký
          </button>
        </div>

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
          <button
            className="px-4 py-2 border border-blue-400 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition"
            onClick={() => {
              router.push("/login");
              setMenuOpen(false);
            }}
          >
            Đăng nhập
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={() => {
              router.push("/register");
              setMenuOpen(false);
            }}
          >
            Đăng ký
          </button>
        </div>
      )}

      {/* Intro full màn hình */}
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

      {/* Wrapper cho phần giới thiệu và liên hệ */}
      <div className="bg-white w-full">
        {/* Giới thiệu */}
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

        {/* Liên hệ */}
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
