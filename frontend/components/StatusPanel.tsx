"use client";

import React from "react";
import { useHealth, useConfig } from "@/hooks/useApi";
import { Card, Loader, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function StatusPanel() {
  const { health, isLoading: healthLoading } = useHealth();
  const { config, isLoading: configLoading } = useConfig();

  if (healthLoading || configLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center space-x-2">
          <Loader size="sm" />
          <p className="text-gray-600">Loading status...</p>
        </div>
      </Card>
    );
  }

  if (!health) {
    return (
      <Card>
        <Badge variant="warning">
          ⚠️ Unable to connect to API
        </Badge>
      </Card>
    );
  }

  return (
    <Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">API Status</p>
          <Badge variant={health.model_loaded ? "success" : "warning"}>
            {health.status}
          </Badge>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Model</p>
          <Badge variant={health.model_loaded ? "success" : "warning"}>
            {health.model_loaded ? "✓ Loaded" : "✗ Not Loaded"}
          </Badge>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Version</p>
          <p className="font-semibold text-gray-900">{health.version}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Model</p>
          <p className="font-semibold text-gray-900 text-sm truncate">
            {config?.model_info.base_model.split("/")[1] || "Unknown"}
          </p>
        </div>
      </div>

      {config && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Hidden Dimension</p>
            <p className="font-semibold text-gray-900">{config.model_info.hidden_dim}</p>
          </div>

          <div>
            <p className="text-gray-600">Target Layers</p>
            <p className="font-semibold text-gray-900">
              {config.model_info.target_layers.join(", ")}
            </p>
          </div>

          <div>
            <p className="text-gray-600">Domains</p>
            <p className="font-semibold text-gray-900">{config.model_info.num_domains}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
