"use client";

import { z } from "zod";
import type { ApprovalCardProps } from "@/lib/tambo-components";

const approvalCardSchema = z.object({
  title: z.string(),
  description: z.string(),
  amount: z.number().optional(),
  status: z.enum(["pending", "approved", "rejected"]),
  actions: z.array(z.string()),
});

type ApprovalStatus = "pending" | "approved" | "rejected";

export function ApprovalCard({ title, description, amount, status, actions }: ApprovalCardProps) {
  const statusColors: Record<ApprovalStatus, string> = {
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusIcons: Record<ApprovalStatus, React.ReactNode> = {
    pending: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    approved: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    rejected: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${statusColors[status]}`}>
            {statusIcons[status]}
            <span className="capitalize">{status}</span>
          </div>
          {amount !== undefined && (
            <span className="text-2xl font-bold text-white">${amount.toFixed(2)}</span>
          )}
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 mb-6">{description}</p>

        <div className="flex gap-3">
          {actions.map((action: string, index: number) => {
            const isPrimary = action.toLowerCase().includes("approve") || action.toLowerCase().includes("confirm");
            const isDanger = action.toLowerCase().includes("reject") || action.toLowerCase().includes("deny");
            
            return (
              <button
                key={index}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isPrimary
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
                    : isDanger
                    ? "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400"
                    : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                }`}
              >
                {action}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const approvalCardConfig = {
  component: ApprovalCard,
  propsSchema: approvalCardSchema,
  name: "ApprovalCard",
};
