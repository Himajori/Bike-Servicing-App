import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const customerPaths = ["/home", "/bikes", "/services", "/book", "/bookings", "/account"];
const mechanicPaths = ["/mechanic"];
const adminPaths = ["/admin"];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("rideready_session");
  const path = request.nextUrl.pathname;
  const needsAuth =
    customerPaths.some((p) => path === p || path.startsWith(`${p}/`)) ||
    mechanicPaths.some((p) => path === p || path.startsWith(`${p}/`)) ||
    adminPaths.some((p) => path === p || path.startsWith(`${p}/`));

  if (needsAuth && !session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  if ((path === "/login" || path === "/register") && session) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/bikes/:path*",
    "/services/:path*",
    "/book/:path*",
    "/bookings/:path*",
    "/account/:path*",
    "/mechanic/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
