import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const payload = await req.text();
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 401 }
    );
  }

  const eventType = evt.type;
  console.log(`Received webhook: ${eventType}`);

  try {
    switch (eventType) {
      case "user.deleted": {
        const { id: clerkId } = evt.data;

        if (!clerkId) {
          return NextResponse.json(
            { error: "No user ID in webhook" },
            { status: 400 }
          );
        }

        // FIX 8: look up by clerkId.
        const dbUser = await prisma.user.findUnique({
          where: { clerkId },
          select: { id: true, _count: { select: { orders: true } } },
        });

        if (!dbUser) {
          console.log(`user.deleted: no DB record for clerkId ${clerkId}, skipping`);
          break;
        }

        // End all active sessions.
        await prisma.session.updateMany({
          where: { userId: dbUser.id, isActive: true },
          data: { endTime: new Date(), isActive: false, duration: 0 },
        });

        // Clear cart.
        const cart = await prisma.cart.findUnique({
          where: { userId: dbUser.id },
          select: { id: true },
        });
        if (cart) {
          await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
          await prisma.cart.delete({ where: { id: cart.id } });
        }

        if (dbUser._count.orders > 0) {
          // Soft-delete: anonymise PII but preserve order audit trail.
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              isActive: false,
              email: `deleted-${dbUser.id}@deleted.invalid`,
              name: "[Deleted User]",
              address: null,
              password: null,
              // clerkId left as-is: still unique, not PII, useful for audit.
            },
          });
          console.log(
            `user.deleted: soft-deleted user id=${dbUser.id} (has ${dbUser._count.orders} orders)`
          );
        } else {
          await prisma.user.delete({ where: { id: dbUser.id } });
          console.log(`user.deleted: hard-deleted user id=${dbUser.id}`);
        }

        break;
      }

      case "session.ended": {
        const { user_id: clerkUserId } = evt.data;

        if (!clerkUserId) {
          return NextResponse.json(
            { error: "No user ID in webhook" },
            { status: 400 }
          );
        }

        // resolve internal id from clerkId.
        const user = await prisma.user.findUnique({
          where: { clerkId: clerkUserId },
          select: { id: true },
        });

        if (!user) break;

        const session = await prisma.session.findFirst({
          where: { userId: user.id, isActive: true },
          orderBy: { createdAt: "desc" },
        });

        if (session) {
          const endTime = new Date();
          const duration = Math.floor(
            (endTime.getTime() - session.startTime.getTime()) / 1000
          );
          await prisma.session.update({
            where: { id: session.id },
            data: { endTime, duration, isActive: false },
          });
          console.log(`Session ended: ${session.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error processing webhook ${eventType}:`, error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}