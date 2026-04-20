"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ClerkProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before mount: render with no theme override (defaults to Clerk's light
  // theme). After mount: apply the correct theme based on the user's setting.
  // This avoids the SSR→CSR flash while keeping the tree structure stable
  // so React can hydrate without a mismatch.
  const appearance = mounted
    ? {
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
        variables: {
          colorPrimary: "#7d65b0",
        },
      }
    : {
        variables: {
          colorPrimary: "#7d65b0",
        },
      };

  return (
    <ClerkProvider appearance={appearance}>
      {children}
    </ClerkProvider>
  );
}