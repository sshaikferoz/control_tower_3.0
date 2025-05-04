import { getPathsPreview } from './utils';

interface FetchOptions {
    headers?: Record<string, string>;
    params?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    timeout?: number;
}

class ApiService {
    private static instance: ApiService;
    private cache: Record<string, { data: any; timestamp: number }> = {};
    private cacheExpiry = 5 * 60 * 1000; // 5 minutes

    private constructor() {
        // Private constructor to enforce singleton
    }

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    /**
     * Fetch data from an API endpoint
     */
    async fetchData(endpoint: string, options: FetchOptions = {}): Promise<any> {
        try {
            // Check cache first
            const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
            const cachedData = this.cache[cacheKey];

            if (cachedData && Date.now() - cachedData.timestamp < this.cacheExpiry) {
                return cachedData.data;
            }

            // Prepare fetch options
            const fetchOptions: RequestInit = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };

            // Add body for POST/PUT requests
            if ((options.method === 'POST' || options.method === 'PUT') && options.body) {
                fetchOptions.body = JSON.stringify(options.body);
            }

            // Add URL parameters
            let url = endpoint;
            if (options.params) {
                const queryParams = new URLSearchParams();
                Object.entries(options.params).forEach(([key, value]) => {
                    queryParams.append(key, value);
                });
                url = `${url}?${queryParams.toString()}`;
            }

            // Create request with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Update cache
            this.cache[cacheKey] = {
                data,
                timestamp: Date.now()
            };

            return data;
        } catch (error) {
            console.error('Error fetching data from API:', error);
            throw error;
        }
    }

    /**
     * Clear the cache
     */
    clearCache(): void {
        this.cache = {};
    }

    /**
     * Get a preview of paths in an API response
     */
    getPathsPreview(data: any, maxDepth = 5, maxPaths = 100): { path: string; preview: string }[] {
        return getPathsPreview(data, maxDepth, maxPaths);
    }

    /**
     * Get a value at a specific path in the response data
     */
    getValueAtPath(data: any, path: string): any {
        return path.split('.').reduce((o, p) => (o ? o[p] : undefined), data);
    }

    /**
     * Parse API response based on known formats (e.g., specific API structures)
     */
    parseApiResponse(data: any): any {
        // Check if this is our specific form structure
        if (data.FormStructure && data.FormMetadata) {
            return data;
        }

        // For generic responses with a 'data' property
        if (data.data) {
            return data.data;
        }

        // Return as-is if no specific format is detected
        return data;
    }

    /**
     * Make a test connection to validate an API endpoint
     */
    async testConnection(endpoint: string): Promise<{ success: boolean; message: string }> {
        try {
            await this.fetchData(endpoint, { timeout: 5000 });
            return { success: true, message: 'Connection successful' };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

export default ApiService.getInstance();