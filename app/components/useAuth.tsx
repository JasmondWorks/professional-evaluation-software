"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import jwt from 'jsonwebtoken';

type Role = "super-admin" | "admin" | "lecturer" | "industrial-engineer" | "hod" | "auditor" | "employee-w" | null;

type AuthContextType = {
  role: Role;
  setRole: (role: Role) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('access_token');
    
    if (token && token !== 'undefined') {
      try {
        //  Decode the token to get the role
        const decoded: any = jwt.decode(token);
        
        if (decoded && decoded.role) {
          setRole(decoded.role);
        }
      } catch (error) {
        console.error("Failed to decode token in AuthProvider:", error);
        setRole(null);
      }
    }
  }, []);

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
