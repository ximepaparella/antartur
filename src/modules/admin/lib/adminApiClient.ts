/**
 * Admin API Client
 * Reuses existing API clients and adds admin-specific endpoints
 */

import type { ApiResponse } from "@/lib/api/response";
import type {
  DashboardStats,
  OrderResponse,
  OrderFullResponse,
  BookingResponse,
  TourResponse,
  TourFullResponse,
  NotificationResponse,
  CreateTourDto,
  UpdateTourDto,
  UserSummary,
  CreateUserDto,
  ChangeUserPasswordDto,
} from "./types";

// toursClient tiene estructura diferente, usamos fetch directo

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const TOKEN_STORAGE_KEY = "admin_auth_tokens";
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Gets JWT access token from localStorage
 * Returns the access token from the stored auth tokens, or null if not authenticated
 */
function getAuthToken(): string | null {
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
 * Limpia tokens y redirige a login
 */
function handleUnauthorized() {
  if (typeof window === "undefined") return;
  
  // Limpiar tokens
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem("admin_auth_session");
  
  // Redirigir a login solo si no estamos ya ahí
  if (window.location.pathname !== "/admin/login") {
    window.location.href = "/admin/login";
  }
}

/**
 * Creates fetch options with auth headers and timeout
 */
function createFetchOptions(options: RequestInit = {}): RequestInit {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  // Clean up timeout if request completes
  const originalSignal = options.signal;
  const signal = originalSignal
    ? (() => {
        const combinedController = new AbortController();
        originalSignal.addEventListener("abort", () => combinedController.abort());
        controller.signal.addEventListener("abort", () => combinedController.abort());
        return combinedController.signal;
      })()
    : controller.signal;

  // Note: Timeout cleanup happens automatically when fetch completes or is aborted

  return {
    ...options,
    headers,
    signal,
  };
}

/**
 * Wrapper para fetch que maneja errores 401 automáticamente
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const fetchOptions = createFetchOptions(options);
  const response = await fetch(url, fetchOptions);
  
  // Si recibimos 401, el token está expirado o es inválido
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized: Token expired or invalid");
  }
  
  return response;
}

class AdminApiClient {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/stats`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get orders with pagination and filters
   */
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<ApiResponse<OrderResponse[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.type) queryParams.append("type", params.type);

    const url = `${API_BASE_URL}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetchWithAuth(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<ApiResponse<OrderFullResponse>> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/orders/${id}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get tours with pagination
   */
  async getTours(params?: {
    page?: number;
    limit?: number;
    category?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<TourResponse[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const url = `${API_BASE_URL}/tours${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetchWithAuth(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Failed to fetch tours: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get tour by ID
   */
  async getTourById(id: string): Promise<ApiResponse<TourFullResponse>> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/tours/${id}?includeContent=true&includeImages=true&includeDepartures=true&includePrices=true&includeAdditionals=true`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tour: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create tour
   */
  async createTour(data: CreateTourDto): Promise<ApiResponse<TourResponse>> {
    // Basic runtime validation
    if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
      throw new Error("Tour name is required and must be a non-empty string");
    }
    if (!data.slug || typeof data.slug !== "string" || data.slug.trim().length === 0) {
      throw new Error("Tour slug is required and must be a non-empty string");
    }
    if (!data.category || typeof data.category !== "string") {
      throw new Error("Tour category is required and must be a string");
    }
    if (!data.shortDescription || typeof data.shortDescription !== "string") {
      throw new Error("Tour short description is required and must be a string");
    }
    if (!data.longDescription || typeof data.longDescription !== "string") {
      throw new Error("Tour long description is required and must be a string");
    }

    const response = await fetchWithAuth(
      `${API_BASE_URL}/tours`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create tour: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Duplicate tour
   */
  async duplicateTour(
    id: string,
    data?: { name?: string; slug?: string }
  ): Promise<ApiResponse<TourResponse>> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/tours/${id}/duplicate`,
      {
        method: "POST",
        body: JSON.stringify(data || {}),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to duplicate tour: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update tour
   */
  async updateTour(id: string, data: UpdateTourDto): Promise<ApiResponse<TourResponse>> {
    // Basic runtime validation for provided fields
    if (data.name !== undefined && (typeof data.name !== "string" || data.name.trim().length === 0)) {
      throw new Error("Tour name must be a non-empty string if provided");
    }
    if (data.slug !== undefined && (typeof data.slug !== "string" || data.slug.trim().length === 0)) {
      throw new Error("Tour slug must be a non-empty string if provided");
    }
    if (data.category !== undefined && typeof data.category !== "string") {
      throw new Error("Tour category must be a string if provided");
    }

    const response = await fetchWithAuth(
      `${API_BASE_URL}/tours/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update tour: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete tour
   */
  async deleteTour(id: string): Promise<ApiResponse<void>> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/tours/${id}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete tour: ${response.statusText}`);
    }

    // El endpoint DELETE devuelve 204 No Content, así que retornamos éxito sin parsear JSON
    if (response.status === 204) {
      return {
        success: true,
        data: undefined as void,
        timestamp: new Date().toISOString(),
      };
    }

    // Si hay contenido, intentar parsear JSON
    try {
      return await response.json();
    } catch {
      return {
        success: true,
        data: undefined as void,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get bookings with pagination
   */
  async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    orderId?: string;
  }): Promise<ApiResponse<BookingResponse[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.orderId) queryParams.append("orderId", params.orderId);

    const url = `${API_BASE_URL}/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetchWithAuth(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<ApiResponse<BookingResponse>> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/bookings/${id}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch booking: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get notifications with pagination
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    orderId?: string;
  }): Promise<ApiResponse<NotificationResponse[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.type) queryParams.append("type", params.type);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.orderId) queryParams.append("orderId", params.orderId);

    const url = `${API_BASE_URL}/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetchWithAuth(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: string): Promise<ApiResponse<NotificationResponse>> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/notifications/${id}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch notification: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<OrderResponse>> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/orders/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(id: string, status: string): Promise<ApiResponse<BookingResponse>> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/bookings/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update booking status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get users with pagination
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: string;
  }): Promise<ApiResponse<UserSummary[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.isActive) queryParams.append("isActive", params.isActive);

    const url = `${API_BASE_URL}/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetchWithAuth(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create user
   */
  async createUser(data: CreateUserDto): Promise<ApiResponse<UserSummary>> {
    // Basic runtime validation
    if (!data.email || typeof data.email !== "string" || data.email.trim().length === 0) {
      throw new Error("Email is required");
    }
    if (!data.password || typeof data.password !== "string" || data.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    if (data.password !== data.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/admin/users`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete user: ${response.statusText}`);
    }

    if (response.status === 204) {
      return {
        success: true,
        data: undefined as void,
        timestamp: new Date().toISOString(),
      };
    }

    return response.json();
  }

  /**
   * Change user password
   */
  async changeUserPassword(id: string, data: ChangeUserPasswordDto): Promise<ApiResponse<UserSummary>> {
    if (!data.newPassword || typeof data.newPassword !== "string" || data.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }
    if (data.newPassword !== data.confirmNewPassword) {
      throw new Error("Passwords do not match");
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/admin/users/${id}/password`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to change password: ${response.statusText}`);
    }

    // Devolvemos el usuario actualizado (sin password)
    return response.json();
  }
}

export const adminApiClient = new AdminApiClient();

