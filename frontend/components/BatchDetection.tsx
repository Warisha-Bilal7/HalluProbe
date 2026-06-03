"use client";

import React, { useState } from "react";
import { BatchItem } from "@/types/api";
import { Button, Card, Alert, Badge } from "@/components/ui";
import { useBatchDetection } from "@/hooks/useApi";
import { generateId, downloadCsv, formatScore, getScoreLabel } from "@/lib/utils";

export default function BatchDetection() {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [threshold, setThreshold] = useState(0.5);
  const [csvInput, setCsvInput] = useState("");
  const { isLoading, error, detectBatch } = useBatchDetection();

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
      alert("Please add or import at least one prompt-answer pair");
      return;
    }

    try {
      const processedResults = await detectBatch({
        prompts: validItems.map((item) => item.prompt),
        answers: validItems.map((item) => item.answer),
        threshold,
      });

      setBatchItems((prev) =>
        prev.map((item) => {
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
      // Error handled in hook
    }
  };

  const handleImportCsv = () => {
    try {
      const lines = csvInput.trim().split("\n");
      const newItems: BatchItem[] = [];

      for (const line of lines) {
        if (!line.trim()) continue;
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
        alert("No valid prompt-answer pairs found. Ensure format is: prompt|answer");
      }
    } catch (err) {
      alert("Failed to import CSV lines. Format: prompt|answer (one per line)");
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
      alert("No evaluated results available to export");
      return;
    }

    downloadCsv(exportData, `halluprobe-results-${Date.now()}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Import CSV Panel */}
      <Card className="border border-white/5 bg-[#080d19]">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Batch Import Console</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Paste Pipe-Delimited Data (prompt|answer format, one per line)
            </label>
            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder={`Example:\nWhat is 2+2?|2+2 equals 5\nWho wrote Romeo and Juliet?|William Shakespeare`}
              className="w-full px-3.5 py-2.5 bg-[#050810] border border-white/[0.08] rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/25 text-white placeholder-gray-500 font-mono text-xs leading-relaxed"
              rows={4}
            />
            <Button
              onClick={handleImportCsv}
              variant="secondary"
              size="sm"
              className="mt-3.5"
            >
              📥 Parse & Load Lines
            </Button>
          </div>

          <div className="pt-4 border-t border-white/[0.04] grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                <span>Evaluation Cutoff</span>
                <span className="font-mono text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  {threshold.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-violet-500 mt-2"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Batch List items */}
      {batchItems.length > 0 && (
        <Card className="border border-white/5">
          <div className="flex justify-between items-center pb-4 border-b border-white/[0.04] mb-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Loaded Queue</h3>
              <p className="text-[10px] text-gray-500">{batchItems.length} items ready for verification</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={addItem}
                variant="secondary"
                size="sm"
              >
                + Add Row
              </Button>
              <Button
                onClick={handleProcessBatch}
                disabled={isLoading}
                isLoading={isLoading}
                size="sm"
              >
                🚀 Run Queue Probe
              </Button>
            </div>
          </div>

          {/* List queue items */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {batchItems.map((item) => (
              <div key={item.id} className="border border-white/[0.05] bg-white/[0.01] rounded-lg p-3.5 space-y-3 transition-colors hover:border-white/10 relative overflow-hidden">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2.5">
                    <input
                      type="text"
                      placeholder="Prompt text..."
                      value={item.prompt}
                      onChange={(e) => updateItem(item.id, e.target.value, item.answer)}
                      className="w-full px-2.5 py-1.5 bg-[#050810] border border-white/[0.06] rounded-lg text-sm text-gray-200 placeholder-gray-500 font-mono text-xs focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      placeholder="Generated response to probe..."
                      value={item.answer}
                      onChange={(e) => updateItem(item.id, item.prompt, e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#050810] border border-white/[0.06] rounded-lg text-sm text-gray-200 placeholder-gray-500 font-mono text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 px-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-full border border-rose-500/20 active:scale-95 transition-all self-start"
                  >
                    ✕
                  </button>
                </div>

                {/* Score results card */}
                {item.result && (
                  <div className="bg-[#050810] border border-white/[0.04] p-3 rounded-lg flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-gray-300">
                        Prob: <span className="font-mono text-violet-400">{formatScore(item.result.hallucination_score)}</span>
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Confidence: {formatScore(item.result.confidence * 100, 1)}%
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 hidden sm:inline">{getScoreLabel(item.result.hallucination_score)}</span>
                      <Badge
                        variant={item.result.is_hallucination ? "danger" : "success"}
                        className="text-[10px] scale-90"
                      >
                        {item.result.is_hallucination ? "Hallucination" : "Truthful"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Export action */}
          {batchItems.some((item) => item.result) && (
            <Button
              onClick={handleExportResults}
              variant="secondary"
              size="sm"
              className="mt-4 w-full"
            >
              📥 Export Results (CSV)
            </Button>
          )}
        </Card>
      )}

      {error && <Alert variant="error" message={error} />}
    </div>
  );
}
