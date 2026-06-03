"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import StatusPanel from "@/components/StatusPanel";
import NavTabs from "@/components/NavTabs";
import DetectionForm from "@/components/DetectionForm";
import BatchDetection from "@/components/BatchDetection";
import InfoPanel from "@/components/InfoPanel";
import { Card, Alert } from "@/components/ui";

export default function Home() {
  const [activeTab, setActiveTab] = useState("single");

  const tabs = [
    { id: "single", label: "Single Detection", icon: "🎯" },
    { id: "batch", label: "Batch Processing", icon: "📦" },
    { id: "info", label: "Information", icon: "ℹ️" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Header />

        {/* Status Panel */}
        <div className="mt-8">
          <StatusPanel />
        </div>

        {/* Main Content */}
        <div className="mt-8">
          <Card>
            {/* Navigation Tabs */}
            <NavTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {/* Tab Content */}
            <div className="py-6">
              {activeTab === "single" && (
                <div className="max-w-2xl">
                  <p className="text-gray-600 mb-6">
                    Enter a prompt and the model's answer to detect if it contains hallucinations.
                    Adjust the threshold to control sensitivity.
                  </p>
                  <DetectionForm />
                </div>
              )}

              {activeTab === "batch" && (
                <div className="max-w-4xl">
                  <p className="text-gray-600 mb-6">
                    Process multiple prompt-answer pairs at once. Import from CSV or add items manually.
                    Results can be exported for further analysis.
                  </p>
                  <BatchDetection />
                </div>
              )}

              {activeTab === "info" && (
                <div className="max-w-3xl">
                  <InfoPanel />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-gray-200 text-center text-gray-600 text-sm">
          <p>
            HalluProbe v1.0.0 • Advanced Machine Learning Course • 2026
          </p>
          <p className="mt-2">
            Built with domain-adversarial training and contrastive learning
          </p>
        </footer>
      </div>
    </main>
  );
}
