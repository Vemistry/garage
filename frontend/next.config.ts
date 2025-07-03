import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Các config bạn đang có

  env: {
    JWT_SECRET: process.env.JWT_SECRET || "", // Đẩy biến môi trường JWT_SECRET vào Next.js
  },
};

export default nextConfig;
