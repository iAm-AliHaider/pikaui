"use client";

import { useEffect, useState, useRef } from "react";
import { ProductCard } from "./pikaui/ProductCard";
import { FormStep } from "./pikaui/FormStep";
import { ApprovalCard } from "./pikaui/ApprovalCard";
import { DataChart } from "./pikaui/DataChart";
import { StatusBanner } from "./pikaui/StatusBanner";
import type { ProductCardProps, FormStepProps, ApprovalCardProps, DataChartProps, StatusBannerProps } from "@/lib/tambo-components";

interface ComponentItem {
  id: string;
  component: string;
  props: Record<string, unknown>;
}

interface GenerativePanelProps {
  components: ComponentItem[];
  onClear?: () => void;
}

const componentMap: Record<string, React.ComponentType<any>> = {
  ProductCard,
  FormStep,
  ApprovalCard,
  DataChart,
  StatusBanner,
};

export function GenerativePanel({ components, onClear }: GenerativePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (components.length > 0) {
      const latestId = components[components.length - 1].id;
      if (!animatedIds.has(latestId)) {
        setAnimatedIds(prev => new Set(prev).add(latestId));
      }
    }
  }, [components, animatedIds]);

  const renderComponent = (item: ComponentItem) => {
    const Component = componentMap[item.component];
    if (!Component) {
      return (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          Unknown component: {item.component}
        </div>
      );
    }

    return <Component {...item.props} />;
  };

  return (
    <div className="h-full flex flex-col">
      {components.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-sm font-medium text-zinc-400">
            {components.length} component{components.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={onClear}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {components.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Ready for Voice Commands</h3>
            <p className="text-sm text-zinc-400 max-w-xs">
              Click the microphone and speak to see dynamic UI components appear here in real-time.
            </p>
            <div className="mt-8 flex flex-col gap-3 text-left">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-purple-400">1</span>
                </div>
                <span className="text-zinc-400">Say "Show me products under $100"</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-purple-400">2</span>
                </div>
                <span className="text-zinc-400">Or "Fill in my name as Ali"</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-purple-400">3</span>
                </div>
                <span className="text-zinc-400">Try "Show me a chart"</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {components.map((item, index) => (
              <div
                key={item.id}
                className={`transition-all duration-500 ${
                  animatedIds.has(item.id)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {renderComponent(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
