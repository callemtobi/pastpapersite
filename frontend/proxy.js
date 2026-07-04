import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isUploadRoute = pathname.startsWith("/upload");
  console.log("PATH:", pathname, "TOKEN FOUND:", !!token);

  if (!isAdminRoute && !isUploadRoute) return NextResponse.next();

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    if (isAdminRoute && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    return NextResponse.next();
  } catch {
    console.log("VERIFY FAILED:", err.message);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/upload/:path*"],
};
