import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { MAX_BATCH_PRODUCT_IDS } from "@/lib/constants";

// Sanity document IDs are either:
//   - Auto-generated: exactly 21 alphanumeric + underscore chars  (e.g. abc123...)
//   - Custom/drafts:  "drafts.<id>" prefix or user-defined slugs
// We accept the broadest safe subset: alphanumeric, hyphens, underscores, dots.
// Max length 80 covers all real Sanity ID shapes with headroom.
const SANITY_ID_RE = /^[a-zA-Z0-9_.\-]{1,80}$/;

function isValidSanityId(id: unknown): id is string {
  return typeof id === "string" && SANITY_ID_RE.test(id);
}

// This endpoint is POST (to send a body) but is logically a read.
// We still verify Origin so a malicious page cannot enumerate product data
// by triggering a credentialed POST from another origin.
function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  // Server-to-server calls (no Origin header) are allowed — they cannot
  // originate from a browser cross-site request.
  if (!origin) return true;

  const allowed = process.env.NEXT_PUBLIC_BASE_URL;
  if (!allowed) {
    // In development without BASE_URL set, allow localhost origins.
    return (
      process.env.NODE_ENV !== "production" ||
      origin.startsWith("http://localhost")
    );
  }

  // Allow exact match and the same origin with optional trailing slash.
  return origin === allowed || origin === allowed.replace(/\/$/, "");
}

export async function POST(req: Request) {
  // FIX 13: CSRF defense in depth — reject cross-origin requests.
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { ids } = body as Record<string, unknown>;

    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.length > MAX_BATCH_PRODUCT_IDS
    ) {
      return NextResponse.json(
        { error: `ids must be a non-empty array (max ${MAX_BATCH_PRODUCT_IDS})` },
        { status: 400 }
      );
    }

    const invalidIds = ids.filter((id) => !isValidSanityId(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "One or more ids have an invalid format" },
        { status: 400 }
      );
    }

    // Safe: all IDs are validated against the allowlist regex before interpolation.
    const query = `*[_type == "product" && _id in $ids]{
      _id,
      _type,
      _createdAt,
      _updatedAt,
      name,
      description,
      price,
      discount,
      image,
      slug,
      stock,
      category
    }`;

    const products = await client.fetch(query, { ids });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}