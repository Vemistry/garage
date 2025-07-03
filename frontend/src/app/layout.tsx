import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese"], // Hỗ trợ đầy đủ tiếng Việt
  weight: ["400", "500", "700"], // Tuỳ ý, có thể thêm 300 hoặc 800
  display: "swap",
});

export const metadata: Metadata = {
  title: "Auto SE",
  description: "Hệ thống quản lý garage ô tô thông minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
