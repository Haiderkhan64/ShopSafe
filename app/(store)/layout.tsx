import type { Metadata } from "next";
import { shadesOfPurple } from "@clerk/themes";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import TopBar from "@/components/shared/Topbar";
import ScrollHeader from "@/components/ScrollAwareHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopSafe",
  description: "E-commerce Application",
};

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrollHeader />
        <div className="pt-[50px]">{children}</div>
      </div>
    </ClerkProvider>
  );
}
