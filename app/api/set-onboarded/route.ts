import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

function onboardingCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  };
}

function verifiedSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function GET(req: NextRequest) {
  const { userId, sessionId } = await auth();

  if (!userId || !sessionId) {
    return NextResponse.redirect(new URL("/sign-in", BASE_URL));
  }

//  look up by clerkId, not by internal id.
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { hasCompletedOnboarding: true },
  });

  const cookieStore = await cookies();

  if (!user?.hasCompletedOnboarding) {
    cookieStore.delete("onboarding_complete");
    cookieStore.delete("ob_verified");
    return NextResponse.redirect(new URL("/onboarding", BASE_URL));
  }

  cookieStore.set("onboarding_complete", "1", onboardingCookieOptions());
  cookieStore.set("ob_verified", sessionId, verifiedSessionCookieOptions());

  const nextParam = req.nextUrl.searchParams.get("next");
  const destination =
    nextParam && nextParam.startsWith("/") ? nextParam : "/";

  return NextResponse.redirect(new URL(destination, BASE_URL));
}