"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";

interface Service {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Phần xử lý thanh tìm kiếm
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Suggested list tạm thời dựa trên inputValue
  const suggestedServices = services
    .filter((service) =>
      service.name.toLowerCase().includes(inputValue.toLowerCase())
    )
    .slice(0, 5); // chỉ lấy tối đa 5 gợi ý cho gọn

  // Hàm xử lý enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(inputValue);
      setCurrentPage(1);
      // Ẩn gợi ý
      setInputValue("");
    }
  };

  const handleSearchClick = () => {
    setSearchTerm(inputValue);
    setCurrentPage(1);
    // Ẩn gợi ý
    setInputValue("");
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const columns = 4;

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    fetch("/servicesData.json")
      .then((res) => res.json())
      .then((data: Service[]) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => {
        setServices([]);
        setLoading(false);
      });
  }, []);

  const handleBook = (serviceId: number) => {
    if (!isLoggedIn) {
      setShowPopup(true);
      return;
    }
    router.push(`/book-service/${serviceId}`);
  };

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  if (loading)
    return (
      <div className="pt-24 flex flex-col items-center justify-center text-xl text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        Đang tải dịch vụ...
      </div>
    );

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
              onClick={() => {
                router.push("/");
                setMenuOpen(false);
              }}
            >
              Trang chủ
            </button>
            <button
              className="hover:text-blue-400"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
              router.push("/");
              setMenuOpen(false);
            }}
          >
            Trang chủ
          </button>
          <button
            className="hover:text-blue-400"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
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

      {/* Main content */}
      <main className="pt-23 px-6 md:px-20 lg:px-40 bg-white w-full min-h-screen pb-10">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-600">
          Danh sách dịch vụ
        </h1>

        {/* Thanh tìm kiếm */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              className="w-full pr-10 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSearchClick}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
              aria-label="Tìm kiếm"
              type="button"
            >
              <Search size={20} />
            </button>

            {/* Ô gợi ý kết quả tạm thời */}
            {inputValue &&
              inputValue !== searchTerm &&
              suggestedServices.length > 0 && (
                <div className="absolute w-full bg-white border border-gray-300 rounded mt-1 shadow z-10 max-h-60 overflow-y-auto">
                  {suggestedServices.map((s) => (
                    <div
                      key={s.id}
                      className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => {
                        setSearchTerm(s.name);
                        setInputValue(s.name);
                        setCurrentPage(1);
                      }}
                    >
                      {s.name}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredServices
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((service) => (
              <div
                key={service.id}
                className="border rounded shadow hover:shadow-lg transition flex flex-col overflow-hidden"
              >
                <div className="flex-shrink-0 w-full h-[clamp(150px,20vw,220px)] overflow-hidden">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="p-2 flex flex-col justify-between flex-grow">
                  <h2 className="text-[clamp(1rem,1.5vw,1.5rem)] font-semibold mb-2 truncate text-gray-600">
                    {service.name}
                  </h2>
                  <p className="font-bold mb-4 text-gray-600 text-[clamp(0.95rem,1.2vw,1.2rem)]">
                    Giá: {service.price.toLocaleString()}
                  </p>
                  <button
                    className="px-4 py-2 bg-blue-600 text-gray-300 rounded hover:bg-blue-700 hover:text-gray-200 text-[clamp(0.9rem,1vw,1rem)]"
                    onClick={() => handleBook(service.id)}
                  >
                    Đặt lịch
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 text-white"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            Prev
          </button>
          <span className="text-gray-700">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 text-white"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
