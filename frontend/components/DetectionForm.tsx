"use client";

import React, { useState } from "react";
import { DetectionFormData, DetectionResult } from "@/types/api";
import { Button, TextArea, Alert } from "@/components/ui";
import { useDetection } from "@/hooks/useApi";
import ScoreDisplay from "./ScoreDisplay";

interface DetectionFormProps {
  onResult?: (result: DetectionResult) => void;
}

export default function DetectionForm({ onResult }: DetectionFormProps) {
  const [formData, setFormData] = useState<DetectionFormData>({
    prompt: "",
    answer: "",
    threshold: 0.5,
    includeFeatures: true,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { result, isLoading, error, detect } = useDetection();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.prompt.trim()) {
      errors.prompt = "Input prompt is required";
    }
    if (!formData.answer.trim()) {
      errors.answer = "Model response is required";
    }
    if (formData.prompt.trim().length < 5) {
      errors.prompt = "Prompt must be at least 5 characters";
    }
    if (formData.answer.trim().length < 5) {
      errors.answer = "Answer must be at least 5 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const detectionResult = await detect({
        prompt: formData.prompt.trim(),
        answer: formData.answer.trim(),
        threshold: formData.threshold,
        return_features: formData.includeFeatures,
      });

      onResult?.(detectionResult);
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextArea
          label="1. Input Prompt"
          placeholder="Type or paste the prompt sent to the LLM (e.g., 'What is the molecular structure of aspirin?')..."
          value={formData.prompt}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, prompt: e.target.value }));
            if (validationErrors.prompt) {
              setValidationErrors((prev) => {
                const { prompt, ...rest } = prev;
                return rest;
              });
            }
          }}
          error={validationErrors.prompt}
          rows={3}
          className="font-mono text-sm bg-[#080d19] border-white/5 focus:border-violet-500"
        />

        <TextArea
          label="2. Model Answer"
          placeholder="Paste the generated response to check for potential hallucinations or inconsistencies..."
          value={formData.answer}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, answer: e.target.value }));
            if (validationErrors.answer) {
              setValidationErrors((prev) => {
                const { answer, ...rest } = prev;
                return rest;
              });
            }
          }}
          error={validationErrors.answer}
          rows={4}
          className="font-mono text-sm bg-[#080d19] border-white/5 focus:border-violet-500"
        />

        <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-gray-400">
              <span>Risk Threshold</span>
              <span className="font-mono text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                {formData.threshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={formData.threshold}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  threshold: parseFloat(e.target.value),
                }))
              }
              className="w-full cursor-pointer accent-violet-500"
            />
            <p className="text-[10px] text-gray-500 leading-snug">
              Adjust cutoff value. Lower thresholds identify more potential hallucinations.
            </p>
          </div>

          <div className="flex items-center md:justify-end">
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={formData.includeFeatures}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    includeFeatures: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-white/[0.1] bg-[#080d19] text-violet-600 focus:ring-violet-500 focus:ring-offset-[#070a13] cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-300 group-hover:text-white transition-colors">
                  Retrieve Hidden State Logs
                </span>
                <p className="text-[10px] text-gray-500 font-normal">
                  Includes dimensions & domain classification logits.
                </p>
              </div>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          className="w-full py-3"
        >
          {isLoading ? "Running Probes..." : "🔍 Analyze Response"}
        </Button>
      </form>

      {error && (
        <Alert variant="error" message={error} />
      )}

      {result && <ScoreDisplay result={result} />}
    </div>
  );
}
