import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Clear the entire cart for a user
 * Called after successful checkout
 */
export async function POST(req: Request) {
  try {
    // Support both Clerk auth and internal webhook calls
    const { userId: clerkUserId } = await auth();
    const body = await req.json().catch(() => ({}));
    
    // Use Clerk userId if available, otherwise use userId from body (webhook)
    const userId = clerkUserId || body.userId;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🧹 Clearing cart for user:', userId);

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: userId }
    });

    if (!cart) {
      console.log('No cart found to clear');
      return NextResponse.json({ success: true, message: 'No cart to clear' });
    }

    // Delete all items in the cart
    const deleted = await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    console.log(`Cart cleared successfully - deleted ${deleted.count} items`);

    return NextResponse.json({ 
      success: true,
      message: 'Cart cleared successfully',
      itemsDeleted: deleted.count
    });

  } catch (error) {
    console.error("Failed to clear cart:", error);
    return NextResponse.json(
      { 
        error: "Failed to clear cart",
        details: error instanceof Error ? error.message : 'Unknown'
      },
      { status: 500 }
    );
  }
}