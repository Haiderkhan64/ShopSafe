import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


// Helper function to get IP address
function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return "unknown";
}



export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deviceInfo } = await req.json();

    // Check for an active session
    let session = await prisma.session.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      // Create a new session if none exists
      session = await prisma.session.create({
        data: {
          userId,
          ipAddress: getClientIp(req),
          userAgent: req.headers.get("user-agent") || "unknown",
          startTime: new Date(),
          isActive: true,
          deviceInfo, // Include deviceInfo immediately
        },
      });
      return NextResponse.json({ message: "Session created" }, { status: 201 });
    }

    // Update existing session with deviceInfo
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
