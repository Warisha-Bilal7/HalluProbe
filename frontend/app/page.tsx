"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import StatusPanel from "@/components/StatusPanel";
import NavTabs from "@/components/NavTabs";
import DetectionForm from "@/components/DetectionForm";
import BatchDetection from "@/components/BatchDetection";
import InfoPanel from "@/components/InfoPanel";
import { Card } from "@/components/ui";

export default function Home() {
  const [activeTab, setActiveTab] = useState("single");

  const tabs = [
    { id: "single", label: "Single Probe", icon: "🎯" },
    { id: "batch", label: "Queue Processing", icon: "📦" },
    { id: "info", label: "Architecture", icon: "ℹ️" },
  ];

  return (
    <main className="min-h-screen bg-[#070a13] cyber-grid pb-16">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Brand Header */}
        <Header />

        {/* Status Dashboard Panel */}
        <StatusPanel />

        {/* Main interactive area */}
        <Card className="p-0 border border-white/5 overflow-hidden bg-white/[0.01] rounded-xl">
          {/* Navigation Tabs */}
          <NavTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "single" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-gray-200 uppercase tracking-wider">Single Input Evaluator</h2>
                  <p className="text-xs text-gray-400">
                    Input prompt-answer pair to extract pooled layers and calculate domain-invariant hallucination risk.
                  </p>
                </div>
                <DetectionForm />
              </div>
            )}

            {activeTab === "batch" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-gray-200 uppercase tracking-wider">Batch Queue Evaluator</h2>
                  <p className="text-xs text-gray-400">
                    Import multiple prompt-answer pairs via pipe-separated lines to process in batches and download results.
                  </p>
                </div>
                <BatchDetection />
              </div>
            )}

            {activeTab === "info" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-gray-200 uppercase tracking-wider">System Specifications</h2>
                  <p className="text-xs text-gray-400">
                    Technical overview of the adversarial encoders and contrastive hidden state probes.
                  </p>
                </div>
                <InfoPanel />
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <footer className="py-8 text-center text-[10px] uppercase tracking-widest text-gray-500 font-semibold space-y-1">
          <p>
            HalluProbe Framework • Version 1.0.0
          </p>
          <p className="opacity-60 font-mono text-[9px]">
            Designed with Domain-Adversarial Encoders & Contrastive Loss Alignment
          </p>
        </footer>
      </div>
    </main>
  );
}
