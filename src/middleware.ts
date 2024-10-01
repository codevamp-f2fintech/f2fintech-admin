// middleware.ts

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
// Adjust the path according to your project structure

export function middleware(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  // Define routes that do not require authentication
  const publicPaths = ["/login"];

  // Check if the user is authenticated
  if (!token && !publicPaths.includes(request.nextUrl.pathname)) {
    // Redirect to the login page if not authenticated
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow the request to proceed if authenticated
  return NextResponse.next();
}

// Specify the paths that this middleware should apply to
export const config = {
  matcher: [
    // Apply to all routes except those specified
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
