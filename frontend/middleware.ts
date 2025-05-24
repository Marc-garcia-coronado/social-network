import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // matcher: ["/:user_name/home","/:user_name/events","/:user_name/post","/:user_name/profile","/:user_name/settings"]
  matcher: ["/:user_name/messages"]
};
