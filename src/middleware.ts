import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const customerPaths = ["/home", "/bikes", "/services", "/book", "/bookings", "/account"];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("rideready_session");
  const path = request.nextUrl.pathname;
  const isCustomer = customerPaths.some((p) => path === p || path.startsWith(`${p}/`));

  if (isCustomer && !session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  if ((path === "/login" || path === "/register") && session) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/bikes/:path*", "/services/:path*", "/book/:path*", "/bookings/:path*", "/account/:path*", "/login", "/register"],
};
