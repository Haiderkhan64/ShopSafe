import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "@/lib/SessionContext";
import { SanityLive } from "@/sanity/lib/live";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProviderWrapper } from "@/components/clerk-provider-wrapper";

export const metadata: Metadata = {
  title: "ShopSafe",
  description: "E-commerce Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ClerkProviderWrapper>
            <SessionProvider>
              {children}
            </SessionProvider>
            <SanityLive />
          </ClerkProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}