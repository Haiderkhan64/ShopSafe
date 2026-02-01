import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

/**
 * Fetches all products that belong to a specific category
 *
 * @param categorySlug - The slug of the category to filter by
 * @returns A list of products that match the category slug
 * @throws Error when the fetch operation fails
 */

export const getProductsByCategory = async (categorySlug: string) => {
  const PRODUCTS_BY_CATEGORY_QUERY = defineQuery(`
    *[_type == "product" && references(*[_type == "category" && slug.current == $categorySlug]._id)] | order(name asc)
  `);

  try {
    const products = await sanityFetch({
      query: PRODUCTS_BY_CATEGORY_QUERY,
      params: {
        categorySlug,
      },
    });

    return products.data || [];
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
};
