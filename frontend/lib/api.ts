import {
  DetectionRequest,
  BatchDetectionRequest,
  DetectionResult,
  BatchDetectionResult,
  ConfigResponse,
  HealthResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = "/api/v1";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        error.detail || `API Error: ${response.status}`,
        error.detail
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, "Failed to fetch from API", String(error));
  }
}

export const halluProbeApi = {
  /**
   * Check API health and model status
   */
  async health(): Promise<HealthResponse> {
    return fetchApi<HealthResponse>("/health");
  },

  /**
   * Get model configuration
   */
  async getConfig(): Promise<ConfigResponse> {
    return fetchApi<ConfigResponse>("/config");
  },

  /**
   * Detect hallucination in single prompt-answer pair
   */
  async detect(request: DetectionRequest): Promise<DetectionResult> {
    return fetchApi<DetectionResult>("/detect", {
      method: "POST",
      body: JSON.stringify({
        ...request,
        threshold: request.threshold ?? 0.5,
        return_features: request.return_features ?? false,
      }),
    });
  },

  /**
   * Detect hallucinations in batch
   */
  async detectBatch(request: BatchDetectionRequest): Promise<BatchDetectionResult> {
    return fetchApi<BatchDetectionResult>("/detect-batch", {
      method: "POST",
      body: JSON.stringify({
        ...request,
        threshold: request.threshold ?? 0.5,
      }),
    });
  },

  /**
   * Get API metrics and statistics
   */
  async getMetrics(): Promise<Record<string, unknown>> {
    return fetchApi<Record<string, unknown>>("/metrics");
  },
};

export { ApiError };
