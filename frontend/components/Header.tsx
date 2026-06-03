"use client";

import React from "react";
import { Card } from "@/components/ui";

export default function Header() {
  return (
    <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">HalluProbe</h1>
        <p className="text-blue-100">
          Domain-Invariant Hallucination Detection for Large Language Models
        </p>
        <div className="pt-2 space-y-1 text-sm text-blue-100">
          <p>
            🎯 Detect hallucinations across medical, legal, biography, and general domains
          </p>
          <p>
            🛡️ Powered by adversarial training and contrastive learning
          </p>
        </div>
      </div>
    </Card>
  );
}
