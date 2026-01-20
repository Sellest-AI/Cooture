import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/app(.*)"]); // Adjust this pattern to match your protected routes

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    // get the current route
    const currentRoute = request.nextUrl.pathname;

    // Create a custom redirect URL instead of using nextjsMiddlewareRedirect
    const redirectUrl = new URL(request.nextUrl.origin);
    redirectUrl.pathname = '/auth';
    redirectUrl.searchParams.set("redirect", currentRoute);

    return NextResponse.redirect(redirectUrl);
  }
  // Allow the request to proceed if authenticated or not a protected route
}, { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } });

export const config = {
  matcher: [
    "/((?!.*\\..*|_next|ingest/).*)",
    "/",
    "/(api|trpc)(.*)"
  ],
};