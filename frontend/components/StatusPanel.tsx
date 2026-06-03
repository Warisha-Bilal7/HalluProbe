"use client";

import React from "react";
import { useHealth, useConfig } from "@/hooks/useApi";
import { Card, Loader, Badge } from "@/components/ui";

export default function StatusPanel() {
  const { health, isLoading: healthLoading } = useHealth();
  const { config, isLoading: configLoading } = useConfig();

  if (healthLoading || configLoading) {
    return (
      <Card className="border border-white/5">
        <div className="flex items-center justify-center gap-3 py-2">
          <Loader size="sm" />
          <p className="text-sm text-gray-400 tracking-wide">Syncing API nodes...</p>
        </div>
      </Card>
    );
  }

  if (!health) {
    return (
      <Card className="border border-rose-500/20 bg-rose-950/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
            </span>
            <span className="text-sm font-semibold text-rose-300 tracking-wide">API Connection Error</span>
          </div>
          <span className="text-xs text-rose-400/80 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full font-mono">
            PORT: 8000 OFFLINE
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-white/5 divide-y divide-white/[0.04] p-0">
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">API Status</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-semibold text-sm text-gray-200 uppercase">{health.status}</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pipeline Mode</p>
          <Badge variant={health.model_loaded ? "success" : "warning"}>
            {health.model_loaded ? "Mock Mode Active" : "Limited Mode"}
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">API Engine Version</p>
          <p className="font-mono text-xs text-gray-300 mt-1">v{health.version}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Base LLM Backbone</p>
          <span className="inline-block font-mono text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full mt-0.5 max-w-[160px] truncate">
            {config?.model_info.base_model || "Mistral-7B"}
          </span>
        </div>
      </div>

      {config && (
        <div className="p-5 grid grid-cols-3 gap-6 text-xs bg-white/[0.01]">
          <div className="space-y-1 border-r border-white/[0.03]">
            <p className="text-gray-500 font-medium">Hidden Dimensions</p>
            <p className="font-mono text-sm text-gray-300">{config.model_info.hidden_dim}</p>
          </div>

          <div className="space-y-1 border-r border-white/[0.03] pl-2">
            <p className="text-gray-500 font-medium">Target Layers</p>
            <p className="font-mono text-sm text-gray-300">
              [{config.model_info.target_layers.join(", ")}]
            </p>
          </div>

          <div className="space-y-1 pl-2">
            <p className="text-gray-500 font-medium">Domain Clfs</p>
            <p className="font-mono text-sm text-gray-300">{config.model_info.num_domains} domains</p>
          </div>
        </div>
      )}
    </Card>
  );
}
