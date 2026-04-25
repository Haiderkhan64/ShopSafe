import ProductsView from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";
import { getActiveSales, getBestDiscount } from "@/sanity/lib/sales/getActiveSales";
import {
  ShoppingBag,
  Shield,
  Truck,
  TrendingUp,
  Award,
  Star,
  CheckCircle,
  Clock,
  Package,
  Headphones,
  ArrowRight,
  Gift,
  Flame,
  Users,
} from "lucide-react";

export const revalidate = 60;

export default async function Home() {

  const [{ products }, categories, sales] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getActiveSales(),
  ]);

  const discountPercent = getBestDiscount(sales);

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
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-16">

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

            <div className="flex items-center justify-center gap-2 mb-10">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed font-medium">
                Discover premium products with unbeatable deals, secure
                checkout, and fast delivery.
              </p>
            </div>

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

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: <Shield className="w-7 h-7 text-purple-600 dark:text-purple-400" />,
                  bg: "from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50",
                  border: "hover:border-purple-300 dark:hover:border-purple-500",
                  shadow: "hover:shadow-purple-500/20",
                  title: "Secure",
                  subtitle: "100% Protected",
                },
                {
                  icon: <Truck className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />,
                  bg: "from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50",
                  border: "hover:border-yellow-300 dark:hover:border-yellow-500",
                  shadow: "hover:shadow-yellow-500/20",
                  title: "Fast Delivery",
                  subtitle: "2-5 Business Days",
                },
                {
                  icon: <Award className="w-7 h-7 text-green-600 dark:text-green-400" />,
                  bg: "from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50",
                  border: "hover:border-green-300 dark:hover:border-green-500",
                  shadow: "hover:shadow-green-500/20",
                  title: "Quality",
                  subtitle: "Premium Products",
                },
                {
                  icon: <TrendingUp className="w-7 h-7 text-red-600 dark:text-red-400" />,
                  bg: "from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50",
                  border: "hover:border-red-300 dark:hover:border-red-500",
                  shadow: "hover:shadow-red-500/20",
                  title: "Best Deals",
                  subtitle: "Up to 40% Off",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className={`group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700 ${card.border} hover:shadow-2xl ${card.shadow} transition-all duration-300 hover:scale-105 cursor-default`}
                >
                  <div
                    className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br ${card.bg} group-hover:scale-110 transition-transform duration-300`}
                  >
                    {card.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
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
            {[
              {
                icon: <CheckCircle className="w-8 h-8 text-white" />,
                gradient: "from-purple-500 to-purple-600",
                accent: "from-purple-200 to-transparent dark:from-purple-900/30",
                border: "hover:border-purple-300 dark:hover:border-purple-500",
                title: "Verified Products",
                body: "Every product is carefully verified and authenticated before listing. Shop with complete confidence.",
              },
              {
                icon: <Clock className="w-8 h-8 text-white" />,
                gradient: "from-yellow-500 to-orange-500",
                accent: "from-yellow-200 to-transparent dark:from-yellow-900/30",
                border: "hover:border-yellow-300 dark:hover:border-yellow-500",
                title: "24/7 Support",
                body: "Our dedicated support team is always ready to help you with any questions or concerns.",
              },
              {
                icon: <Package className="w-8 h-8 text-white" />,
                gradient: "from-green-500 to-green-600",
                accent: "from-green-200 to-transparent dark:from-green-900/30",
                border: "hover:border-green-300 dark:hover:border-green-500",
                title: "Easy Returns",
                body: "Not satisfied? Return any product within 30 days with our hassle-free return policy.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`group relative p-8 bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent ${card.border}`}
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.accent} rounded-bl-full opacity-50`}
                />
                <div className="relative">
                  <div
                    className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {card.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full bg-gradient-to-br from-purple-600 to-purple-800 dark:from-purple-900 dark:to-purple-950 py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Users className="w-8 h-8 text-white" />, value: "50K+", label: "Happy Customers" },
              { icon: <Package className="w-8 h-8 text-white" />, value: "100K+", label: "Products Sold" },
              { icon: <Star className="w-8 h-8 text-white" />, value: "4.7/5", label: "Average Rating" },
              { icon: <Headphones className="w-8 h-8 text-white" />, value: "24/7", label: "Customer Support" },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-purple-200 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div
        id="products"
        className="w-full max-w-[1650px] mx-auto bg-white dark:bg-gray-900 rounded-t-3xl transition-colors duration-300 -mt-8 relative z-10 shadow-2xl"
      >
        <ProductsView products={products} categories={categories} discountPercent={discountPercent} />
      </div>

      {/* Newsletter Section */}
      <div className="w-full bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-950 dark:to-purple-950/30 py-16 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Get Exclusive Deals &amp; Updates
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