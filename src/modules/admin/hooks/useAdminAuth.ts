"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "admin@antartur.com";
const ADMIN_PASSWORD = "admin123";
const AUTH_STORAGE_KEY = "admin_auth_session";

interface AdminUser {
  email: string;
  name: string;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const session = sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (session) {
          const userData = JSON.parse(session) as AdminUser;
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Invalid session, clear it
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(
    (email: string, password: string): boolean => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const userData: AdminUser = {
          email: ADMIN_EMAIL,
          name: "Administrator",
        };
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    },
    []
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
    router.push("/admin/login");
  }, [router]);

  const getCurrentUser = useCallback((): AdminUser | null => {
    return user;
  }, [user]);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    getCurrentUser,
  };
}

