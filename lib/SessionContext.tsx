"use client";

// // // Define the DeviceInfo interface before imports
export interface DeviceInfo {
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type: string;
    vendor: string | null;
    model: string | null;
  };
}

import { useClerk } from "@clerk/nextjs";
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
  const deviceInfo = useDeviceInfo();

  // const trackSession = useCallback(async () => {
  //   if (!clerk.user || !deviceInfo) {
  //     console.log("trackSession skipped: ", {
  //       user: !!clerk.user,
  //       deviceInfo: !!deviceInfo,
  //     });
  //     return;
  //   }

  const trackSession = useCallback(async () => {
  if (!clerk.user || !clerk.session || !deviceInfo) {
    console.log("trackSession skipped: ", {
      user: !!clerk.user,
      session: !!clerk.session,
      deviceInfo: !!deviceInfo,
    });
    return;
  }

    // Create a safe copy with defaults instead of validation that can fail
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
      console.log("trackSession called with: ", {
        userId: clerk.user.id,
        deviceInfo: safeDeviceInfo,
      });

      // Get token from the session instead
      // const token = await clerk.session?.getToken();
      // if (!token) {
      //   throw new Error("No authentication token available");
      // }

      const token = await clerk.session.getToken();
        if (!token) {
          console.warn("No session token available yet, skipping session tracking");
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
      // Use a more specific error handling approach
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error("trackSession failed:", {
        message: errorMessage,
        stack: errorStack,
        userId: clerk.user?.id,
        deviceInfo: safeDeviceInfo,
      });
    }
  }, [clerk.user, clerk.session, deviceInfo]);

  // useEffect(() => {
  //   if (clerk.user && deviceInfo) {
  //     trackSession();
  //   }
  // }, [clerk.user, deviceInfo, trackSession]);

  useEffect(() => {
  if (clerk.loaded && clerk.user && clerk.session && deviceInfo) {
    trackSession();
  }
}, [clerk.loaded, clerk.user, clerk.session, deviceInfo, trackSession]);


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
