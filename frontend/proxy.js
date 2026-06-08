import { NextResponse } from "next/server";

export function proxy(req) {
  const token = req.cookies.get("accessToken");

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("reason", "auth_required"); // 👈 flag
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/upload"],
};
