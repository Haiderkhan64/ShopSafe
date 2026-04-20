import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyCsrfOrigin } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Verify Origin to prevent cross-site session termination.
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // look up internal user record by clerkId.
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (!user) {
      // No DB record — nothing to end.
      return NextResponse.json({ message: "Session ended" }, { status: 200 });
    }

    const session = await prisma.session.findFirst({
      where: { userId: user.id, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 404 }
      );
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - session.startTime.getTime()) / 1000
    );

    await prisma.session.update({
      where: { id: session.id },
      data: { endTime, duration, isActive: false },
    });

    return NextResponse.json({ message: "Session ended" }, { status: 200 });
  } catch (error) {
    console.error("Error ending session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}