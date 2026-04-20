import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MAX_CART_QUANTITY } from "@/lib/constants";
import { verifyCsrfOrigin } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";

const MergeItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(MAX_CART_QUANTITY),
});

const MergeBodySchema = z.object({
  localItems: z.array(MergeItemSchema),
});

export async function POST(req: Request) {
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ items: [] });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = MergeBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { localItems } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // FIX: Wrap the entire read-modify-write in a serialisable transaction so
    // concurrent merge requests from multiple tabs cannot interleave and
    // double-count quantities.  We use a Postgres advisory lock keyed on a
    // stable hash of the internal user id so only one merge per user runs at
    // a time without locking unrelated rows.
    const itemCount = await prisma.$transaction(
      async (tx) => {
        // Advisory lock: pg_try_advisory_xact_lock acquires a session lock
        // that is automatically released when the transaction commits or rolls
        // back.  We derive a stable bigint from the user id string.
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(
            ('x' || substr(md5(${user.id}), 1, 16))::bit(64)::bigint
          )
        `;

        const cart = await tx.cart.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {},
        });

        if (localItems.length === 0) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
          return 0;
        }

        const values = localItems.map(
          (item) =>
            Prisma.sql`(gen_random_uuid(), ${cart.id}, ${item.productId}, ${item.quantity}, NOW(), NOW())`
        );

        await tx.$executeRaw`
          INSERT INTO "cart_items" ("id", "cartId", "productId", "quantity", "created_at", "updated_at")
          VALUES ${Prisma.join(values)}
          ON CONFLICT ("cartId", "productId")
          DO UPDATE SET
            "quantity"   = EXCLUDED."quantity",
            "updated_at" = NOW()
        `;

        // Remove server items that are no longer in the local cart.
        const incomingIds = localItems.map((i) => i.productId);
        await tx.cartItem.deleteMany({
          where: {
            cartId: cart.id,
            productId: { notIn: incomingIds },
          },
        });

        return localItems.length;
      },
      // SERIALIZABLE isolation prevents phantom reads during the merge window.
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return NextResponse.json({ success: true, itemCount });
  } catch (error) {
    console.error("POST /api/cart/merge failed:", error);
    return NextResponse.json(
      {
        error: "Failed to merge cart",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}