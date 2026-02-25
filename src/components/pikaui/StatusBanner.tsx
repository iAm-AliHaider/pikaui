"use client";

import { z } from "zod";
import type { StatusBannerProps } from "@/lib/tambo-components";

const statusBannerSchema = z.object({
  message: z.string(),
  type: z.enum(["info", "success", "warning", "error"]),
  progress: z.number().optional(),
});

type BannerType = "info" | "success" | "warning" | "error";

export function StatusBanner({ message, type, progress }: StatusBannerProps) {
  const typeStyles: Record<BannerType, { bg: string; icon: React.ReactNode; textColor: string }> = {
    info: {
      bg: "bg-blue-500/10 border-blue-500/30",
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      textColor: "text-blue-400",
    },
    success: {
      bg: "bg-emerald-500/10 border-emerald-500/30",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      textColor: "text-emerald-400",
    },
    warning: {
      bg: "bg-amber-500/10 border-amber-500/30",
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      textColor: "text-amber-400",
    },
    error: {
      bg: "bg-red-500/10 border-red-500/30",
      icon: (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      textColor: "text-red-400",
    },
  };

  const style = typeStyles[type];

  return (
    <div className={`w-full overflow-hidden rounded-2xl border backdrop-blur-xl ${style.bg}`}>
      <div className="flex items-center gap-4 p-4">
        <div className="flex-shrink-0">
          {style.icon}
        </div>
        <p className={`flex-1 text-sm font-medium ${style.textColor}`}>
          {message}
        </p>
        {progress !== undefined && (
          <div className="flex-shrink-0 w-24">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-400">Progress</span>
              <span className="text-xs font-medium text-zinc-300">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  type === "success" ? "bg-emerald-500" :
                  type === "error" ? "bg-red-500" :
                  type === "warning" ? "bg-amber-500" :
                  "bg-blue-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {progress !== undefined && (
        <div className="px-4 pb-4">
          <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                type === "success" ? "bg-emerald-500" :
                type === "error" ? "bg-red-500" :
                type === "warning" ? "bg-amber-500" :
                "bg-blue-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const statusBannerConfig = {
  component: StatusBanner,
  propsSchema: statusBannerSchema,
  name: "StatusBanner",
};
