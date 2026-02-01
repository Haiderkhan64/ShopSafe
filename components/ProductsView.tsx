import { type Category, type Product } from "@/sanity.types";
import { FC, ReactElement } from "react";
import { CategoryFilter } from "./CategorySelector";
import NoProductsFound from "@/components/NoProductsFound";
import ProductGrid from "@/components/ProductGrid";
import { OrderBy } from "./OrderBy";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
}

const ProductsView: FC<ProductsViewProps> = ({
  products,
  categories,
}): ReactElement => {
  return (
    <div className="w-full h-full p-4 flex flex-col">
      <div className="w-full flex flex-col md:flex-row items-end md:justify-end gap-4 mb-6">
        <OrderBy />
        <CategoryFilter categories={categories} />
      </div>

      {/* Products */}
      <div className="flex-grow h-full">
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <NoProductsFound />
        )}
      </div>
    </div>
  );
};

export default ProductsView;
