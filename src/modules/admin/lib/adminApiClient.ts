/**
 * Admin API Client
 * Reuses existing API clients and adds admin-specific endpoints
 */

// toursClient tiene estructura diferente, usamos fetch directo

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class AdminApiClient {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.type) queryParams.append("type", params.type);

    const url = `${API_BASE_URL}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const url = `${API_BASE_URL}/tours${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tours: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get tour by ID
   */
  async getTourById(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/tours/${id}?includeContent=true&includeImages=true&includeDepartures=true&includePrices=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tour: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create tour
   */
  async createTour(data: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/tours`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create tour: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update tour
   */
  async updateTour(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update tour: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete tour
   */
  async deleteTour(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete tour: ${response.statusText}`);
    }

    // El endpoint DELETE devuelve 204 No Content, así que retornamos éxito sin parsear JSON
    if (response.status === 204) {
      return { success: true };
    }

    // Si hay contenido, intentar parsear JSON
    try {
      return await response.json();
    } catch {
      return { success: true };
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
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.orderId) queryParams.append("orderId", params.orderId);

    const url = `${API_BASE_URL}/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.type) queryParams.append("type", params.type);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.orderId) queryParams.append("orderId", params.orderId);

    const url = `${API_BASE_URL}/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notification: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(id: string, status: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update booking status: ${response.statusText}`);
    }

    return response.json();
  }
}

export const adminApiClient = new AdminApiClient();

