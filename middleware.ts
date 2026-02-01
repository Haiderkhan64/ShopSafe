import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes
// const isPublicRoute = createRouteMatcher(["/", "/api/(.*)", "/(auth)/(.*)"]);

const isPublicRoute = createRouteMatcher([
  "/",             // homepage is public
  "/(auth)/(.*)",  // Clerk auth routes are public
  "/api/track-session",
]);


export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth(); // await here is important
    
    // Skip session tracking for public routes
    // if (!isPublicRoute(req) && userId) {
    //   const userAgent = req.headers.get("user-agent") || "Unknown";
    //   const forwardedFor = req.headers.get("x-forwarded-for");
    //   const ipAddress = forwardedFor
    //     ? forwardedFor.split(",")[0].trim()
    //     : "Unknown";
      
    //   // Clone the request
    //   const response = NextResponse.next();
      
    //   // Store session tracking info in a cookie
    //   response.cookies.set(
    //     "x-session-track",
    //     JSON.stringify({
    //       userId,
    //       ipAddress,
    //       userAgent,
    //       timestamp: Date.now(),
    //     }),
    //     {
    //       httpOnly: true,
    //       secure: process.env.NODE_ENV === "production",
    //       sameSite: "strict",
    //       path: "/",
    //       maxAge: 60, // Short lived
    //     }
    //   );
      
    //   // Only attempt to track session for non-tracking API requests
    //   // if (req.nextUrl.pathname !== "/api/track-session-internal") {
    //   if (req.nextUrl.pathname !== "/api/track-session") {

    //     const isTracking = req.headers.get("x-session-tracking");
    //     if (!isTracking) {
    //       // Move the fetch call outside the main middleware flow
    //       // to avoid blocking or affecting the response
    //       setTimeout(() => {
    //         // fetch(`${req.nextUrl.origin}/api/track-session-internal`, {
    //         fetch(`${req.nextUrl.origin}/api/track-session`, {
    //           method: "POST",
    //           headers: {
    //             "Content-Type": "application/json",
    //             "x-session-tracking": "true",
    //             Authorization: req.headers.get("Authorization") || "",
    //             Host: req.headers.get("host") || "",
    //           },
    //           body: JSON.stringify({
    //             userId,
    //             ipAddress,
    //             userAgent,
    //           }),
    //         }).catch((err) => {
    //           console.warn("Background session tracking failed:", err.message);
    //         });
    //       }, 0);
    //     }
    //   }
      
    //   return response;
    // }
    
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};