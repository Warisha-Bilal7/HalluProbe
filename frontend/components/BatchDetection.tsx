"use client";

import React, { useState } from "react";
import { BatchItem, DetectionResult } from "@/types/api";
import { Button, Card, Alert, Loader, Badge } from "@/components/ui";
import { useBatchDetection } from "@/hooks/useApi";
import { generateId, downloadCsv, formatScore, getScoreLabel } from "@/lib/utils";

export default function BatchDetection() {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [threshold, setThreshold] = useState(0.5);
  const [csvInput, setCsvInput] = useState("");
  const { results, isLoading, error, detectBatch } = useBatchDetection();

  const addItem = () => {
    setBatchItems((prev) => [
      ...prev,
      {
        id: generateId(),
        prompt: "",
        answer: "",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, prompt: string, answer: string) => {
    setBatchItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, prompt, answer } : item
      )
    );
  };

  const handleProcessBatch = async () => {
    const validItems = batchItems.filter((item) => item.prompt && item.answer);
    if (validItems.length === 0) {
      alert("Please add at least one prompt-answer pair");
      return;
    }

    try {
      const processedResults = await detectBatch({
        prompts: validItems.map((item) => item.prompt),
        answers: validItems.map((item) => item.answer),
        threshold,
      });

      setBatchItems((prev) =>
        prev.map((item, idx) => {
          const validIdx = validItems.findIndex((v) => v.id === item.id);
          if (validIdx >= 0 && processedResults.results[validIdx]) {
            return {
              ...item,
              result: processedResults.results[validIdx],
            };
          }
          return item;
        })
      );
    } catch (err) {
      // Error already handled
    }
  };

  const handleImportCsv = () => {
    try {
      const lines = csvInput.trim().split("\n");
      const newItems: BatchItem[] = [];

      for (const line of lines) {
        const [prompt, answer] = line.split("|").map((s) => s.trim());
        if (prompt && answer) {
          newItems.push({
            id: generateId(),
            prompt,
            answer,
          });
        }
      }

      if (newItems.length > 0) {
        setBatchItems((prev) => [...prev, ...newItems]);
        setCsvInput("");
      } else {
        alert("No valid prompt-answer pairs found. Use format: prompt|answer");
      }
    } catch (err) {
      alert("Failed to import CSV. Use format: prompt|answer (one per line)");
    }
  };

  const handleExportResults = () => {
    const exportData = batchItems
      .filter((item) => item.result)
      .map((item) => ({
        prompt: item.prompt,
        answer: item.answer,
        score: item.result?.hallucination_score ?? 0,
        is_hallucination: item.result?.is_hallucination ?? false,
        confidence: item.result?.confidence ?? 0,
        label: item.result ? getScoreLabel(item.result.hallucination_score) : "",
      }));

    if (exportData.length === 0) {
      alert("No results to export");
      return;
    }

    downloadCsv(exportData, `halluprobe-results-${Date.now()}.csv`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Batch Detection</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Import from CSV (prompt|answer format, one per line)
            </label>
            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder={`Example:\nWhat is 2+2?|2+2 equals 5\nWhat is the capital of France?|Paris`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <Button
              onClick={handleImportCsv}
              variant="secondary"
              size="sm"
              className="mt-2"
            >
              Import
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Threshold: {threshold.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {batchItems.length > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Items ({batchItems.length})
            </h3>
            <div className="space-x-2">
              <Button
                onClick={addItem}
                variant="secondary"
                size="sm"
              >
                Add Item
              </Button>
              <Button
                onClick={handleProcessBatch}
                disabled={isLoading}
                isLoading={isLoading}
              >
                {isLoading ? "Processing..." : "Process Batch"}
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {batchItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Prompt"
                      value={item.prompt}
                      onChange={(e) => updateItem(item.id, e.target.value, item.answer)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Answer"
                      value={item.answer}
                      onChange={(e) => updateItem(item.id, item.prompt, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => removeItem(item.id)}
                    variant="danger"
                    size="sm"
                    className="ml-2"
                  >
                    ✕
                  </Button>
                </div>

                {item.result && (
                  <div className="bg-gray-50 p-2 rounded flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Score: {formatScore(item.result.hallucination_score)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {getScoreLabel(item.result.hallucination_score)}
                      </p>
                    </div>
                    <Badge
                      variant={item.result.is_hallucination ? "danger" : "success"}
                    >
                      {item.result.is_hallucination ? "Hallucination" : "Truthful"}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>

          {batchItems.some((item) => item.result) && (
            <Button
              onClick={handleExportResults}
              variant="secondary"
              size="sm"
              className="mt-4 w-full"
            >
              📥 Export Results as CSV
            </Button>
          )}
        </Card>
      )}

      {error && <Alert variant="error" message={error} />}
    </div>
  );
}
