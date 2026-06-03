"use client";

import React, { useState } from "react";
import { DetectionFormData, DetectionResult } from "@/types/api";
import { Button, TextArea, Input, Alert, Loader } from "@/components/ui";
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
    includeFeatures: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { result, isLoading, error, detect } = useDetection();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.prompt.trim()) {
      errors.prompt = "Prompt is required";
    }
    if (!formData.answer.trim()) {
      errors.answer = "Answer is required";
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
      // Error is already set in the hook
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextArea
          label="Prompt"
          placeholder="Enter the input prompt..."
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
          rows={4}
        />

        <TextArea
          label="Answer"
          placeholder="Enter the model's answer..."
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
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Threshold: {formData.threshold.toFixed(2)}
            </label>
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
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower = detect more hallucinations
            </p>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.includeFeatures}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    includeFeatures: e.target.checked,
                  }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Include Features</span>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          className="w-full"
        >
          {isLoading ? "Detecting..." : "Detect Hallucination"}
        </Button>
      </form>

      {error && (
        <Alert variant="error" message={error} className="mt-4" />
      )}

      {result && <ScoreDisplay result={result} />}
    </div>
  );
}
