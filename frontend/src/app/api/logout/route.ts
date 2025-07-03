import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ message: "Đã đăng xuất" });

  // ❗ Xóa cookie bằng cách set lại với expires là quá khứ
  response.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0), // Quan trọng: set thời gian hết hạn trong quá khứ
  });

  return response;
}
