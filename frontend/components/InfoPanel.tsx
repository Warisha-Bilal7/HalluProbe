"use client";

import React from "react";
import { Card } from "@/components/ui";

export default function InfoPanel() {
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-lg font-semibold mb-3">How It Works</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-900">1. Hidden State Extraction</h4>
            <p>
              The LLM's internal hidden states are extracted from specified layers
              (8, 16, 24, 32) and aggregated through mean pooling.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">2. Domain-Adversarial Probe</h4>
            <p>
              A shared encoder processes the hidden states, followed by two heads:
              hallucination classifier and domain predictor (adversarial).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">3. Score Computation</h4>
            <p>
              The hallucination head outputs a probability score [0, 1] indicating
              the likelihood of hallucination.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">4. Classification</h4>
            <p>
              The score is compared against the threshold to classify as hallucination
              or truthful.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-3">Interpretation Guide</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-3">
            <span className="inline-block w-16 h-12 bg-green-100 rounded"></span>
            <div>
              <p className="font-semibold text-green-800">Low Risk (0.0 - 0.3)</p>
              <p className="text-gray-600">High confidence in truthfulness</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-block w-16 h-12 bg-yellow-100 rounded"></span>
            <div>
              <p className="font-semibold text-yellow-800">Moderate Risk (0.3 - 0.5)</p>
              <p className="text-gray-600">Mixed signals, review manually</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-block w-16 h-12 bg-orange-100 rounded"></span>
            <div>
              <p className="font-semibold text-orange-800">High Risk (0.5 - 0.7)</p>
              <p className="text-gray-600">Likely hallucination, verify</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-block w-16 h-12 bg-red-100 rounded"></span>
            <div>
              <p className="font-semibold text-red-800">Very High Risk (0.7 - 1.0)</p>
              <p className="text-gray-600">High confidence in hallucination</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-3">Key Features</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✅ Domain-invariant detection across multiple domains</li>
          <li>✅ Adversarial training for robust out-of-distribution generalization</li>
          <li>✅ Contrastive learning for better representations</li>
          <li>✅ Single and batch detection support</li>
          <li>✅ Real-time results with confidence scores</li>
          <li>✅ Export results as CSV for further analysis</li>
        </ul>
      </Card>
    </div>
  );
}
