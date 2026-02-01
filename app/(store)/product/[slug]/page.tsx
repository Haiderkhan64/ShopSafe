import AddToBasketButton from "@/components/AddToBasketButton";
import AddToButton from "@/components/AddToButtons";
import ProductDescriptionToggle from "@/components/ProductDescriptionToggle";
import { imageUrl } from "@/lib/imageUrl";
import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { PortableText } from "next-sanity";
import Image from "next/image";
import { notFound } from "next/navigation";

// Static route optimization
export const dynamic = "force-static";
export const revalidate = 800;

const ProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  const isOutOfStock = product.stock != null && product.stock <= 0;

  // Safely handle the case where product.image might be undefined
  const imageSrc = product.image ? imageUrl(product.image).url() : null;

  // Generate a proper blur placeholder if image exists
  const blurDataURL = product.image
    ? imageUrl(product.image).width(20).quality(20).blur(50).url()
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900 transition-colors duration-300">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-10 dark:opacity-20 animate-pulse"
          style={{
            background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
            animationDuration: "8s",
          }}
        />
        <div
          className="absolute bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-10 dark:opacity-20 animate-pulse"
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            animationDelay: "2s",
            animationDuration: "10s",
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 max-w-7xl mx-auto">
          {/* Image Section */}
          <div className="group">
            <div
              className={`relative h-[440px] md:h-[680px] overflow-hidden rounded-2xl shadow-2xl dark:shadow-purple-900/20 transition-all duration-500 hover:shadow-3xl ${
                isOutOfStock ? "opacity-60" : "hover:scale-[1.02]"
              }`}
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 to-transparent dark:from-purple-900/10 dark:to-transparent pointer-events-none z-10" />

              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={product.name || "Product Image"}
                  priority
                  quality={90}
                  placeholder={blurDataURL ? "blur" : "empty"}
                  blurDataURL={blurDataURL || undefined}
                  fill
                  className="object-cover md:object-contain transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Image not available
                    </p>
                  </div>
                </div>
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 dark:bg-black/80 backdrop-blur-sm z-20">
                  <div className="text-center">
                    <span className="inline-block px-6 py-3 bg-red-600 dark:bg-red-700 text-white text-lg font-bold rounded-full shadow-lg">
                      Out of Stock
                    </span>
                  </div>
                </div>
              )}

              {/* Stock badge for in-stock items */}
              {!isOutOfStock && product.stock != null && (
                <div className="absolute top-4 right-4 z-20">
                  <span className="inline-block px-4 py-2 bg-green-500 dark:bg-green-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    {product.stock} in stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Product Title */}
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {product.name}
                </h1>
                <div className="h-1 w-20 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600" />
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500">
                  ${product.price?.toFixed(2)}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-lg">
                  USD
                </span>
              </div>

              {/* Product Description */}
              <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                <ProductDescriptionToggle
                  description={product.description || []}
                  productId={product._id}
                />
              </div>
              {/* Features/Benefits Section */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl border border-purple-100 dark:border-purple-800 transition-colors duration-300">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Quality Guaranteed
                  </span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl border border-yellow-100 dark:border-yellow-800 transition-colors duration-300">
                  <svg
                    className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Fast Shipping
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div>
                <AddToButton product={product} />
              </div>
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <AddToBasketButton product={product} />
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 pt-6">
                <div className="text-center group">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Secure Payment
                  </span>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Easy Returns
                  </span>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    24/7 Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
