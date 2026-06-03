export interface DetectionResult {
  hallucination_score: number;
  is_hallucination: boolean;
  confidence: number;
  features?: number[];
  domain_logits?: number[];
}

export interface BatchDetectionResult {
  results: DetectionResult[];
  processing_time_ms: number;
}

export interface DetectionRequest {
  prompt: string;
  answer: string;
  threshold?: number;
  return_features?: boolean;
}

export interface BatchDetectionRequest {
  prompts: string[];
  answers: string[];
  threshold?: number;
}

export interface ModelInfo {
  base_model: string;
  target_layers: number[];
  num_domains: number;
  hidden_dim: number;
  probe_parameters: number;
}

export interface ConfigResponse {
  model_info: ModelInfo;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  version: string;
}

export interface DetectionFormData {
  prompt: string;
  answer: string;
  threshold: number;
  includeFeatures: boolean;
}

export interface BatchItem {
  id: string;
  prompt: string;
  answer: string;
  result?: DetectionResult;
  error?: string;
  isProcessing?: boolean;
}

export interface VisualizationData {
  domain: string;
  score: number;
  confidence: number;
}
