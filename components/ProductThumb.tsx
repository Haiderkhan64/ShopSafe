"use client";

import { formatCurrency } from "@/lib/formatCurrency";
import { getEffectivePrice } from "@/lib/getEffectivePrice";
import { imageUrl } from "@/lib/imageUrl";
import { Product } from "@/sanity.types";
import Image from "next/image";
import Link from "next/link";
import { FC, type ReactElement } from "react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Eye, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductThumbProps {
  product: Product;
  /** Sitewide sale discount percentage (0–100). 0 = no sitewide sale. */
  discountPercent?: number;
}

const ProductThumb = ({
  product,
  discountPercent = 0,
}: ProductThumbProps): ReactElement => {
  const isOutOfStock = product.stock != null && product.stock <= 0;
  const router = useRouter();

  const {
    discountedPrice,
    originalPrice,
    effectiveDiscount,
    hasDiscount,
    discountAmount,
  } = getEffectivePrice(product, discountPercent);

  const displayPrice = discountedPrice;

  return (
    <Link
      href={`/product/${product.slug?.current}`}
      className={`group w-full min-w-[350px] h-[500px] md:min-h-[680px] flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-2xl dark:hover:shadow-purple-900/20 transition-all duration-500 overflow-hidden ${
        isOutOfStock ? "opacity-50" : ""
      }`}
    >
      {/* Image Container */}
      <div className="relative h-[70%] overflow-hidden bg-gradient-to-br from-slate-50 to-purple-50/20 dark:from-gray-800 dark:to-purple-900/20 transition-colors duration-300">
        {product.image && (
          <Image
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            src={imageUrl(product.image).url()}
            alt={product.name || "Product Image"}
            priority
            fill
            unoptimized
          />
        )}

        {hasDiscount && (
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-1 px-3 py-2 rounded-full shadow-lg backdrop-blur-sm bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-500 dark:to-orange-500">
              <span className="text-sm font-bold text-yellow-900 dark:text-yellow-950">
                {effectiveDiscount}% OFF
              </span>
            </div>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <span className="text-white text-xl font-bold block mb-2">
                Out of Stock
              </span>
              <span className="text-white/80 dark:text-white/70 text-sm">
                Check back soon
              </span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 p-6 flex gap-3">
          <Button
            className="flex-1 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 border-0"
            style={{
              background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
            }}
          >
            <Eye className="w-4 h-4" />
            Quick View
          </Button>

          <Button
            className="px-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push("/basket");
            }}
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 bg-white dark:bg-gray-900 flex-1 flex flex-col justify-between transition-colors duration-300">
        <div>
          <h2
            className="text-base font-bold rounded-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-3 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #908cc2 0%, #6B46C1 100%)",
            }}
          >
            {product.name}
          </h2>
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            {hasDiscount && (
              <span className="text-sm line-through font-medium text-gray-400 dark:text-gray-500">
                {formatCurrency(originalPrice)}
              </span>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500">
                {formatCurrency(displayPrice)}
              </span>
              {hasDiscount && discountAmount > 0 && (
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded">
                  Save {formatCurrency(discountAmount)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

ProductThumb.displayName = "ProductThumb";

const ProductThumbSkeleton: FC = (): ReactElement => {
  return (
    <div className="w-full min-w-[350px] h-[500px] md:min-h-[680px] flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden animate-pulse transition-colors duration-300">
      <div className="relative h-[70%] overflow-hidden bg-gradient-to-br from-slate-100 to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
        <Skeleton className="w-full h-full bg-gray-200 dark:bg-gray-700" />
        <div className="absolute top-4 left-4 z-20">
          <Skeleton className="w-24 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-gray-900 flex-1 flex flex-col justify-between transition-colors duration-300">
        <div className="space-y-3">
          <Skeleton className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <Skeleton className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        <div className="flex items-end justify-between mt-4">
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-28 bg-gray-300 dark:bg-gray-600 rounded" />
              <Skeleton className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductThumb.Skeleton = ProductThumbSkeleton;
ProductThumb.Skeleton.displayName = "ProductThumbSkeleton";

export default ProductThumb;