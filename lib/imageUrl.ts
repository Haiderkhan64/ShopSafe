import { client } from "@/sanity/lib/client";
import ImageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

const builder = ImageUrlBuilder(client);

/**
 *
 * Returns a URL for the given image source.
 *
 * @param {SanityImageSource} source - The image source to generate a URL for.
 * @returns {string} The URL for the image.
 *
 * @example
 * const url = imageUrl({
 *   _type: "image",
 *   asset: {
 *     _ref: "image-123",
 *   },
 * });
 *
 */

export function imageUrl(source: SanityImageSource) {
  return builder.image(source);
}
