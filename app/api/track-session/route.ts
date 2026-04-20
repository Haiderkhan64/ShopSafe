import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  if (realIp) return realIp;
  return "unknown";
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { windowMs: 60000, max: 10 });
  if (limited) return limited;

  try {
    const authResult = await auth();
    const { userId, sessionClaims } = authResult;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user info from JWT session claims — no extra Clerk API call.
    // Falls back gracefully if claims aren't configured in the Clerk dashboard.
    // To populate these, add email/firstName/lastName to your session token
    // in Clerk Dashboard → Sessions → Customize session token.
    const claimsEmail = sessionClaims?.email as string | undefined;
    const firstName = (sessionClaims?.firstName as string | undefined) ?? "";
    const lastName = (sessionClaims?.lastName as string | undefined) ?? "";
    const fullName = `${firstName} ${lastName}`.trim() || null;

    // Check if user already exists to avoid a write with a placeholder email.
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!existingUser) {
      // New user — only create if we have a real email. Without claims
      // configured, we skip creation here; the onboarding flow (POST /api/user)
      // will create the record with the verified email from currentUser().
      if (claimsEmail) {
        await prisma.user.create({
          data: {
            clerkId: userId,
            email: claimsEmail,
            name: fullName,
            role: "CUSTOMER",
            isActive: true,
          },
        });
      }
    }
    // If user exists: no update needed here — /api/user handles profile edits.

    const { deviceInfo } = await req.json();

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not yet registered" }, { status: 200 });
    }

    let session = await prisma.session.findFirst({
      where: { userId: user.id, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      session = await prisma.session.create({
        data: {
          userId: user.id,
          ipAddress: getClientIp(req),
          userAgent: req.headers.get("user-agent") || "unknown",
          startTime: new Date(),
          isActive: true,
          deviceInfo,
        },
      });
      return NextResponse.json({ message: "Session created" }, { status: 201 });
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { deviceInfo },
    });

    return NextResponse.json({ message: "Session updated" }, { status: 200 });
  } catch (error) {
    console.error("Error handling session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}