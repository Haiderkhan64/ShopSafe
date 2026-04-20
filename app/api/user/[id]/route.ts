import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: targetUserId } = await params;

    // targetUserId is an internal Prisma cuid, not a Clerk ID.
    // Self-access: resolve the requesting user's internal id from their clerkId,
    // then compare with the target.
    if (targetUserId !== clerkId) {
      // FIX: was `where: { id: userId }` which used the Clerk ID as a Prisma
      // cuid — always returned null → always 403, even for real admins.
      const requestingUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { role: true },
      });

      if (!requestingUser || requestingUser.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        name: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        orders: {
          select: { id: true, status: true, total: true, createdAt: true },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in GET /api/user/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}