"use client";

import React from "react";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface NavTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function NavTabs({ tabs, activeTab, onChange }: NavTabsProps) {
  return (
    <div className="flex space-x-1 border-b border-white/[0.04] overflow-x-auto scrollbar-none p-1 bg-white/[0.01] rounded-t-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-5 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap border-b-2 transition-all duration-200 rounded-t-lg flex items-center gap-2 select-none ${
              isActive
                ? "border-violet-500 text-violet-400 bg-violet-500/[0.04]"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
