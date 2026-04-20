import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isBypassRoute = createRouteMatcher([
  "/studio(.*)",
  "/onboarding",
  "/api/set-onboarded",
  "/api/track-session",
  "/api/user",
  "/api/end-session(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sign-out",
]);

const isWebhookRoute = createRouteMatcher([
  "/api/stripe/webhook",
  "/api/end-session/webhook",
]);

function getOnboardingCookieValue(req: NextRequest): string | undefined {
  return req.cookies.get("onboarding_complete")?.value;
}

function getVerifiedSessionCookie(req: NextRequest): string | undefined {
  return req.cookies.get("ob_verified")?.value;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  try {
    const { userId, sessionId } = await auth();

    if (!userId) return NextResponse.next();
    if (isWebhookRoute(req)) return NextResponse.next();
    if (isBypassRoute(req)) return NextResponse.next();

    const onboardingCookie = getOnboardingCookieValue(req);
    const verifiedSession = getVerifiedSessionCookie(req);

    // Fast path: cookie present AND we have DB-verified this session.
    if (onboardingCookie === "1" && verifiedSession === sessionId) {
      return NextResponse.next();
    }

    // Slow path: route through /api/set-onboarded for DB verification.
    const verifyUrl = req.nextUrl.clone();
    verifyUrl.pathname = "/api/set-onboarded";
    verifyUrl.searchParams.set(
      "next",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(verifyUrl);
  } catch (error) {
    console.error("[middleware] auth error:", error);

    return NextResponse.json(
      { error: "Authentication error. Please try again." },
      { status: 500 }
    );
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};