import { formatCurrency } from "@/lib/formatCurrency";
import { getMyOrders } from "@/lib/orders/getMyOrders";
import { cn } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactElement } from "react";
import Link from 'next/link';

const Orders = async ({}): Promise<ReactElement> => {
  const { userId } = await auth();

  if (!userId) return redirect("/");
  const orders = await getMyOrders(userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-purple-950/30 dark:to-indigo-950/20 transition-colors duration-300">
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

      <div className="relative container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  My Orders
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track and manage your purchases
                </p>
              </div>
            </div>
            <div className="h-1 w-24 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600" />
          </div>

          {/* Orders List or Empty State */}
          {orders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-12 text-center border border-gray-100 dark:border-gray-800 transition-colors duration-300">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50">
                  <svg
                    className="w-12 h-12 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  No Orders Yet
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven&apos;t placed any orders yet. Start shopping to see your
                  orders here!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <div
                  className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl dark:hover:shadow-purple-900/20 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800"
                  key={`${order.orderNumber}-${index}`}
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 via-purple-50/50 to-gray-50 dark:from-gray-800 dark:via-purple-900/20 dark:to-gray-800 transition-colors duration-300">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      {/* Order Number */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-5 h-5 text-purple-600 dark:text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                            />
                          </svg>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Order Number
                          </span>
                        </div>
                        <p className="font-mono text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500 break-all">
                          {order.orderNumber}
                        </p>
                      </div>

                      {/* Order Date */}
                      <div className="md:text-right">
                        <div className="flex items-center gap-2 mb-2 md:justify-end">
                          <svg
                            className="w-5 h-5 text-purple-600 dark:text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Order Date
                          </span>
                        </div>
                        <p className="font-semibold text-base text-gray-900 dark:text-gray-100">
                          {order.orderDate
                            ? new Date(order.orderDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status and Total */}
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      {/* Status Badge */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Status:
                        </span>
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all duration-300",
                            "text-white"
                          )}
                          style={{
                            background:
                              order.status === "paid"
                                ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                                : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                          }}
                        >
                          {order.status === "paid" ? (
                            <>
                              <svg
                                className="w-4 h-4"
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
                              Paid
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
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
                              Pending
                            </>
                          )}
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="sm:text-right">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
                          Total Amount
                        </p>
                        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500">
                          {order.totalPrice
                            ? formatCurrency(order.totalPrice)
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Discount Section */}
                    {order.amountDiscount ? (
                      <div className="mt-6 p-4 rounded-xl border-2 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-300 dark:border-yellow-700 transition-colors duration-300">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-yellow-200 dark:bg-yellow-800/50">
                            <svg
                              className="w-5 h-5 text-yellow-700 dark:text-yellow-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold mb-1 text-base text-yellow-900 dark:text-yellow-300">
                              Discount Applied:{" "}
                              {formatCurrency(order.amountDiscount)}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              Original Price:{" "}
                              <span className="font-semibold line-through">
                                {order.totalPrice
                                  ? formatCurrency(
                                      order.totalPrice + order.amountDiscount,
                                      order.currency
                                    )
                                  : "N/A"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Stats (if orders exist) */}
          {orders.length > 0 && (
            <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 transition-colors duration-300">
                  <p className="text-3xl font-bold mb-1 text-purple-700 dark:text-purple-300">
                    {orders.length}
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Total Orders
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 transition-colors duration-300">
                  <p className="text-3xl font-bold mb-1 text-green-700 dark:text-green-300">
                    {orders.filter((o) => o.status === "paid").length}
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Completed
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 transition-colors duration-300">
                  <p className="text-3xl font-bold mb-1 text-yellow-700 dark:text-yellow-300">
                    {orders.filter((o) => o.status !== "paid").length}
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Pending
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
