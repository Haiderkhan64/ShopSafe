import ProductsView from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getProductsByCategory } from "@/sanity/lib/products/getProductsByCategory";
import type { SortValue } from "@/components/OrderBy";
import { FC, ReactElement } from "react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  // accept searchParams so the sort dropdown actually changes the order.
  searchParams: Promise<{ sort?: string }>;
}

const CategoryPage: FC<CategoryPageProps> = async ({
  params,
  searchParams,
}): Promise<ReactElement> => {
  const slug = (await params).slug;
  const { sort } = await searchParams;

  const [products, categories] = await Promise.all([
    getProductsByCategory(slug, sort as SortValue | undefined),
    getAllCategories(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/20 transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-20 dark:opacity-30 animate-pulse"
          style={{ background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)", animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 dark:opacity-30 animate-pulse"
          style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)", animationDelay: "2s", animationDuration: "10s" }}
        />
      </div>

      <div className="relative flex flex-col w-full max-w-[1650px] items-center h-full mx-auto">
        <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col">
          <div className="mb-6">
            <div className="relative">
              <div
                className="h-1 w-full rounded-full mb-4"
                style={{ background: "linear-gradient(90deg, #574095 0%, #6B46C1 50%, #FFD700 100%)" }}
              />
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 rounded-2xl blur-lg opacity-20 dark:opacity-30 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-purple-100 dark:border-purple-800 transition-colors duration-300">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl shadow-md bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                          {slug.replace(/-/g, " ")}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Explore our {slug.replace(/-/g, " ")} collection
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 border border-yellow-300 dark:border-yellow-600 shadow-sm">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-sm font-bold text-yellow-800 dark:text-yellow-300">
                        {products.length} {products.length === 1 ? "Product" : "Products"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow h-full">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200 dark:from-purple-900/20 dark:via-purple-800/20 dark:to-purple-900/20 rounded-3xl blur-xl opacity-30" />
              <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border border-purple-100 dark:border-purple-800 transition-colors duration-300">
                <ProductsView products={products} categories={categories} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;