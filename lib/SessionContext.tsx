"use client";

export interface DeviceInfo {
  browser: { name: string; version: string };
  os: { name: string; version: string };
  device: { type: string; vendor: string | null; model: string | null };
}

import { useClerk } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useCallback } from "react";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";

const SessionContext = createContext<{
  trackSession: () => Promise<void>;
} | null>(null);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const clerk = useClerk();
  // `clerk.loaded` is not part of the public Clerk API — it is always
  // `undefined`, which is falsy, so the effect that calls trackSession never
  // fired.  `isLoaded` from useAuth() is the documented way to know when the
  // Clerk client has finished initialising.
  const { isLoaded } = useAuth();
  const deviceInfo = useDeviceInfo();

  const trackSession = useCallback(async () => {
    if (!clerk.user || !clerk.session || !deviceInfo) {
      console.log("trackSession skipped:", {
        user: !!clerk.user,
        session: !!clerk.session,
        deviceInfo: !!deviceInfo,
      });
      return;
    }

    const safeDeviceInfo: DeviceInfo = {
      browser: {
        name: deviceInfo.browser?.name ?? "Unknown",
        version: deviceInfo.browser?.version ?? "Unknown",
      },
      os: {
        name: deviceInfo.os?.name ?? "Unknown",
        version: deviceInfo.os?.version ?? "Unknown",
      },
      device: {
        type: deviceInfo.device?.type ?? "desktop",
        vendor: deviceInfo.device?.vendor ?? null,
        model: deviceInfo.device?.model ?? null,
      },
    };

    try {
      const token = await clerk.session.getToken();
      if (!token) {
        console.warn(
          "No session token available yet, skipping session tracking"
        );
        return;
      }

      const response = await fetch("/api/track-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deviceInfo: safeDeviceInfo }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (
          response.status === 404 &&
          errorText.includes("No active session found")
        ) {
          console.warn(
            "No active session found for userId:",
            clerk.user.id,
            ". Check if middleware.ts is creating sessions."
          );
          return;
        }
        throw new Error(
          `Failed to update session: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Session updated:", data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error("trackSession failed:", {
        message: errorMessage,
        stack: errorStack,
        userId: clerk.user?.id,
        deviceInfo: safeDeviceInfo,
      });
    }
  }, [clerk.user, clerk.session, deviceInfo]);

  useEffect(() => {
    // depend on `isLoaded` (from useAuth) instead of `clerk.loaded`
    // (undefined, non-reactive).  Without this fix, no sessions were ever
    // tracked because the guard was `clerk.loaded && ...` which is
    // `undefined && ...` = false on every render.
    if (isLoaded && clerk.user && clerk.session && deviceInfo) {
      trackSession();
    }
  }, [isLoaded, clerk.user, clerk.session, deviceInfo, trackSession]);

  return (
    <SessionContext.Provider value={{ trackSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error("useSession must be used within a SessionProvider");
  return context;
};