// API client for FoodCast backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    userType: string;
  };
  session?: any;
}

export interface SignupRequest {
  email: string;
  password: string;
  userType: 'store' | 'student' | 'shelter';
  profileData?: {
    name: string;
    contact_email: string;
    phone?: string;
    address?: string;
    zip_code?: number;
    latitude?: number;
    longitude?: number;
  };
}

export interface SignupResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    userType: string;
  };
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    foodRescued: {
      totalUnits: number;
      averageWastePercentage: number;
    };
    environmentalImpact: {
      co2SavedKg: number;
      estimatedTreesSaved: number;
    };
    recipientImpact: {
      totalRecipients: number;
      totalCapacity: number;
      utilizationRate: number;
    };
    period: {
      startDate: string;
      endDate: string;
    };
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData: SignupRequest): Promise<ApiResponse<SignupResponse>> {
    return this.request<SignupResponse>('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // Analytics
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    storeId?: string;
  }): Promise<ApiResponse<AnalyticsResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.storeId) queryParams.append('storeId', params.storeId);

    const endpoint = queryParams.toString() 
      ? `/analytics?${queryParams.toString()}`
      : '/analytics';

    return this.request<AnalyticsResponse>(endpoint);
  }

  // Surplus management
  async uploadSurplus(data: {
    storeId: string;
    products: Array<{
      product_name: string;
      category: string;
      brain_diet_flag?: boolean;
      shelf_life_days?: number;
      wasted_units: number;
      waste_percentage: number;
      store_location?: string;
    }>;
  }): Promise<ApiResponse> {
    return this.request('/upload-surplus', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async predictSurplus(data: {
    storeId: string;
    predictionDate?: string;
  }): Promise<ApiResponse> {
    return this.request('/predict-surplus', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Allocation
  async allocate(data: {
    surplusId: string;
    recipientPreferences?: any;
  }): Promise<ApiResponse> {
    return this.request('/allocate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing
export { ApiClient };
