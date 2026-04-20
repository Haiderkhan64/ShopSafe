/**
 * Maximum quantity of any single product allowed in the cart.
 * Enforced on both the client (Zustand store) and every server cart endpoint.
 * Change here — nowhere else.
 */
export const MAX_CART_QUANTITY = 99;

/**
 * Maximum number of product IDs accepted in a single batch-fetch request.
 * Prevents clients from enumerating the entire Sanity catalogue.
 */
export const MAX_BATCH_PRODUCT_IDS = 100;

/**
 * ISR revalidation period for the home page (seconds).
 * Products + categories + active sales are refreshed at most once per minute.
 * NOTE: for catalogues exceeding ~200 SKUs, replace getAllProducts() with a
 * paginated GROQ query using `[offset..offset+limit - 1]` slice syntax and
 * implement client-side infinite scroll / cursor pagination.
 */
export const REVALIDATE_HOME_SECONDS = 60;

/**
 * ISR revalidation period for individual product pages (seconds).
 * 15 minutes is reasonable — product details change far less often than stock.
 */
export const REVALIDATE_PRODUCT_PAGE_SECONDS = 60 * 15;