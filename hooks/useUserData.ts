import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface User {
  id: string;
  email: string;
  name: string | null;
  address: string | null;
  role: "ADMIN" | "ANALYST" | "CUSTOMER";
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  orders?: Array<{
    id: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
}

interface UseUserDataResult {
  userData: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUserData(userId?: string): UseUserDataResult {
  const { getToken } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchUserData() {
      try {
        setLoading(true);
        setError(null);

        // /api/user/[id] returns { user: ... } (admin endpoint)
        // /api/user     returns { data: ... } (self endpoint)
        const endpoint = userId ? `/api/user/${userId}` : `/api/user`;

        const token = await getToken();
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch user data");
        }

        const body = await response.json();

        if (cancelled) return;

        // /api/user/[id] → { user: {...} }
        // /api/user       → { data: {...} }
        const resolved: User | null = userId
          ? (body?.user ?? null)
          : (body?.data ?? null);

        setUserData(resolved);
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUserData();

    return () => {
      cancelled = true;
    };
  }, [userId, getToken, tick]);

  return {
    userData,
    loading,
    error,
    // Expose a real refetch so consumers can trigger a re-fetch.
    refetch: () => setTick((t) => t + 1),
  };
}