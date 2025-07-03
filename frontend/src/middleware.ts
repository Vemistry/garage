import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/services", "/api/login"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  console.log("Middleware chạy với path:", pathname);

  // Nếu là public route → cho qua
  if (PUBLIC_ROUTES.includes(pathname)) {
    console.log("Truy cập public route:", pathname);
    return NextResponse.next();
  }

  // Lấy token từ cookie
  const token = req.cookies.get("token")?.value;
  if (!token) {
    console.log("Không có token, redirect về /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    const role = payload.role;
    console.log("Role từ token:", role);

    // Kiểm tra role phù hợp với route
    if (pathname.startsWith("/admin") && role !== "admin") {
      console.log("Không phải admin, redirect login");
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/staff") && role !== "staff") {
      console.log("Không phải staff, redirect login");
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/customer") && role !== "customer") {
      console.log("Không phải customer, redirect login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Nếu hợp lệ → tiếp tục
    return NextResponse.next();
  } catch (err) {
    console.error("Lỗi verify token:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Apply middleware cho tất cả route trừ _next và file tĩnh
export const config = {
  matcher: ["/((?!_next|favicon.ico|images|fonts|.*\\.svg$|.*\\.png$).*)"],
};
