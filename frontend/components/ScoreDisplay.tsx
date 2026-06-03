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
  const percentage = Math.round(result.hallucination_score * 100);

  const domainNames = ["Medical Domain", "Legal Domain", "Biography Domain", "General/OOD"];

  const getRiskBorder = (score: number) => {
    if (score < 0.3) return "border-emerald-500/20 shadow-emerald-500/5";
    if (score < 0.5) return "border-amber-500/20 shadow-amber-500/5";
    if (score < 0.7) return "border-orange-500/20 shadow-orange-500/5";
    return "border-rose-500/20 shadow-rose-500/5";
  };

  const getDialColor = (score: number) => {
    if (score < 0.3) return "#10b981"; // Emerald
    if (score < 0.5) return "#f59e0b"; // Amber
    if (score < 0.7) return "#f97316"; // Orange
    return "#f43f5e"; // Rose
  };

  const strokeDashoffset = 251.2 - (251.2 * percentage) / 100;

  return (
    <Card className={`mt-6 border border-white/5 shadow-2xl transition-all duration-300 ${getRiskBorder(result.hallucination_score)}`}>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Analysis Breakdown</h3>
          <Badge variant={result.is_hallucination ? "danger" : "success"}>
            {result.is_hallucination ? "🚨 Hallucinated" : "✅ Truthful"}
          </Badge>
        </div>

        {/* Circular Progress + Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Circular SVG Ring */}
          <div className="flex flex-col items-center justify-center p-4 bg-white/[0.01] rounded-xl border border-white/[0.02]">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  className="text-[#0d1222]"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                {/* Active Ring */}
                <circle
                  strokeWidth="6"
                  strokeDasharray="251.2"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke={getDialColor(result.hallucination_score)}
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-extrabold tracking-tight ${scoreColor}`}>
                  {percentage}%
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-0.5">
                  Hallucination
                </span>
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-300 mt-4 uppercase tracking-wider text-glow-green">
              {scoreLabel}
            </p>
          </div>

          {/* Stats Details Grid */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-[#0b101f] border border-white/[0.03] p-4 rounded-xl space-y-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Calculated Prob</p>
              <p className={`text-2xl font-extrabold ${scoreColor}`}>
                {formatScore(result.hallucination_score)}
              </p>
              <p className="text-[10px] text-gray-400">Values close to 1 indicate errors.</p>
            </div>

            <div className="bg-[#0b101f] border border-white/[0.03] p-4 rounded-xl space-y-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Confidence Score</p>
              <p className="text-2xl font-extrabold text-white">
                {formatScore(result.confidence * 100, 1)}%
              </p>
              <p className="text-[10px] text-gray-400">Classifier confidence in result.</p>
            </div>

            <div className="col-span-2 bg-[#0b101f] border border-white/[0.03] p-4 rounded-xl space-y-1 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Classification</p>
                <p className="text-lg font-semibold text-gray-200 mt-0.5">
                  {result.is_hallucination ? "🚨 Hallucinated response detected" : "✅ response matches truthful probes"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Hidden State Logs Grid */}
        {result.features && result.features.length > 0 && (
          <div className="bg-[#080d19] border border-white/[0.03] p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Hidden State Vector Matrix ({result.features.length} dimensions)
              </p>
              <span className="text-[9px] font-mono font-bold bg-white/[0.04] text-gray-400 border border-white/[0.08] px-2 py-0.5 rounded-full">
                Pooled layers
              </span>
            </div>
            
            <div className="grid grid-cols-8 gap-2">
              {result.features.slice(0, 16).map((feat, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/[0.05] p-2 rounded-lg text-center transition-colors hover:border-violet-500/30">
                  <p className="text-[10px] font-mono text-violet-300 font-medium">{feat.toFixed(3)}</p>
                </div>
              ))}
              {result.features.length > 16 && (
                <div className="bg-white/[0.02] border border-white/[0.05] p-2 rounded-lg flex items-center justify-center">
                  <p className="text-[9px] font-bold text-gray-500">+{result.features.length - 16} dim</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Domain Classification Progress bars */}
        {result.domain_logits && result.domain_logits.length > 0 && (
          <div className="bg-[#080d19] border border-white/[0.03] p-4 rounded-xl space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Domain Classifier Attribution
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.domain_logits.map((logit, idx) => {
                const logitPercent = Math.max(0, Math.min(100, Math.round(((logit + 2) / 4) * 100)));
                return (
                  <div key={idx} className="space-y-1.5 p-3 bg-white/[0.01] rounded-lg border border-white/[0.02]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-300 font-semibold">{domainNames[idx] || `Domain ${idx}`}</span>
                      <span className="font-mono text-gray-400 font-medium">Logit: {logit.toFixed(3)}</span>
                    </div>
                    <div className="w-full bg-[#0a0f1d] rounded-full h-2 overflow-hidden border border-white/[0.04]">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                        style={{ width: `${logitPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
