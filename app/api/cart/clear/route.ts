import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { verifyCsrfOrigin } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Verify Origin header to prevent CSRF.
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      // No user record yet — nothing to clear
      return NextResponse.json({ success: true, itemsDeleted: 0 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!cart) {
      return NextResponse.json({ success: true, itemsDeleted: 0 });
    }

    const deleted = await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({ success: true, itemsDeleted: deleted.count });
  } catch (error) {
    console.error("POST /api/cart/clear failed:", error);
    return NextResponse.json(
      {
        error: "Failed to clear cart",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}