'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { ReactNode } from "react";


interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children } : AuthWrapperProps) {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run once auth is loaded and we have a user
    if (isLoaded && userId) {
      const checkUserOnboarding = async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
          const res = await fetch(
            `${baseUrl}/api/user?id=${userId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          
          if (res.ok) {
            const data = await res.json();
            // If user exists in Clerk but not in our DB, redirect to onboarding
            if (data?.user && !data.user.id) {
              router.push("/onboarding");
            }
          }
        } catch (error) {
          console.error("Error checking user onboarding status:", error);
        }
      };

      checkUserOnboarding();
    }
  }, [userId, isLoaded, router]);

  // Always render children regardless of auth status
  return <>{children}</>;
}