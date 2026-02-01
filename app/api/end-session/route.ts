// import { auth } from "@clerk/nextjs/server";
// import { headers } from "next/headers";
// import { Webhook } from "svix";
// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export async function POST(
//   req: Request
// ) {
//   const headerPayload = await headers();
//   const svixId = headerPayload.get("svix-id");
//   const svixTimestamp = headerPayload.get("svix-timestamp");
//   const svixSignature = headerPayload.get("svix-signature");

//   if (!svixId || !svixTimestamp || !svixSignature) {
//     return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
//   }

//   // CRITICAL: Use text(), not json()
//   const payload = await req.text();
//   const body = JSON.parse(payload);

//   const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
//   if (!webhookSecret) {
//     return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
//   }

//   const wh = new Webhook(webhookSecret);

//   let evt: any;
//   try {
//     evt = wh.verify(payload, {
//       "svix-id": svixId,
//       "svix-timestamp": svixTimestamp,
//       "svix-signature": svixSignature,
//     });
//   } catch (err) {
//     console.error("Webhook verification failed:", err);
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

  
//   try {
//     // const { userId } = await auth();
//     const userId = evt.data.userId
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const session = await prisma.session.findFirst({
//       where: { userId, isActive: true },
//       orderBy: { createdAt: "desc" },
//     });

//     if (!session) {
//       return NextResponse.json(
//         { error: "No active session found" },
//         { status: 404 }
//       );
//     }

//     const endTime = new Date();
//     const duration = Math.floor(
//       (endTime.getTime() - session.startTime.getTime()) / 1000
//     );

//     await prisma.session.update({
//       where: { id: session.id },
//       data: { endTime, duration, isActive: false },
//     });

//     return NextResponse.json({ message: "Session ended" }, { status: 200 });
//   } catch (error) {
//     console.error("Error ending session:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { 
  // NextRequest,
   NextResponse } from "next/server";

export async function POST(
  // req: NextRequest
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.session.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!session) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 404 }
      );
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - session.startTime.getTime()) / 1000
    );

    await prisma.session.update({
      where: { id: session.id },
      data: { endTime, duration, isActive: false },
    });

    return NextResponse.json({ message: "Session ended" }, { status: 200 });
  } catch (error) {
    console.error("Error ending session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
