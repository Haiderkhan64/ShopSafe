import ProductsView from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ShoppingBag,
  Shield,
  Truck,
  Sparkles,
  TrendingUp,
  Award,
  Star,
  Heart,
  Zap,
  CheckCircle,
  Clock,
  Package,
  Headphones,
  ArrowRight,
  Gift,
  Flame,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const products = await getAllProducts();
  const categories = await getAllCategories();

  const { userId } = await auth();

  if (userId) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/user?id=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch user:", res.statusText);
      redirect("/onboarding");
    }

    const data = await res.json();
    const dbUser = data?.user;

    if (!dbUser?.id) {
      redirect("/onboarding");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/10 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/20 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-20 dark:opacity-30 animate-pulse"
            style={{
              background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
              animationDuration: "6s",
            }}
          />
          <div
            className="absolute bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 dark:opacity-30 animate-pulse"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              animationDelay: "1s",
              animationDuration: "8s",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-10 dark:opacity-20 animate-pulse"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
              animationDelay: "2s",
              animationDuration: "10s",
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-16">
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 shadow-xl backdrop-blur-sm border-2 border-purple-200 dark:border-purple-500/30 bg-gradient-to-br from-purple-50/90 to-purple-100/90 dark:from-purple-900/40 dark:to-purple-800/40 hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400 animate-pulse" />
              <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                Welcome to ShopSafe
              </span>
              <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400 animate-pulse" />
            </div>

            {/* Main Heading with enhanced animation */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight">
              <span className="text-gray-900 dark:text-gray-100 inline-block hover:scale-105 transition-transform duration-300">
                Shop Secure,
              </span>
              <br />
              <span
                className="text-transparent bg-clip-text inline-block hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #574095 0%, #6B46C1 50%, #FFD700 100%)",
                }}
              >
                Shop Smart
              </span>
            </h1>

            {/* Subtitle with icon */}
            <div className="flex items-center justify-center gap-2 mb-10">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed font-medium">
                Discover premium products with unbeatable deals, secure
                checkout, and fast delivery.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <section className="scroll-mt-24">
                <a
                  href="#products"
                  className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <ShoppingBag className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Start Shopping</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </section>
              <a
                href="#deals"
                className="group inline-flex items-center justify-center gap-2 px-10 py-5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-purple-600 dark:border-purple-400 hover:border-yellow-500 dark:hover:border-yellow-400"
              >
                <Gift className="w-6 h-6 text-yellow-500 dark:text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
                <span>View Deals</span>
                <Flame className="w-5 h-5 text-orange-500 group-hover:scale-125 transition-transform duration-300" />
              </a>
            </div>

            {/* Trust Indicators with enhanced styling */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 cursor-default">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Secure
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  100% Protected
                </p>
              </div>

              <div className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-500 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-105 cursor-default">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Fast Delivery
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  2-5 Business Days
                </p>
              </div>

              <div className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 cursor-default">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Quality
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Premium Products
                </p>
              </div>

              <div className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 hover:scale-105 cursor-default">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Best Deals
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Up to 40% Off
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Wave Divider */}
        <div className="relative h-20">
          <svg
            className="absolute bottom-0 w-full h-20 fill-white dark:fill-gray-900 transition-colors duration-300"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M0,0 C300,80 600,80 900,40 C1050,20 1150,40 1200,60 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-white dark:bg-gray-900 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why Choose ShopSafe?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience shopping the way it should be - safe, simple, and
              satisfying
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative p-8 bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-transparent dark:from-purple-900/30 rounded-bl-full opacity-50" />
              <div className="relative">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Verified Products
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Every product is carefully verified and authenticated before
                  listing. Shop with complete confidence.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 bg-gradient-to-br from-yellow-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-yellow-300 dark:hover:border-yellow-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200 to-transparent dark:from-yellow-900/30 rounded-bl-full opacity-50" />
              <div className="relative">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  24/7 Support
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Our dedicated support team is always ready to help you with
                  any questions or concerns.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-green-300 dark:hover:border-green-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200 to-transparent dark:from-green-900/30 rounded-bl-full opacity-50" />
              <div className="relative">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Easy Returns
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Not satisfied? Return any product within 30 days with our
                  hassle-free return policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full bg-gradient-to-br from-purple-600 to-purple-800 dark:from-purple-900 dark:to-purple-950 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                50K+
              </div>
              <div className="text-purple-200 font-medium">Happy Customers</div>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                100K+
              </div>
              <div className="text-purple-200 font-medium">Products Sold</div>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                4.7/5
              </div>
              <div className="text-purple-200 font-medium">Average Rating</div>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                24/7
              </div>
              <div className="text-purple-200 font-medium">
                Customer Support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div
        id="products"
        className="w-full max-w-[1650px] mx-auto bg-white dark:bg-gray-900 rounded-t-3xl transition-colors duration-300 -mt-8 relative z-10 shadow-2xl"
      >
        <ProductsView products={products} categories={categories} />
      </div>

      {/* Newsletter Section */}
      <div className="w-full bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-950 dark:to-purple-950/30 py-16 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-purple-100 dark:bg-purple-900/50">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
              Stay Updated
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Get Exclusive Deals & Updates
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new
            arrivals, special offers, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none transition-all duration-300"
            />
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
