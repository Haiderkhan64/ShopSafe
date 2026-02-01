// import NoProductsFound from "@/components/NoProductsFound";
// import ProductGrid from "@/components/ProductGrid";
// import { searchProductsByName } from "@/sanity/lib/products/searchProductsByName";
// import { Search, Sparkles } from "lucide-react";
// import type { FC } from "react";

// interface SearchParams {
//   searchParams: Promise<{
//     query: string;
//   }>;
// }

// const SearchPage: FC<SearchParams> = async ({
//   searchParams,
// }): Promise<React.ReactElement> => {
//   const { query } = await searchParams;
//   const products = await searchProductsByName(query);

//   if (!products.length) {
//     return <NoProductsFound />;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20">
//       <div className="max-w-[1650px] mx-auto px-4 py-8 md:py-12">
//         {/* Search Header */}
//         <div className="mb-8 md:mb-12">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <div
//               className="p-3 rounded-xl shadow-lg"
//               style={{ background: 'linear-gradient(135deg, #574095 0%, #6B46C1 100%)' }}
//             >
//               <Search className="w-6 h-6 text-white" />
//             </div>
//             <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
//               Search Results
//             </h1>
//           </div>

//           {/* Search Query Display */}
//           <div className="flex items-center justify-center gap-2 flex-wrap">
//             <p className="text-gray-600 text-lg">
//               Showing results for
//             </p>
//             <span
//               className="text-xl md:text-2xl font-bold text-transparent bg-clip-text px-3 py-1 rounded-lg"
//               style={{
//                 backgroundImage: 'linear-gradient(90deg, #574095 0%, #6B46C1 100%)',
//                 backgroundColor: '#F3E8FF'
//               }}
//             >
//               "{query}"
//             </span>
//           </div>

//           {/* Results Count Badge */}
//           <div className="flex justify-center mt-4">
//             <div
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-md"
//               style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' }}
//             >
//               <Sparkles className="w-4 h-4" style={{ color: '#D97706' }} />
//               <span className="text-sm font-semibold" style={{ color: '#92400E' }}>
//                 {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
//               </span>
//             </div>
//           </div>

//           {/* Decorative Line */}
//           <div className="flex justify-center mt-6">
//             <div
//               className="h-1 w-24 rounded-full"
//               style={{ background: 'linear-gradient(90deg, #574095 0%, #6B46C1 100%)' }}
//             />
//           </div>
//         </div>

//         {/* Product Grid */}
//         <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
//           <ProductGrid products={products} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SearchPage;

import NoProductsFound from "@/components/NoProductsFound";
import ProductGrid from "@/components/ProductGrid";
import { searchProductsByName } from "@/sanity/lib/products/searchProductsByName";
import { Search, Sparkles, Filter, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

interface SearchParams {
  searchParams: Promise<{
    query: string;
  }>;
}

const SearchPage: FC<SearchParams> = async ({
  searchParams,
}): Promise<React.ReactElement> => {
  const { query } = await searchParams;
  const products = await searchProductsByName(query);

  if (!products.length) {
    return <NoProductsFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/20 transition-colors duration-300">
      {/* Animated Background Elements */}
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

      <div className="relative max-w-[1650px] mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Home
          </Link>
        </div>

        {/* Search Header */}
        <div className="mb-8 md:mb-12">
          {/* Icon and Title */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div
                className="relative p-4 rounded-2xl shadow-xl transform group-hover:scale-110 transition-transform duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
                }}
              >
                <Search className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100">
              Search Results
            </h1>
          </div>

          {/* Search Query Display */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl font-medium">
              Showing results for
            </p>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-purple-300 dark:from-purple-800 dark:to-purple-700 rounded-xl blur opacity-50" />
              <span
                className="relative text-xl md:text-3xl font-bold text-transparent bg-clip-text px-6 py-2 rounded-xl inline-block"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #574095 0%, #6B46C1 50%, #8B5CF6 100%)",
                  backgroundColor: "#F3E8FF",
                }}
              >
                "{query}"
              </span>
            </div>
          </div>

          {/* Results Count Badge with Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div
                className="relative inline-flex items-center gap-2 px-6 py-3 rounded-full shadow-lg border-2 border-yellow-300 dark:border-yellow-600 group-hover:scale-105 transition-transform duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                }}
              >
                <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-500 animate-pulse" />
                <span className="text-base font-bold text-yellow-900 dark:text-yellow-800">
                  {products.length}{" "}
                  {products.length === 1 ? "Product" : "Products"} Found
                </span>
                <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div
              className="h-1 w-16 md:w-24 rounded-full animate-pulse"
              style={{
                background: "linear-gradient(90deg, transparent, #574095)",
                animationDuration: "2s",
              }}
            />
            <div
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ background: "#6B46C1", animationDuration: "1.5s" }}
            />
            <div
              className="h-1 w-32 md:w-48 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #574095 0%, #6B46C1 50%, #FFD700 100%)",
              }}
            />
            <div
              className="h-2 w-2 rounded-full animate-pulse"
              style={{
                background: "#FFD700",
                animationDuration: "1.5s",
                animationDelay: "0.5s",
              }}
            />
            <div
              className="h-1 w-16 md:w-24 rounded-full animate-pulse"
              style={{
                background: "linear-gradient(90deg, #FFD700, transparent)",
                animationDuration: "2s",
                animationDelay: "1s",
              }}
            />
          </div>

          {/* Filter/Sort Bar (Optional - Placeholder) */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl shadow-md hover:shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-300 hover:scale-105">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Sort by:</span>
              <select className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500 outline-none transition-colors duration-200">
                <option>Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
                <option>Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid Container with Enhanced Styling */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 rounded-3xl blur-xl opacity-20 dark:opacity-30" />

          {/* Product Grid Card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 border-2 border-gray-100 dark:border-gray-800 transition-colors duration-300">
            {/* Top Accent Bar */}
            <div
              className="h-1.5 w-full rounded-full mb-6"
              style={{
                background:
                  "linear-gradient(90deg, #574095 0%, #6B46C1 50%, #FFD700 100%)",
              }}
            />

            {/* Product Grid */}
            <ProductGrid products={products} />

            {/* Bottom Stats */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium">All items in stock</span>
                </div>
                <div className="hidden md:block w-1 h-1 rounded-full bg-gray-400" />
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Fast shipping available</span>
                </div>
                <div className="hidden md:block w-1 h-1 rounded-full bg-gray-400" />
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Verified products</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl border-2 border-purple-200 dark:border-purple-700 shadow-lg">
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              Can't find what you're looking for?
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Search className="w-5 h-5" />
              Try Another Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
