import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Fetching cart for user:', userId);

    // Get the user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: {
        items: true // Don't include product - it's in Sanity
      }
    });

    if (!cart) {
      console.log('No cart found, returning empty');
      return NextResponse.json({
        id: null,
        userId: userId,
        items: []
      });
    }

    console.log('Cart found:', cart);
    return NextResponse.json(cart);

  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart", details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}