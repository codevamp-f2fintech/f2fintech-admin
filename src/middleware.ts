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
  // localhost:3002/img/f2Fintechlogo.png
  const publicPaths = ["/login", "/img/f2Fintechlogo.png"];

  // Check if the request path is a public path
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // Check if the user is authenticated
  if (!isPublicPath) {
    if (token) {
      try {
        // Decode token to get the role
        const jwtSecret = new TextEncoder().encode(
          process.env.JWT_SECRET || ""
        );
        const { payload } = await jwtVerify(token, jwtSecret);
        const role = payload.role;

        // Check if the route is restricted for agents
        if (role !== "agent" && request.nextUrl.pathname.startsWith("/user")) {
          // Redirect agents trying to access /user or its subroutes
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        // Check if role is admin or agent
        if (role !== "admin" && role !== "agent") {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      } catch (error) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } else {
      console.log("redirect to login");
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
