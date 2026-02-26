"use client";

interface StatusBannerProps {
  message: string;
  type: "info" | "success" | "warning" | "error";
  progress?: number | null;
}

const STYLES = {
  info: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", bar: "from-blue-500 to-blue-400" },
  success: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", bar: "from-emerald-500 to-emerald-400" },
  warning: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20", bar: "from-yellow-500 to-yellow-400" },
  error: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", bar: "from-red-500 to-red-400" },
};

const ICONS = {
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
};

export function StatusBanner({ message, type, progress }: StatusBannerProps) {
  const s = STYLES[type] || STYLES.info;
  const icon = ICONS[type] || ICONS.info;

  return (
    <div className="p-3">
      <div className={`flex items-center gap-2.5 ${s.text}`}>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
      {progress != null && progress >= 0 && (
        <div className="mt-2.5 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${s.bar} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
