import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const searchProductsByName = async (searchParam: string) => {
  const PRODUCT_SEARCH_QUERY = defineQuery(`
        *[_type == "product" && name match $searchParam] | order(name asc)
    `);

  try {
    /**
     * Fetch products from Sanity with a search query.
     *
     * @param {string} searchParam - The search query to use.
     * @returns {Promise<Array<import("sanity").Document>>} - The list of products that
     * match the search query.
     */

    const products = await sanityFetch({
      query: PRODUCT_SEARCH_QUERY,
      params: {
        searchParam: `*${searchParam}*`,
      },
    });
    return products.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};
