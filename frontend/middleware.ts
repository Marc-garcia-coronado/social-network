import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  
  const response = await fetch("https://social-network-production.up.railway.app/api/validate-token", {
    method: "GET",
    credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
  });

  const data = await response.json();

  if (!data.valid) {
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
  ],
};