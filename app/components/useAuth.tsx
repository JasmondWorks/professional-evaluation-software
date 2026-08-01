"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import jwt from 'jsonwebtoken';

type Role = "super-admin" | "admin" | "lecturer" | "industrial-engineer" | "hod" | "auditor" | "employee-w" | null;

type AuthContextType = {
  role: Role;
  setRole: (role: Role) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { setAccessToken, getAccessToken } from "../utils/auth";
import { jwtDecode } from "jwt-decode";
import { apiFetch } from '@/app/utils/apiFetch';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    async function refreshToken() {
      try {
        const res = await apiFetch("/api/refresh", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.token);
          
          const decoded: any = jwt.decode(data.token);
          if (decoded && decoded.role) {
            setRole(decoded.role);
          }
          return true;
        } else {
          setRole(null);
          return false;
        }
      } catch (error) {
        console.error("Failed to refresh token in AuthProvider:", error);
        setRole(null);
        return false;
      }
    }

    async function initAuth() {
      if (typeof window !== 'undefined') {
        await refreshToken();
        setLoading(false);

        // Proactively refresh every 10 minutes (token expires in 15)
        refreshInterval = setInterval(() => {
          refreshToken();
        }, 10 * 60 * 1000);
      }
    }

    // Refresh token when user returns to the tab (handles computer wake from sleep)
    const handleFocus = () => {
      const token = getAccessToken();
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          // If token expires in less than 2 minutes, refresh it immediately
          if (decoded.exp * 1000 - Date.now() < 2 * 60 * 1000) {
            refreshToken();
          }
        } catch (e) {
          refreshToken();
        }
      }
    };

    if (typeof window !== 'undefined') {
      initAuth();
      window.addEventListener("focus", handleFocus);
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, []);

  if (loading) {
    return null; // Prevent rendering protected routes before auth state is known
  }

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
