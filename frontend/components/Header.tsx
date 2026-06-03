"use client";

import React from "react";
import { Card } from "@/components/ui";

export default function Header() {
  return (
    <Card className="relative border-b-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-violet-500/10 before:to-fuchsia-500/10 before:pointer-events-none before:z-0">
      <div className="relative z-10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent select-none">
              HalluProbe
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base max-w-2xl leading-relaxed font-normal">
              Domain-Invariant Hallucination Detection for Large Language Models. 
              Analyze and probe hidden states to intercept hallucinated responses in real-time.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 md:self-start">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-violet-500/10 border border-violet-500/30 text-violet-300 px-2.5 py-1 rounded-full">
              🧬 Hidden-State Probing
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 px-2.5 py-1 rounded-full">
              🛡️ Adversarial Training
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-gray-400 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="text-violet-400 text-sm">🎯</span>
            <span>Domain-invariant detection optimized across <b>Medical, Legal, Biography, and General</b> datasets.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-fuchsia-400 text-sm">🧠</span>
            <span>Deep alignment optimization utilizing contrastive representation learning techniques.</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
