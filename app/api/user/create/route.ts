// app/api/user/create/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for user creation
const createUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().optional(),
  role: z.enum(["ADMIN", "ANALYST", "CUSTOMER"]).default("CUSTOMER"),
});

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request data
    const data = await request.json();
    const parsed = createUserSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
    }

    const { id, email, name, address, role } = parsed.data;

    // For security, ensure the authenticated user ID matches the created user ID
    if (id !== userId) {
      return NextResponse.json(
        { error: "ID mismatch - you can only create your own account" },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Create the new user
    const user = await prisma.user.create({
      data: {
        id,
        email,
        name,
        address,
        role: role || "CUSTOMER",
        isActive: true,
      },
    });

    // Create an initial session for analytics
    await prisma.session.create({
      data: {
        userId: user.id,
        ipAddress: request.headers.get("x-forwarded-for") || null,
        userAgent: request.headers.get("user-agent") || null,
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
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
