// app/api/user/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: targetUserId } = await params;

    // Only admins or the user themselves should be able to access user data
    if (targetUserId !== userId) {
      // Check if the requesting user is an admin
      const requestingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!requestingUser || requestingUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 403 }
        );
      }
    }

    // Fetch the user data
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
        // Include related data based on your needs
        orders: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
          },
          take: 5, // Limit to most recent 5 orders
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}