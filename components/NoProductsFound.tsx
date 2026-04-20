import Link from "next/link";
import { Search, ShoppingBag, Home, Sparkles } from "lucide-react";

const NoProductsFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/20 flex items-center justify-center px-4 py-16 transition-colors duration-300">
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

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Animated Icon */}
        <div className="relative mb-8 inline-block">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-20 dark:opacity-30 animate-pulse"
            style={{
              background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
            }}
          />
          <div className="relative p-8 rounded-full shadow-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 transition-colors duration-300">
            <Search
              size={80}
              strokeWidth={1.5}
              className="text-purple-600 dark:text-purple-400"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          No Products Found
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
          We couldn&apos;t find any products matching your search criteria. Try
          adjusting your search terms or explore our full collection.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
            }}
          >
            <Home className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Browse All Products</span>
          </Link>

          <Link
            href="/deals"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-purple-600 dark:border-purple-500"
          >
            <Sparkles className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            <span>View Deals</span>
          </Link>
        </div>

        {/* Search Tips */}
        <div className="p-6 rounded-2xl border-2 text-left max-w-lg mx-auto bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border-purple-200 dark:border-yellow-700 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-200 dark:bg-yellow-800/50">
              <ShoppingBag className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Search Tips
            </h3>
          </div>

          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-lg text-purple-600 dark:text-purple-400">
                •
              </span>
              <span>Check your spelling and try again</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg text-purple-600 dark:text-purple-400">
                •
              </span>
              <span>Try using more general keywords</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg text-purple-600 dark:text-purple-400">
                •
              </span>
              <span>Browse our categories to discover products</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg text-purple-600 dark:text-purple-400">
                •
              </span>
              <span>Use fewer keywords for broader results</span>
            </li>
          </ul>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/50">
              <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Wide Selection
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Thousands of products
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/50">
              <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Daily Deals
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              New offers every day
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/50">
              <Home className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Fast Delivery
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Quick & reliable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoProductsFound;
