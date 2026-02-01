import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid product IDs" },
        { status: 400 }
      );
    }

    console.log('Fetching products from Sanity:', ids);

    // Fetch products from Sanity by their IDs
    const query = `*[_type == "product" && _id in $ids]{
      _id,
      _type,
      _createdAt,
      _updatedAt,
      name,
      description,
      price,
      image,
      slug,
      stock,
      category
    }`;

    const products = await client.fetch(query, { ids });

    console.log('Products fetched:', products.length);

    return NextResponse.json(products);

  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch products", 
        details: error instanceof Error ? error.message : 'Unknown' 
      },
      { status: 500 }
    );
  }
}