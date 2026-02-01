import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { localItems } = await req.json();

    console.log('Merging cart for user:', userId);
    console.log('Local items:', localItems);

    // Get or create the user's cart
    let cart = await prisma.cart.upsert({
      where: { userId: userId },
      create: { userId: userId },
      update: {},
      include: {
        items: true
      }
    });

    console.log('Cart found/created:', cart.id);

    // CRITICAL FIX: Don't ADD quantities, SET them from localStorage
    // This prevents duplication on every page load
    for (const localItem of localItems) {
      const productId = localItem.product._id;
      const quantity = localItem.quantity;

      // Just SET the quantity from localStorage (don't add to existing)
      await prisma.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: productId
          }
        },
        create: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity // Use the exact quantity from localStorage
        },
        update: {
          quantity: quantity // Replace database quantity with localStorage quantity
        }
      });

      console.log(`Set item ${productId} to quantity ${quantity}`);
    }

    // Return the final cart
    const finalCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: true
      }
    });

    console.log('Final cart:', finalCart);

    return NextResponse.json(finalCart);

  } catch (error) {
    console.error("=== CART MERGE ERROR ===");
    console.error("Error details:", error);
    console.error("Error message:", error instanceof Error ? error.message : 'Unknown');
    console.error("Stack trace:", error instanceof Error ? error.stack : 'N/A');
    
    return NextResponse.json(
      { 
        error: "Failed to merge cart", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Handle single item add/remove operations
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, action, quantity = 1 } = await req.json();

    console.log(`PATCH cart: ${action} ${quantity}x ${productId}`);

    const cart = await prisma.cart.upsert({
      where: { userId: userId },
      create: { userId: userId },
      update: {}
    });

    if (action === "add") {
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: { cartId: cart.id, productId }
        }
      });

      const newQuantity = (existingItem?.quantity || 0) + quantity;

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

      console.log(`Added/updated item ${productId} to ${newQuantity}`);

    } else if (action === "remove") {
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: { cartId: cart.id, productId }
        }
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity - quantity;
        
        if (newQuantity <= 0) {
          await prisma.cartItem.delete({
            where: { id: existingItem.id }
          });
          console.log(`Removed item ${productId}`);
        } else {
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity }
          });
          console.log(`Decreased item ${productId} to ${newQuantity}`);
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to sync cart" },
      { status: 500 }
    );
  }
}