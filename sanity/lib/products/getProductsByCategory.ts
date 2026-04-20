import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";
import type { SortValue } from "@/components/OrderBy";

// Map the UI sort value to a GROQ order expression.
// The sort param is now consumed here so changing the dropdown actually
// re-orders the products rather than just changing the URL.
function toGroqOrder(sort: SortValue | undefined): string {
  switch (sort) {
    case "price-asc":  return "price asc";
    case "price-desc": return "price desc";
    case "newest":     return "_createdAt desc";
    case "popular":    return "name asc"; // replace with a salesCount field when available
    default:           return "name asc";
  }
}

export const getProductsByCategory = async (
  categorySlug: string,
  sort?: SortValue
) => {
  const order = toGroqOrder(sort);

  const PRODUCTS_BY_CATEGORY_QUERY = defineQuery(`
    *[_type == "product" && references(*[_type == "category" && slug.current == $categorySlug]._id)]
    | order(${order})
  `);

  try {
    const products = await sanityFetch({
      query: PRODUCTS_BY_CATEGORY_QUERY,
      params: { categorySlug },
    });
    return products.data || [];
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
};