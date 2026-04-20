"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";

interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const checkOnboarding = async () => {
      try {
        const res = await fetch("/api/user", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.status === 404) {
          // User exists in Clerk but not in our DB — send to onboarding
          router.push("/onboarding");
          return;
        }

        if (!res.ok) {
          // 401, 403, 500 etc — don't redirect, let the page handle it
          console.error("AuthWrapper: unexpected status", res.status);
          return;
        }

        const body = await res.json();
        // FIX: response shape is { data: { id, hasCompletedOnboarding, ... } }
        // not { user: { ... } }
        const user = body?.data;

        if (user && !user.hasCompletedOnboarding) {
          router.push("/onboarding");
        }
      } catch (error) {
        console.error("AuthWrapper: error checking onboarding status:", error);
      }
    };

    checkOnboarding();
  }, [userId, isLoaded, router]);

  return <>{children}</>;
}