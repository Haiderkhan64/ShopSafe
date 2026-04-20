import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

// Characters that have special meaning in GROQ's `match` operator.
// Stripping them prevents crafted inputs from producing unintended broad
// matches (e.g. a bare "*" matches everything) or triggering excessive
// index backtracking.
const GROQ_SPECIAL_RE = /[\*\[\]\^~\?\\]/g;

function sanitiseSearchParam(raw: string): string {
  return raw
    .trim()
    .replace(GROQ_SPECIAL_RE, "")
    .replace(/\s+/g, " ")
    .slice(0, 100); // hard cap — GROQ match on very long strings is expensive
}

export const searchProductsByName = async (searchParam: string) => {
  // sanitise before wrapping in wildcards.  Previously the raw user
  // string was interpolated directly so `*` alone matched the entire product
  // catalogue, and crafted inputs could trigger expensive index scans.
  const safe = sanitiseSearchParam(searchParam);

  // Require a minimum of 2 meaningful characters so we never query the
  // entire catalogue on a one-character or whitespace-only input.
  if (safe.length < 2) return [];

  const PRODUCT_SEARCH_QUERY = defineQuery(`
    *[_type == "product" && name match $searchParam] | order(name asc)
  `);

  try {
    const products = await sanityFetch({
      query: PRODUCT_SEARCH_QUERY,
      params: {
        searchParam: `${safe}*`,
      },
    });
    return products.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};