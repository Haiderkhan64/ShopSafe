import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MAX_CART_QUANTITY } from "@/lib/constants";
import { rateLimit, verifyCsrfOrigin } from "@/lib/rate-limit";

const SyncBodySchema = z.object({
  productId: z.string().min(1),
  action: z.enum(["add", "remove"]),
  quantity: z.number().int().min(1).max(MAX_CART_QUANTITY).default(1),
});

export async function POST(req: Request) {
  // Verify Origin header to prevent cross-site request forgery.
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limited = await rateLimit(req, { windowMs: 60000, max: 30 });
  if (limited) return limited;

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = SyncBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { productId, action, quantity } = parsed.data;

    // look up the internal user record by clerkId.
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    if (action === "add") {
      const existing = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      const newQuantity = Math.min(
        (existing?.quantity ?? 0) + quantity,
        MAX_CART_QUANTITY
      );

      await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        create: { cartId: cart.id, productId, quantity: newQuantity },
        update: { quantity: newQuantity },
      });
    } else {
      const existing = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      if (existing) {
        const newQuantity = existing.quantity - quantity;
        if (newQuantity <= 0) {
          await prisma.cartItem.delete({ where: { id: existing.id } });
        } else {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: newQuantity },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync cart",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}