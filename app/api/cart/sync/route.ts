import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Real-time cart sync endpoint
 * Syncs individual add/remove operations immediately
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, action, quantity = 1 } = await req.json();

    if (!productId || !action) {
      return NextResponse.json(
        { error: "Missing productId or action" },
        { status: 400 }
      );
    }

    // Get or create cart
    const cart = await prisma.cart.upsert({
      where: { userId: userId },
      create: { userId: userId },
      update: {}
    });

    if (action === "add") {
      // Get current quantity
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: { cartId: cart.id, productId }
        }
      });

      const newQuantity = (existingItem?.quantity || 0) + quantity;

      // Update or create
      await prisma.cartItem.upsert({
        where: {
          cartId_productId: { cartId: cart.id, productId }
        },
        create: {
          cartId: cart.id,
          productId,
          quantity: newQuantity
        },
        update: {
          quantity: newQuantity
        }
      });

      console.log(`✅ Added ${quantity} of ${productId} (total: ${newQuantity})`);

    } else if (action === "remove") {
      // Get current quantity
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: { cartId: cart.id, productId }
        }
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity - quantity;
        
        if (newQuantity <= 0) {
          // Delete item completely
          await prisma.cartItem.delete({
            where: { id: existingItem.id }
          });
          console.log(`✅ Removed ${productId} from cart`);
        } else {
          // Decrease quantity
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity }
          });
          console.log(`✅ Decreased ${productId} to ${newQuantity}`);
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json(
      { 
        error: "Failed to sync cart",
        details: error instanceof Error ? error.message : 'Unknown'
      },
      { status: 500 }
    );
  }
}