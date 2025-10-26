import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiConfig, endpoints, getHeaders, addAuthHeader, handleAuthError } from '../config/api';
import { mockApiService } from './mockApiService';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// Request retry configuration
interface RetryConfig {
  retries: number;
  retryCondition?: (error: any) => boolean;
  retryDelay?: (retryNumber: number) => number;
}

class ApiClient {
  private client: AxiosInstance;
  private defaultRetryConfig: RetryConfig = {
    retries: apiConfig.retryAttempts,
    retryCondition: (error) => {
      return error.response?.status >= 500 || error.code === 'NETWORK_ERROR';
    },
    retryDelay: (retryNumber) => Math.min(1000 * Math.pow(2, retryNumber), apiConfig.retryDelay),
  };

  constructor() {
    this.client = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth header
        addAuthHeader(config);
        
        // Add request timestamp for debugging
        if (process.env.REACT_APP_DEBUG_MODE === 'true') {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        if (process.env.REACT_APP_DEBUG_MODE === 'true') {
          console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
        }

        return response;
      },
      async (error) => {
        console.error('[API Response Error]', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
          data: error.response?.data,
        });

        // Handle auth errors
        await handleAuthError(error);

        return Promise.reject(this.transformError(error));
      }
    );
  }

  private transformError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.response.data?.error || 'Server error occurred',
        status: error.response.status,
        code: error.response.data?.code,
        details: error.response.data,
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      };
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>,
    config: Partial<RetryConfig> = {},
    endpoint?: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    requestData?: any
  ): Promise<ApiResponse<T>> {
    const { retries, retryCondition, retryDelay } = { ...this.defaultRetryConfig, ...config };
    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await requestFn();
        return response.data;
      } catch (error) {
        lastError = error;

        if (attempt === retries || !retryCondition?.(error)) {
          break;
        }

        // Wait before retrying
        if (retryDelay && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay(attempt)));
        }
      }
    }

    // If all retries failed and it's a network error, try mock service
    const isNetworkError = lastError.code === 'NETWORK_ERROR' || 
                          !lastError.response ||
                          (lastError.response && lastError.response.status >= 500);

    if (isNetworkError && endpoint) {
      console.warn(`[Mock Fallback] Backend unavailable, using mock service for ${method} ${endpoint}`);
      
      try {
        // Extract relative path from endpoint
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        
        switch (method) {
          case 'GET':
            return await mockApiService.get(path);
          case 'POST':
            return await mockApiService.post(path, requestData);
          case 'PUT':
            return await mockApiService.put(path, requestData);
          case 'PATCH':
            return await mockApiService.patch(path, requestData);
          case 'DELETE':
            return await mockApiService.delete(path);
          default:
            throw lastError;
        }
      } catch (mockError) {
        console.error('[Mock Service Error]', mockError);
        // If mock service also fails, throw original error
        throw lastError;
      }
    }

    throw lastError;
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig & { retry?: Partial<RetryConfig> }): Promise<ApiResponse<T>> {
    const { retry, ...axiosConfig } = config || {};
    return this.retryRequest(() => this.client.get(url, axiosConfig), retry, url, 'GET');
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { retry?: Partial<RetryConfig> }
  ): Promise<ApiResponse<T>> {
    const { retry, ...axiosConfig } = config || {};
    return this.retryRequest(() => this.client.post(url, data, axiosConfig), retry, url, 'POST', data);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { retry?: Partial<RetryConfig> }
  ): Promise<ApiResponse<T>> {
    const { retry, ...axiosConfig } = config || {};
    return this.retryRequest(() => this.client.put(url, data, axiosConfig), retry, url, 'PUT', data);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { retry?: Partial<RetryConfig> }
  ): Promise<ApiResponse<T>> {
    const { retry, ...axiosConfig } = config || {};
    return this.retryRequest(() => this.client.patch(url, data, axiosConfig), retry, url, 'PATCH', data);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig & { retry?: Partial<RetryConfig> }): Promise<ApiResponse<T>> {
    const { retry, ...axiosConfig } = config || {};
    return this.retryRequest(() => this.client.delete(url, axiosConfig), retry, url, 'DELETE');
  }

  // Specialized methods for file uploads
  async uploadFile<T = any>(
    url: string,
    file: File,
    data?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
    }

    return this.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
      retry: { retries: 1 }, // Fewer retries for file uploads
    });
  }

  // Batch requests
  async batch<T = any>(requests: Array<() => Promise<ApiResponse<any>>>): Promise<ApiResponse<T[]>> {
    try {
      const results = await Promise.allSettled(requests.map(req => req()));
      
      const data = results.map(result => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error('Batch request failed:', result.reason);
          return { success: false, error: result.reason?.message || 'Request failed' };
        }
      });

      return {
        success: true,
        data: data as T[],
        metadata: {
          total: results.length,
          // successful: results.filter(r => r.status === 'fulfilled').length,
          // failed: results.filter(r => r.status === 'rejected').length,
        }
      };
    } catch (error) {
      throw this.transformError(error);
    }
  }

  // Cache management
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  async getWithCache<T = any>(
    url: string,
    ttl: number = 5 * 60 * 1000, // 5 minutes default
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const cacheKey = `${url}-${JSON.stringify(config)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      if (process.env.REACT_APP_DEBUG_MODE === 'true') {
        console.log(`[Cache Hit] ${url}`);
      }
      return cached.data;
    }

    try {
      const response = await this.get<T>(url, config);
      
      // Cache successful responses
      if (response.success) {
        this.cache.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
          ttl,
        });
      }

      return response;
    } catch (error) {
      // Return cached data if available and request fails
      if (cached) {
        console.warn(`[Cache Fallback] Using stale data for ${url}`);
        return cached.data;
      }
      throw error;
    }
  }

  clearCache(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern);
      Array.from(this.cache.keys()).forEach(key => {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      });
    } else {
      this.cache.clear();
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', { retry: { retries: 0 } });
      return true;
    } catch {
      return false;
    }
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export endpoints for easy access
export { endpoints };

// Export additional types
export type { RetryConfig };

export default apiClient;