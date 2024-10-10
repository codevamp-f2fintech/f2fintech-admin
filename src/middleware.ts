// middleware.ts

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
// Adjust the path according to your project structure

export async function middleware(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  // Redirect to the login page if not authenticated
  const publicPaths = ["/login"];

  // Check if the request path is a public path
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // Check if the user is authenticated
  if (!isPublicPath) {
    if (token && !publicPaths.includes(request.nextUrl.pathname)) {
      try {
        // Decode token to get the role
        const jwtSecret = new TextEncoder().encode(
          process.env.JWT_SECRET || ""
        );
        const { payload } = await jwtVerify(token, jwtSecret);
        const role = payload.role;

        // Check if role is admin
        if (role !== "admin") {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      } catch (error) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } else {
      // Redirect to login if no token is present
      return NextResponse.redirect(new URL("/login", request.url));
    }
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
