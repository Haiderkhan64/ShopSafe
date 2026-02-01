// app/api/webhooks/clerk/route.ts
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

  // Handle different webhook events
  const eventType = evt.type;
  console.log(`Received webhook: ${eventType}`);

  try {
    switch (eventType) {


      case "user.deleted": {
        const { id } = evt.data;
        
        
        
        if (!id) {
          return NextResponse.json(
            { error: "No user ID in webhook" },
            { status: 400 }
          );
        }

        // End all active sessions for this user
        await prisma.session.updateMany({
          where: { userId: id, isActive: true },
          data: {
            endTime: new Date(),
            isActive: false,
            duration: 0, // Or calculate based on startTime
          },
        });

        // Optionally delete the user from your database
        await prisma.user.delete({
          where: { id },
        });
        
        console.log(`User deleted and sessions ended: ${id}`);
        break;
      }

      case "session.ended": {
        // Clerk does send this event when a session ends
        const { user_id } = evt.data;
        
        if (!user_id) {
          return NextResponse.json(
            { error: "No user ID in webhook" },
            { status: 400 }
          );
        }

        const session = await prisma.session.findFirst({
          where: { userId: user_id, isActive: true },
          orderBy: { createdAt: "desc" },
        });
        console.log(session?.id,"++++++++++++++++++++++++++++");
        if (session) {
          console.log(session.id,"++++++++++++++++++++++++++++");
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