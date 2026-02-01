"use client";
import Link from "next/link";
import Image from "next/image";
import {
  ClerkLoaded,
  SignedIn,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Form from "next/form";
import {
  Search,
  ShoppingCart,
  Menu,
  Package,
  X,
  User,
  Moon,
  Sun,
} from "lucide-react";
import useBasketStore from "@/store";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    Clerk?: {
      signOut: (callback?: () => void) => void;
    };
  }
}

const TopBar = () => {
  const { user } = useUser();
  const [isCreatingPasskey, setIsCreatingPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  const itemCount = useBasketStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  const createClerkPasskey = async () => {
    if (!user) return;

    setIsCreatingPasskey(true);
    setPasskeyError(null);

    try {
      await user.createPasskey();
      console.log("Passkey created successfully!");
      window.location.reload();
    } catch (err: any) {
      console.error("Error:", JSON.stringify(err, null, 2));

      const errorCode = err?.errors?.[0]?.code;
      const errorMessage =
        err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message;

      if (errorCode === "session_reverification_required") {
        setPasskeyError(
          "For security, you need to verify your identity. Please sign out and sign back in, then try creating a passkey again."
        );
      } else {
        setPasskeyError(
          errorMessage || "Failed to create passkey. Please try again."
        );
      }
    } finally {
      setIsCreatingPasskey(false);
    }
  };

  const handleSignOutClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/end-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });
      if (!response.ok) {
        console.error("Failed to end session:", response.statusText);
      }
    } catch (error) {
      console.error("Error ending session:", error);
    }

    window.Clerk?.signOut(() => {
      window.location.href = "/";
    });
  };

  return (
    <nav
      className="shadow-lg relative z-50"
      style={{
        background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
      }}
    >
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center bg-white shadow-md group-hover:shadow-lg transition-shadow">
                <Image
                  src="/next.svg"
                  alt="logo"
                  width={80}
                  height={80}
                  className="w-auto h-full"
                />
              </div>
              <div className="hidden sm:block">
                <p
                  className="text-xl md:text-2xl font-bold"
                  style={{ color: "#FFD700" }}
                >
                  ShopSafe
                </p>
                <p className="text-xs text-purple-200">Secure Shopping</p>
              </div>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6">
            <Form action="/search" className="flex w-full">
              <div className="relative flex flex-1 items-center">
                <input
                  name="query"
                  placeholder="Search for products..."
                  className="w-full py-3 px-4 rounded-l-xl border-2 border-transparent bg-white text-gray-800 focus:outline-none focus:border-yellow-400 transition-all shadow-md"
                />
                <button
                  type="submit"
                  className="text-white font-semibold py-3 px-6 rounded-r-xl transition-all shadow-md hover:shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  }}
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </Form>
          </div>

          {/* Desktop Navigation Icons */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <ThemeToggle />
            {/* Orders */}
            <SignedIn>
              <Link
                href="/orders"
                className="flex flex-col items-center gap-1 hover:scale-110 transition-transform group"
              >
                <Package className="h-6 w-6 text-white group-hover:text-yellow-300 transition-colors" />
                <span className="text-xs text-white font-medium">Orders</span>
              </Link>
            </SignedIn>

            {/* Cart */}
            <Link
              href="/basket"
              className="flex flex-col items-center gap-1 hover:scale-110 transition-transform group"
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-white group-hover:text-yellow-300 transition-colors" />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shadow-md"
                    style={{ background: "#FFD700", color: "#574095" }}
                  >
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs text-white font-medium">Cart</span>
            </Link>

            {/* User Section */}
            <div className="flex items-center gap-3 ml-2">
              {user ? (
                <div className="flex items-center gap-3">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 ring-2 ring-yellow-300",
                      },
                    }}
                  />
                  <div className="hidden lg:block">
                    <p className="text-xs text-purple-200">Welcome back</p>
                    <p className="text-sm font-bold text-white">
                      {user?.fullName}
                    </p>
                  </div>

                  <ClerkLoaded>
                    {user?.passkeys.length === 0 && (
                      <div className="relative">
                        <button
                          className="px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: "#FFD700",
                            color: "#574095",
                          }}
                          onClick={createClerkPasskey}
                          disabled={isCreatingPasskey}
                        >
                          {isCreatingPasskey ? "Creating..." : "Create Passkey"}
                        </button>
                        {passkeyError && (
                          <div className="absolute top-full mt-2 right-0 p-3 bg-red-500 text-white text-xs rounded-lg shadow-xl max-w-xs z-50">
                            {passkeyError}
                          </div>
                        )}
                      </div>
                    )}
                  </ClerkLoaded>

                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                    onClick={handleSignOutClick}
                  >
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              ) : (
                <SignInButton>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                    style={{
                      background: "#FFD700",
                      color: "#574095",
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </button>
                </SignInButton>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <Form action="/search" className="flex w-full">
            <div className="relative flex flex-1 items-center">
              <input
                name="query"
                placeholder="Search products..."
                className="w-full py-2.5 px-4 rounded-l-lg border-2 border-transparent bg-white text-gray-800 focus:outline-none focus:border-yellow-400 transition-all text-sm"
              />
              <button
                type="submit"
                className="text-white font-semibold py-2.5 px-4 rounded-r-lg transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                }}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </Form>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 bg-white shadow-2xl z-40 border-t-4"
          style={{ borderColor: "#FFD700" }}
        >
          <div className="px-4 py-6 space-y-4">
            {/* Mobile User Info */}
            {user ? (
              <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
                <UserButton />
                <div>
                  <p className="text-xs text-gray-500">Welcome back</p>
                  <p className="text-sm font-bold text-gray-900">
                    {user?.fullName}
                  </p>
                </div>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm shadow-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
                    color: "white",
                  }}
                >
                  <User className="h-5 w-5" />
                  <span>Sign In / Register</span>
                </button>
              </SignInButton>
            )}

            {/* Mobile Navigation Links */}
            <div className="space-y-3">
              <SignedIn>
                <Link
                  href="/orders"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className="h-5 w-5" style={{ color: "#6B46C1" }} />
                  <span className="font-semibold text-gray-900">My Orders</span>
                </Link>
              </SignedIn>

              <Link
                href="/basket"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart
                    className="h-5 w-5"
                    style={{ color: "#6B46C1" }}
                  />
                  <span className="font-semibold text-gray-900">
                    Shopping Cart
                  </span>
                </div>
                {itemCount > 0 && (
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ background: "#FFD700", color: "#574095" }}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>

              <div
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                onClick={() => {
                  setTheme(currentTheme === "dark" ? "light" : "dark");
                  setIsMobileMenuOpen(false);
                }}
              >
                {currentTheme === "dark" ? (
                  <>
                    <Sun className="h-5 w-5" style={{ color: "#6B46C1" }} />
                    <span className="font-semibold text-gray-900">
                      Light Mode
                    </span>
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5" style={{ color: "#6B46C1" }} />
                    <span className="font-semibold text-gray-900">
                      Dark Mode
                    </span>
                  </>
                )}
              </div>

              <div className="pt-4 border-t-2 border-gray-200"></div>

              <Link
                href="/deals"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="font-semibold text-gray-900">
                  Today's Deals
                </span>
              </Link>

              <Link
                href="/customer-service"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="font-semibold text-gray-900">
                  Customer Service
                </span>
              </Link>

              {user && (
                <>
                  <ClerkLoaded>
                    {user?.passkeys.length === 0 && (
                      <button
                        className="w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all shadow-md disabled:opacity-50"
                        style={{
                          background: "#FFD700",
                          color: "#574095",
                        }}
                        onClick={createClerkPasskey}
                        disabled={isCreatingPasskey}
                      >
                        {isCreatingPasskey
                          ? "Creating Passkey..."
                          : "Create Passkey"}
                      </button>
                    )}
                  </ClerkLoaded>

                  <button
                    className="w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all border-2"
                    style={{
                      borderColor: "#6B46C1",
                      color: "#6B46C1",
                    }}
                    onClick={handleSignOutClick}
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Secondary Navigation */}
      {/* <div
        className="hidden md:block px-4 py-3"
        style={{ backgroundColor: "#4A2F7A" }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-sm overflow-x-auto">
          <Link
            href="/deals"
            className="text-white hover:text-yellow-300 transition whitespace-nowrap font-medium"
          >
            Today's Deals
          </Link>
          <Link
            href="/customer-service"
            className="text-white hover:text-yellow-300 transition whitespace-nowrap font-medium"
          >
            Customer Service
          </Link>
          <Link
            href="/registry"
            className="text-white hover:text-yellow-300 transition whitespace-nowrap font-medium"
          >
            Registry
          </Link>
          <Link
            href="/gift-cards"
            className="text-white hover:text-yellow-300 transition whitespace-nowrap font-medium"
          >
            Gift Cards
          </Link>
          <Link
            href="/sell"
            className="text-white hover:text-yellow-300 transition whitespace-nowrap font-medium"
          >
            Sell
          </Link>
        </div>
      </div> */}
    </nav>
  );
};

export default TopBar;
