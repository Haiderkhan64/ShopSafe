// app/api/user/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// Initialize Prisma client
const prisma = new PrismaClient();

// Zod schema for validating user data
const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["ADMIN", "ANALYST", "CUSTOMER"]).optional(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    console.log(
      "_-----------------_____---__---____---___--__---__---___--__---__--_____---__--___-------",
      userId
    );

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const parsed = userSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    const { id, email, name, address, role } = parsed.data;

    if (id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        email,
        name,
        address,
        role: role || "CUSTOMER",
        updatedAt: new Date(),
      },
      create: {
        id,
        email,
        name,
        address,
        role: role || "CUSTOMER",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Log auth data for debugging
    // const { userId } = await auth();
    const authData = await auth();
    // console.log("Auth data:", authData); // Debug log
    const { userId } = authData;
    // console.log(
    //   "++++++++++++++++++--------------___---___---__---__---_--___--",
    //   userId
    // );

    // console.log("Auth data:", userId);
    // // const { userId } = authData;

    // if (!userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Extract and validate target user ID
    const { searchParams } = new URL(request.url);
    const targetUserId = z
      .string()
      .min(1)
      .parse(searchParams.get("id") || null);
    // .parse(searchParams.get("id") || userId);

    // // Authorization check
    // if (targetUserId !== userId) {
    //   const requestingUser = await prisma.user.findUnique({
    //     where: { id: userId },
    //     select: { role: true },
    //   });

    //   if (!requestingUser || requestingUser.role !== "ADMIN") {
    //     return NextResponse.json(
    //       { error: "Unauthorized access" },
    //       { status: 403 }
    //     );
    //   }
    // }

    // Fetch user data
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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error(
      "Error fetching user data:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
