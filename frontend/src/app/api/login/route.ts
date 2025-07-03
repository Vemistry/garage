// app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const res = await fetch("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { message: data.message || "Đăng nhập thất bại" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ user: data.user });

  // Set cookie token dạng HTTP-only
  response.cookies.set("token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 ngày
  });

  return response;
}
