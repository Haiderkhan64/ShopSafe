// hooks/useUserData.ts

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

export function useUserData(userId?: string) {
  const { getToken } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        setError(null);

        // If userId is provided, fetch that specific user
        const endpoint = userId ? `/api/user/${userId}` : `/api/user`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data.user);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userId, getToken]);

  return { userData, loading, error, refetch: () => {} };
}

// Usage example:
// const { userData, loading, error } = useUserData();
// Or to fetch another user (admin only):
// const { userData, loading, error } = useUserData('user_123');
