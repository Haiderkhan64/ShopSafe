import Image from "next/image";
import { Suspense } from "react";
import Loading from "./loading";
import { ClerkProvider } from "@clerk/nextjs";
import { Shield, Zap } from "lucide-react";

const AUTH_PARTICLES = [
  { left: "5%",  top: "10%", delay: "0.0s", duration: "3.5s" },
  { left: "15%", top: "75%", delay: "0.5s", duration: "4.0s" },
  { left: "25%", top: "40%", delay: "1.0s", duration: "4.5s" },
  { left: "35%", top: "90%", delay: "1.5s", duration: "5.0s" },
  { left: "45%", top: "20%", delay: "2.0s", duration: "3.8s" },
  { left: "55%", top: "60%", delay: "2.5s", duration: "4.2s" },
  { left: "65%", top: "5%",  delay: "0.3s", duration: "4.8s" },
  { left: "72%", top: "45%", delay: "0.8s", duration: "5.5s" },
  { left: "82%", top: "80%", delay: "1.3s", duration: "3.6s" },
  { left: "90%", top: "30%", delay: "1.8s", duration: "4.3s" },
  { left: "10%", top: "55%", delay: "0.2s", duration: "5.2s" },
  { left: "20%", top: "15%", delay: "0.7s", duration: "3.9s" },
  { left: "30%", top: "70%", delay: "1.2s", duration: "4.6s" },
  { left: "42%", top: "35%", delay: "1.7s", duration: "5.1s" },
  { left: "52%", top: "85%", delay: "2.2s", duration: "3.7s" },
  { left: "62%", top: "50%", delay: "0.4s", duration: "4.4s" },
  { left: "78%", top: "22%", delay: "0.9s", duration: "5.3s" },
  { left: "88%", top: "65%", delay: "1.4s", duration: "3.5s" },
  { left: "95%", top: "12%", delay: "1.9s", duration: "4.7s" },
  { left: "48%", top: "95%", delay: "2.4s", duration: "5.0s" },
] as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6B46C1",
          colorBackground: "hsl(var(--background))",
          colorInputBackground: "hsl(var(--input))",
          colorInputText: "hsl(var(--foreground))",
          colorText: "hsl(var(--foreground))",
          colorTextSecondary: "hsl(var(--foreground) / 0.6)",
          colorDanger: "#ef4444",
          colorSuccess: "#10b981",
          colorWarning: "#f59e0b",
          borderRadius: "var(--radius)",
          fontFamily: "inherit",
          colorTextOnPrimaryBackground: "#ffffff",
        },
        elements: {
          rootBox: {
            boxShadow: "0 25px 50px -12px rgba(107, 70, 193, 0.25)",
            border: "none",
          },
          card: {
            background: "hsl(var(--background) / 0.95)",
            backdropFilter: "blur(20px)",
            border: "2px solid hsl(var(--border))",
            borderRadius: "1.5rem",
            boxShadow: "0 25px 50px -12px rgba(107, 70, 193, 0.25)",
            padding: "2.5rem",
          },
          headerTitle: {
            background:
              "linear-gradient(135deg, #574095 0%, #6B46C1 50%, #8B5CF6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: "2.25rem",
            fontWeight: "800",
            letterSpacing: "-0.025em",
          },
          headerSubtitle: {
            color: "hsl(var(--foreground) / 0.6)",
            fontSize: "1rem",
            fontWeight: "500",
          },
          formButtonPrimary: {
            background:
              "linear-gradient(135deg, #574095 0%, #6B46C1 50%, #8B5CF6 100%)",
            backgroundSize: "200% 200%",
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "1.125rem",
            padding: "1rem 2rem",
            borderRadius: "1rem",
            boxShadow:
              "0 10px 25px -5px rgba(107, 70, 193, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "2px solid rgba(139, 92, 246, 0.3)",
            position: "relative",
            overflow: "hidden",
          },
          socialButtonsBlockButton: {
            background: "hsl(var(--background) / 0.8)",
            backdropFilter: "blur(10px)",
            border: "2px solid hsl(var(--border))",
            borderRadius: "1rem",
            color: "#574095",
            fontWeight: "700",
            padding: "0.875rem 1.5rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          },
          socialButtonsBlockButtonText: {
            color: "#574095",
            fontWeight: "700",
            fontSize: "1rem",
          },
          dividerLine: {
            background:
              "linear-gradient(90deg, transparent, hsl(var(--border)), transparent)",
            height: "2px",
          },
          dividerText: {
            color: "hsl(var(--foreground) / 0.5)",
            fontSize: "0.875rem",
            fontWeight: "600",
            background: "hsl(var(--background) / 0.9)",
            padding: "0 1rem",
          },
          formFieldInput: {
            background: "hsl(var(--input))",
            backdropFilter: "blur(10px)",
            borderRadius: "1rem",
            border: "2px solid hsl(var(--border))",
            padding: "1rem 1.25rem",
            fontSize: "1.125rem",
            fontWeight: "500",
            color: "hsl(var(--foreground))",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)",
          },
          formFieldLabel: {
            color: "hsl(var(--foreground))",
            fontWeight: "700",
            fontSize: "0.9375rem",
            marginBottom: "0.625rem",
            letterSpacing: "0.01em",
          },
          formFieldAction: {
            color: "#6B46C1",
            fontWeight: "700",
            textDecoration: "none",
            fontSize: "0.9375rem",
            transition: "all 0.2s ease",
          },
          footerActionLink: {
            color: "#6B46C1",
            fontWeight: "700",
            textDecoration: "none",
            fontSize: "1rem",
            transition: "all 0.2s ease",
          },
          footer: {
            background: "transparent",
            marginTop: "1.5rem",
          },
          footerActionText: {
            color: "hsl(var(--foreground) / 0.6)",
            fontWeight: "600",
          },
          badge: {
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            color: "#78350f",
            fontWeight: "800",
            padding: "0.375rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.8125rem",
            boxShadow: "0 4px 6px -1px rgba(255, 215, 0, 0.3)",
            border: "1px solid rgba(255, 215, 0, 0.5)",
          },
          otpCodeFieldInput: {
            borderColor: "hsl(var(--border))",
            borderRadius: "0.75rem",
            fontWeight: "700",
            fontSize: "1.5rem",
            background: "hsl(var(--input))",
            color: "hsl(var(--foreground))",
          },
        },
      }}
    >
      <div className="min-h-screen relative overflow-hidden flex flex-col bg-background text-foreground">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-background to-orange-50 dark:from-purple-950/20 dark:via-background dark:to-orange-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.2)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,215,0,0.08)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(255,215,0,0.15)_0%,transparent_50%)]" />
        </div>

        {/* Animated Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 dark:opacity-30 blur-3xl animate-pulse"
            style={{
              background: "linear-gradient(135deg, #574095 0%, #6B46C1 100%)",
              animationDuration: "6s",
            }}
          />
          <div
            className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-15 dark:opacity-25 blur-3xl animate-pulse"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
              animationDuration: "8s",
              animationDelay: "2s",
            }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-15 dark:opacity-25 blur-3xl animate-pulse"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              animationDuration: "10s",
              animationDelay: "1s",
            }}
          />
          <div
            className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full opacity-10 dark:opacity-20 blur-2xl animate-pulse"
            style={{
              background: "#FFD700",
              animationDuration: "7s",
              animationDelay: "3s",
            }}
          />
        </div>

        {/* Floating Particles — deterministic positions avoid SSR/client hydration mismatch */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {AUTH_PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 dark:bg-purple-400/50 rounded-full animate-pulse"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>

        {/* Compact Header with Logo */}
        <nav className="relative z-10 pt-4 pb-2">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative transition-all duration-500 hover:scale-105">
                  <Image
                    src="/next.svg"
                    alt="ShopSafe Logo"
                    width={140}
                    height={140}
                    className="drop-shadow-xl dark:brightness-110"
                  />
                </div>
              </div>
            </div>

            {/* Compact Trust Badge */}
            <div className="flex justify-center mt-3">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-full shadow-md border border-purple-200/50 dark:border-purple-500/30">
                <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold bg-gradient-to-r from-purple-700 to-purple-500 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">
                  Secure Authentication
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <Suspense fallback={<Loading />}>
          <main className="relative z-10 flex justify-center items-center px-4 flex-1">
            <div className="w-full max-w-md">
              <div
                className="absolute -top-8 -left-8 w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full blur-2xl opacity-20 dark:opacity-30 animate-pulse"
                style={{ animationDuration: "4s" }}
              />
              <div
                className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-20 dark:opacity-30 animate-pulse"
                style={{ animationDuration: "5s", animationDelay: "1s" }}
              />
              {children}
            </div>
          </main>
        </Suspense>

        {/* Compact Footer Trust Indicators */}
        <div className="relative z-10 pb-4">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-center items-center gap-6 text-center">
              <div className="flex items-center gap-2 group cursor-default">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-foreground">SSL Encrypted</p>
                </div>
              </div>

              <div className="flex items-center gap-2 group cursor-default">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900/50 dark:to-orange-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-foreground">Instant Access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClerkProvider>
  );
}