import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("accessToken")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isUploadRoute = pathname.startsWith("/upload");

  if (!isAdminRoute && !isUploadRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let payload;
  try {
    const { payload: verified } = await jwtVerify(token, JWT_SECRET);
    payload = verified;
  } catch (err) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("accessToken");
    return res;
  }

  if (
    isAdminRoute &&
    payload.role !== "admin" &&
    payload.role !== "super_admin"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/upload", "/upload/:path*"],
};
