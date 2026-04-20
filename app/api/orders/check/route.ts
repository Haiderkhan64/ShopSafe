import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "next-sanity";

const ORDER_EXISTS_QUERY = defineQuery(`
  count(*[_type == "order" && clerkUserId == $userId && orderNumber == $orderNumber])
`);

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderNumber = req.nextUrl.searchParams.get("orderNumber");
    if (!orderNumber) {
      return NextResponse.json(
        { error: "Missing orderNumber" },
        { status: 400 }
      );
    }

    const result = await sanityFetch({
      query: ORDER_EXISTS_QUERY,
      params: { userId, orderNumber },
    });

    const count = result.data as number;

    return NextResponse.json({ exists: count > 0 });
  } catch (error) {
    console.error("GET /api/orders/check failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}