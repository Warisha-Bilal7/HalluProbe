"use client";

import React from "react";
import { Card } from "@/components/ui";

export default function InfoPanel() {
  return (
    <div className="space-y-6">
      {/* How it works panel */}
      <Card className="border border-white/5">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Pipeline Architecture</h3>
        <div className="space-y-4 text-xs text-gray-400">
          <div className="p-3 bg-white/[0.01] border border-white/[0.02] rounded-lg">
            <h4 className="font-semibold text-gray-200 text-sm">1. Hidden State Extraction</h4>
            <p className="mt-1 leading-relaxed">
              The target LLM's internal representation vectors are intercepted at specified layers
              (typically 8, 16, 24, 32) and pooled to form an aggregated representation.
            </p>
          </div>

          <div className="p-3 bg-white/[0.01] border border-white/[0.02] rounded-lg">
            <h4 className="font-semibold text-gray-200 text-sm">2. Domain-Adversarial Encoders</h4>
            <p className="mt-1 leading-relaxed">
              An encoder processes these states alongside a domain predictor. Adversarial training enforces
              the encoder to discard domain-specific footprints, keeping only semantic truth signals.
            </p>
          </div>

          <div className="p-3 bg-white/[0.01] border border-white/[0.02] rounded-lg">
            <h4 className="font-semibold text-gray-200 text-sm">3. Contrastive Alignment Probes</h4>
            <p className="mt-1 leading-relaxed">
              Contrastive losses align true statement representations closer together while projecting
              fabricated/inaccurate statements into separate geometric sub-spaces.
            </p>
          </div>

          <div className="p-3 bg-white/[0.01] border border-white/[0.02] rounded-lg">
            <h4 className="font-semibold text-gray-200 text-sm">4. Probability Thresholding</h4>
            <p className="mt-1 leading-relaxed">
              The classification head computes a final sigmoid score [0.0 - 1.0]. Ratings exceeding the 
              user-specified threshold are flagged as hallucinations.
            </p>
          </div>
        </div>
      </Card>

      {/* Interpretation guide */}
      <Card className="border border-white/5">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Risk Level Interpretation</h3>
        <div className="space-y-3.5 text-xs">
          <div className="flex items-center gap-4 p-2.5 bg-white/[0.01] border border-white/[0.02] rounded-lg">
            <span className="flex-shrink-0 w-12 h-10 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold font-mono text-glow-green">
              &lt; 0.3
            </span>
            <div>
              <p className="font-semibold text-emerald-400 text-sm uppercase tracking-wider">Low Risk</p>
              <p className="text-gray-400 mt-0.5">High confidence in response accuracy and truthfulness.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2.5 bg-white/[0.01] border border-white/[0.02] rounded-lg">
            <span className="flex-shrink-0 w-12 h-10 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold font-mono">
              0.3-0.5
            </span>
            <div>
              <p className="font-semibold text-amber-400 text-sm uppercase tracking-wider">Moderate Risk</p>
              <p className="text-gray-400 mt-0.5">Inconsistent signal. Recommended for automated verify flags.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2.5 bg-white/[0.01] border border-white/[0.02] rounded-lg">
            <span className="flex-shrink-0 w-12 h-10 rounded-lg border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold font-mono">
              0.5-0.7
            </span>
            <div>
              <p className="font-semibold text-orange-400 text-sm uppercase tracking-wider">High Risk</p>
              <p className="text-gray-400 mt-0.5">Likely contains fabrications. Verify before exposing to production.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2.5 bg-white/[0.01] border border-white/[0.02] rounded-lg">
            <span className="flex-shrink-0 w-12 h-10 rounded-lg border border-rose-500/30 bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold font-mono text-glow-red">
              &gt; 0.7
            </span>
            <div>
              <p className="font-semibold text-rose-400 text-sm uppercase tracking-wider">Very High Risk</p>
              <p className="text-gray-400 mt-0.5">Extreme likelihood of hallucinated context. Intercept immediately.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Core framework advantages */}
      <Card className="border border-white/5">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Key Features</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400">
          <li className="flex items-center gap-2.5">
            <span className="text-violet-400">⚡</span> Domain-invariant cross-dataset scoring
          </li>
          <li className="flex items-center gap-2.5">
            <span className="text-violet-400">⚡</span> Out-of-distribution adversarial robustness
          </li>
          <li className="flex items-center gap-2.5">
            <span className="text-violet-400">⚡</span> Contrastive latent state projection
          </li>
          <li className="flex items-center gap-2.5">
            <span className="text-violet-400">⚡</span> Multi-item CSV import & export queue
          </li>
          <li className="flex items-center gap-2.5">
            <span className="text-violet-400">⚡</span> Real-time network health diagnostics
          </li>
          <li className="flex items-center gap-2.5">
            <span className="text-violet-400">⚡</span> Dimension feature mapping outputs
          </li>
        </ul>
      </Card>
    </div>
  );
}
