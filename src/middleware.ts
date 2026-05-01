import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes
const isProtectedRoute = createRouteMatcher(["/profile(.*)", "/dashboard(.*)"]);
const isLoginRoute = createRouteMatcher([
  "/sign-in",
  "/sign-up",
  "/dashboard/login",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect routes but allow public access to others
  if (isProtectedRoute(req) && !isLoginRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
