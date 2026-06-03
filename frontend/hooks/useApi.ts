import { useState, useCallback, useEffect } from "react";
import { halluProbeApi, ApiError } from "@/lib/api";
import {
  DetectionRequest,
  DetectionResult,
  HealthResponse,
  ConfigResponse,
  BatchDetectionRequest,
  BatchDetectionResult,
} from "@/types/api";

export function useDetection() {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async (request: DetectionRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await halluProbeApi.detect(request);
      setResult(result);
      return result;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to detect hallucination";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { result, isLoading, error, detect };
}

export function useBatchDetection() {
  const [results, setResults] = useState<BatchDetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectBatch = useCallback(async (request: BatchDetectionRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await halluProbeApi.detectBatch(request);
      setResults(results);
      return results;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to detect batch";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { results, isLoading, error, detectBatch };
}

export function useHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await halluProbeApi.health();
        setHealth(response);
        setError(null);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Failed to check API health";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  return { health, isLoading, error };
}

export function useConfig() {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await halluProbeApi.getConfig();
        setConfig(response);
        setError(null);
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Failed to fetch config";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, isLoading, error };
}
