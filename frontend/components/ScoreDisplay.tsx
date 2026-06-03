"use client";

import React from "react";
import { DetectionResult } from "@/types/api";
import { Card, Badge } from "@/components/ui";
import {
  formatScore,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel,
} from "@/lib/utils";

interface ScoreDisplayProps {
  result: DetectionResult;
}

export default function ScoreDisplay({ result }: ScoreDisplayProps) {
  const scoreColor = getScoreColor(result.hallucination_score);
  const scoreBg = getScoreBgColor(result.hallucination_score);
  const scoreLabel = getScoreLabel(result.hallucination_score);

  return (
    <Card className="mt-6 border-2 border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Detection Result</h3>
          <Badge variant={result.is_hallucination ? "danger" : "success"}>
            {result.is_hallucination ? "🚨 Hallucination" : "✅ Not Hallucination"}
          </Badge>
        </div>

        <div className={`p-6 rounded-lg ${scoreBg}`}>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Hallucination Score</p>
            <p className={`text-5xl font-bold ${scoreColor}`}>
              {formatScore(result.hallucination_score)}
            </p>
            <p className="text-sm text-gray-600 mt-2">{scoreLabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Confidence</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatScore(result.confidence, 1)}%
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Classification</p>
            <p className="text-lg font-semibold text-gray-900">
              {result.is_hallucination ? "Hallucination" : "Truthful"}
            </p>
          </div>
        </div>

        {result.features && result.features.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Features ({result.features.length} dimensions)
            </p>
            <div className="grid grid-cols-4 gap-2">
              {result.features.slice(0, 8).map((feat, idx) => (
                <div key={idx} className="bg-white p-2 rounded text-center">
                  <p className="text-xs text-gray-600">{feat.toFixed(3)}</p>
                </div>
              ))}
              {result.features.length > 8 && (
                <div className="bg-white p-2 rounded text-center">
                  <p className="text-xs text-gray-600">+{result.features.length - 8}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {result.domain_logits && result.domain_logits.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Domain Classification
            </p>
            <div className="space-y-2">
              {result.domain_logits.map((logit, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Domain {idx}</span>
                  <div className="w-24 bg-white rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${Math.max(0, Math.min(100, (logit / 2) * 100))}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {logit.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
