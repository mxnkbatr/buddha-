"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { signOut } = useClerk();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [clerkUser, clerkLoaded]); // Refetch if Clerk state changes

  const login = async (formData: any) => {
    // This is for CUSTOM DB login
    try {
        const res = await fetch("/api/auth/client-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // Refresh state
        await fetchUser();
        return data; // Return data for redirect logic in component
    } catch (error) {
        throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
        // 1. Logout Custom
        await fetch("/api/auth/logout", { method: "POST" });
        // 2. Logout Clerk
        await signOut();
        
        setUser(null);
        router.push("/sign-in");
    } catch (error) {
        console.error("Logout error", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
