import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  console.log(token);

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // "/:user_name/home",
    // "/:user_name/events",
    // "/:user_name/create",
    // "/:user_name/profile",
    // "/:user_name/profile",
  ],
};
