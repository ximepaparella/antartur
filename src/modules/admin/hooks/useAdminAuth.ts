"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired } from "@/lib/auth";

const AUTH_STORAGE_KEY = "admin_auth_session";
const TOKEN_STORAGE_KEY = "admin_auth_tokens";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: AdminUser;
  };
  error?: string;
}

/**
 * Hook para manejar autenticación del admin con JWT
 */
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  /**
   * Obtiene los tokens del storage
   */
  const getTokens = useCallback((): AuthTokens | null => {
    if (typeof window === "undefined") return null;
    try {
      const tokens = localStorage.getItem(TOKEN_STORAGE_KEY);
      return tokens ? JSON.parse(tokens) : null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Guarda los tokens en storage
   */
  const saveTokens = useCallback((tokens: AuthTokens) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  }, []);

  /**
   * Limpia los tokens del storage
   */
  const clearTokens = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  /**
   * Renueva el access token usando el refresh token
   */
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const tokens = getTokens();
    if (!tokens?.refreshToken) return false;

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!response.ok) {
        clearTokens();
        return false;
      }

      const result: LoginResponse = await response.json();
      if (result.success && result.data) {
        saveTokens({
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        });
        return true;
      }

      return false;
    } catch {
      clearTokens();
      return false;
    }
  }, [getTokens, saveTokens, clearTokens]);

  // Refs para evitar loops infinitos
  const isCheckingRef = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Verifica si el usuario está autenticado
   */
  const checkAuth = useCallback(async () => {
    // Prevenir múltiples verificaciones simultáneas
    if (isCheckingRef.current) {
      return;
    }

    isCheckingRef.current = true;
    const tokens = getTokens();
    
    if (!tokens?.accessToken) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      isCheckingRef.current = false;
      return;
    }

    // Verificar expiración del token antes de hacer la llamada
    if (isTokenExpired(tokens.accessToken)) {
      // Token expirado, intentar renovar
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        // No se pudo renovar, limpiar y desautenticar
        clearTokens();
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        isCheckingRef.current = false;
        // Redirigir a login
        router.push("/admin/login");
        return;
      }
      // Token renovado, continuar con la verificación
    }

    try {
      const currentTokens = getTokens();
      if (!currentTokens?.accessToken) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        isCheckingRef.current = false;
        return;
      }

      // Intentar obtener el usuario actual
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${currentTokens.accessToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.user) {
          setUser(result.data.user);
          setIsAuthenticated(true);
          // Guardar también en sessionStorage para compatibilidad
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.data.user));
        } else {
          throw new Error("Invalid response");
        }
      } else if (response.status === 401) {
        // Token expirado o inválido, intentar renovar
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Reintentar después de renovar
          const newTokens = getTokens();
          if (newTokens?.accessToken) {
            const retryResponse = await fetch("/api/auth/me", {
              headers: {
                Authorization: `Bearer ${newTokens.accessToken}`,
              },
            });
            if (retryResponse.ok) {
              const retryResult = await retryResponse.json();
              if (retryResult.success && retryResult.data?.user) {
                setUser(retryResult.data.user);
                setIsAuthenticated(true);
                sessionStorage.setItem(
                  AUTH_STORAGE_KEY,
                  JSON.stringify(retryResult.data.user)
                );
              }
            } else if (retryResponse.status === 401) {
              // Aún expirado después de renovar, desloguear
              clearTokens();
              setIsAuthenticated(false);
              setUser(null);
              router.push("/admin/login");
            }
          }
        } else {
          // No se pudo renovar, limpiar y desautenticar
          clearTokens();
          setIsAuthenticated(false);
          setUser(null);
          router.push("/admin/login");
        }
      } else {
        throw new Error("Auth check failed");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      router.push("/admin/login");
    } finally {
      setIsLoading(false);
      isCheckingRef.current = false;
    }
  }, [getTokens, refreshAccessToken, clearTokens, router]);

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth();
  }, []); // Solo al montar, sin dependencias para evitar loops

  // Validación periódica del token (cada 5 minutos)
  // Usar ref para checkAuth para evitar recrear el intervalo
  const checkAuthRef = useRef(checkAuth);
  useEffect(() => {
    checkAuthRef.current = checkAuth;
  }, [checkAuth]);

  useEffect(() => {
    // Limpiar intervalo anterior si existe
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    // Configurar validación periódica solo si está autenticado
    if (isAuthenticated) {
      checkIntervalRef.current = setInterval(() => {
        const tokens = getTokens();
        if (!tokens?.accessToken || isTokenExpired(tokens.accessToken)) {
          // Token expirado, verificar y renovar si es necesario
          checkAuthRef.current();
        }
      }, 5 * 60 * 1000); // Cada 5 minutos
    }

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, getTokens]); // Removido checkAuth de dependencias

  /**
   * Login con email y password
   */
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const result: LoginResponse = await response.json();

        if (result.success && result.data) {
          // Guardar tokens
          saveTokens({
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
          });

          // Guardar usuario
          setUser(result.data.user);
          setIsAuthenticated(true);
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.data.user));

          return { success: true };
        } else {
          return {
            success: false,
            error: result.error || "Credenciales inválidas",
          };
        }
      } catch (error) {
        console.error("Login error:", error);
        return {
          success: false,
          error: "Error al conectar con el servidor",
        };
      }
    },
    [saveTokens]
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    const tokens = getTokens();
    
    // Invalidar refresh token en el servidor
    if (tokens?.refreshToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    // Limpiar storage
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    router.push("/admin/login");
  }, [getTokens, clearTokens, router]);

  /**
   * Obtiene el access token actual
   */
  const getAccessToken = useCallback((): string | null => {
    const tokens = getTokens();
    return tokens?.accessToken || null;
  }, [getTokens]);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    getCurrentUser: () => user,
    getAccessToken,
    refreshAccessToken,
  };
}
