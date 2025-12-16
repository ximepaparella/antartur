/**
 * Helpers para autenticación en el admin
 * Funciones reutilizables para obtener tokens y crear headers
 */

const TOKEN_STORAGE_KEY = "admin_auth_tokens";

/**
 * Obtiene el access token JWT del localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null; // Server-side, no access to localStorage
  }

  try {
    const tokensStr = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (tokensStr) {
      const tokens = JSON.parse(tokensStr);
      return tokens?.accessToken || null;
    }
  } catch (error) {
    console.error("Error getting auth token:", error);
  }

  return null;
}

/**
 * Crea headers con autenticación para fetch requests
 */
export function createAuthHeaders(additionalHeaders: HeadersInit = {}): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...additionalHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
