import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";
import type { Product } from "@/sanity.types";

const PAGE_SIZE = 48;

export const getAllProducts = async (
  lastId?: string
): Promise<{ products: Product[]; hasMore: boolean }> => {
  // We use `[0..$pageSize]` in GROQ which is an inclusive range, meaning
  // GROQ returns indices 0..pageSize — exactly (pageSize + 1) items when the
  // catalogue is large enough.  We pass PAGE_SIZE (not PAGE_SIZE+1) as the
  // param so the slice becomes [0..48] = 49 results max.
  const ALL_PRODUCTS_QUERY = lastId
    ? defineQuery(`
        *[_type == "product" && _id > $lastId] | order(_id asc) [0..$pageSize] {
          _id, _type, _createdAt, _updatedAt, _rev,
          name, slug, image, description, price, discount, categories, stock
        }
      `)
    : defineQuery(`
        *[_type == "product"] | order(_id asc) [0..$pageSize] {
          _id, _type, _createdAt, _updatedAt, _rev,
          name, slug, image, description, price, discount, categories, stock
        }
      `);

  try {
    const result = await sanityFetch({
      query: ALL_PRODUCTS_QUERY,
      params: {
        lastId: lastId ?? "",
        // Pass PAGE_SIZE (not PAGE_SIZE+1).  GROQ [0..N] returns N+1 items,
        // so [0..48] returns up to 49 — the extra item is the hasMore signal.
        pageSize: PAGE_SIZE,
      },
    });

    const raw: Product[] = (result.data ?? []) as Product[];

    // If we got more than PAGE_SIZE items back (i.e. the 49th item exists),
    // there is a next page.  Slice to PAGE_SIZE before returning.
    const hasMore = raw.length > PAGE_SIZE;
    const page = hasMore ? raw.slice(0, PAGE_SIZE) : raw;

    const products = page.map((p) => ({
      ...p,
      name: p.name ?? undefined,
      slug: p.slug ?? undefined,
      image: p.image ?? undefined,
      description: p.description ?? undefined,
      price: p.price ?? undefined,
      discount: p.discount ?? undefined,
      categories: p.categories ?? undefined,
      stock: p.stock ?? undefined,
    })) as Product[];

    return { products, hasMore };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], hasMore: false };
  }
};