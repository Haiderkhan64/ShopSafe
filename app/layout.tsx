import "./globals.css"; // Import Tailwind CSS
import type { Metadata } from "next";
import { SessionProvider } from "@/lib/SessionContext";
import { ClerkProvider, ClerkLoaded } from "@clerk/nextjs";
import { shadesOfPurple, dark } from "@clerk/themes";
import { SanityLive } from "@/sanity/lib/live";
import { CartSyncWrapper } from "@/components/CartSyncWrapper";
import { ThemeProvider } from "@/components/theme-provider";

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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "var(--foreground)", // buttons, highlights
          colorBackground: "var(--background)", // background of the root container
          colorText: "var(--foreground)", // text color
          colorInputBackground: "var(--input)", // input fields
          colorTextSecondary: "var(--foreground)", // secondary text
          colorTextOnPrimaryBackground: "#fff", // optional contrast
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider>
            <main>
              <ClerkLoaded>
                <SessionProvider>
                  <CartSyncWrapper>{children}</CartSyncWrapper>
                </SessionProvider>
              </ClerkLoaded>
            </main>
            <SanityLive />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
