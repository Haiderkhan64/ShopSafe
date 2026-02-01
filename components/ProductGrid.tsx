"use client";
import type { Product } from "@/sanity.types";
import { AnimatePresence, motion } from "framer-motion";
import { FC, ReactElement, Suspense } from "react";
import ProductThumb from "./ProductThumb";

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: FC<ProductGridProps> = ({ products }): ReactElement => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mt-5 mb-32">
      <AnimatePresence>
        {products.map((product, index) => (
          <motion.div
            key={`${product._id}-${index}`}
            layout
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center"
          >
            <Suspense fallback={<ProductThumb.Skeleton />}>
              <ProductThumb product={product} />
            </Suspense>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;