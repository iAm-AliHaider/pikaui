"use client";

import { useEffect, useRef } from "react";
import { ProductCard } from "./pikaui/ProductCard";
import { FormStep } from "./pikaui/FormStep";
import { ApprovalCard } from "./pikaui/ApprovalCard";
import { DataChart } from "./pikaui/DataChart";
import { StatusBanner } from "./pikaui/StatusBanner";

interface ComponentItem {
  id: string;
  component: string;
  props: Record<string, unknown>;
}

interface GenerativePanelProps {
  components: ComponentItem[];
  onClear: () => void;
}

const COMPONENT_MAP: Record<string, React.ComponentType<Record<string, unknown>>> = {
  ProductCard: ProductCard as unknown as React.ComponentType<Record<string, unknown>>,
  FormStep: FormStep as unknown as React.ComponentType<Record<string, unknown>>,
  ApprovalCard: ApprovalCard as unknown as React.ComponentType<Record<string, unknown>>,
  DataChart: DataChart as unknown as React.ComponentType<Record<string, unknown>>,
  StatusBanner: StatusBanner as unknown as React.ComponentType<Record<string, unknown>>,
};

export function GenerativePanel({ components, onClear }: GenerativePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && components.length > 0) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [components.length]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-medium text-zinc-400">Live UI</h2>
        {components.length > 0 && (
          <button onClick={onClear} className="text-xs text-zinc-500 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/10">
            Clear all
          </button>
        )}
      </div>

      {/* Widgets Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {components.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-500/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <p className="text-zinc-500 text-sm">Speak to see the magic</p>
            <p className="text-zinc-600 text-xs mt-1">Try: &ldquo;Show me a product&rdquo;</p>
          </div>
        ) : (
          components.map((item, index) => {
            const Component = COMPONENT_MAP[item.component];
            if (!Component) return null;
            return (
              <div
                key={item.id}
                className="animate-in slide-in-from-bottom-4 fade-in duration-500"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
              >
                <div className="rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10 overflow-hidden shadow-lg shadow-black/20">
                  <Component {...item.props} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
