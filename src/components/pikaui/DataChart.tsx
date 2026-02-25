"use client";

import { z } from "zod";
import type { DataChartProps, dataChartDataPointSchema } from "@/lib/tambo-components";

const dataChartSchema = z.object({
  title: z.string(),
  data: z.array(z.object({
    name: z.string(),
    value: z.number(),
  })),
  type: z.enum(["bar", "line", "pie"]),
});

type DataPoint = z.infer<typeof dataChartDataPointSchema>;

export function DataChart({ title, data, type }: DataChartProps) {
  const maxValue = Math.max(...data.map((d: DataPoint) => d.value));
  const total = data.reduce((sum: number, d: DataPoint) => sum + d.value, 0);

  const colors = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

  const renderBarChart = () => (
    <div className="flex items-end justify-between gap-3 h-48 px-2">
      {data.map((item: DataPoint, index: number) => {
        const height = (item.value / maxValue) * 100;
        return (
          <div key={index} className="flex flex-col items-center flex-1 gap-2">
            <div 
              className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
              style={{ 
                height: `${height}%`, 
                background: `linear-gradient(to top, ${colors[index % colors.length]}, ${colors[index % colors.length]}88)`,
              }}
            />
            <span className="text-xs text-zinc-500 truncate max-w-full">{item.name}</span>
          </div>
        );
      })}
    </div>
  );

  const renderLineChart = () => {
    const points = data.map((item: DataPoint, index: number) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / maxValue) * 100;
      return `${x},${y}`;
    }).join(" ");
    
    const areaPoints = `0,100 ${points} 100,100`;

    return (
      <div className="relative h-48">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#areaGradient)" />
          <polyline
            points={points}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          {data.map((item: DataPoint, index: number) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (item.value / maxValue) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="#8B5CF6"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
          {data.map((item: DataPoint, index: number) => (
            <span key={index} className="text-xs text-zinc-500 truncate max-w-full">{item.name}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    let currentAngle = 0;
    const slices = data.map((item: DataPoint, index: number) => {
      const percentage = item.value / total;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (startAngle + angle - 90) * (Math.PI / 180);
      
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);
      
      const largeArc = angle > 180 ? 1 : 0;
      
      const pathD = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      return {
        path: pathD,
        color: colors[index % colors.length],
        name: item.name,
        value: item.value,
        percentage: Math.round(percentage * 100),
      };
    });

    return (
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="w-40 h-40">
          {slices.map((slice, index: number) => (
            <path
              key={index}
              d={slice.path}
              fill={slice.color}
              className="transition-all duration-300 hover:opacity-80"
            />
          ))}
        </svg>
        <div className="space-y-2">
          {data.map((item: DataPoint, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-xs text-zinc-400">{item.name}</span>
              <span className="text-xs font-medium text-zinc-200">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      {type === "bar" && renderBarChart()}
      {type === "line" && renderLineChart()}
      {type === "pie" && renderPieChart()}

      {type !== "pie" && (
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
          {data.map((item: DataPoint, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-xs text-zinc-400 truncate">{item.name}</span>
              <span className="text-xs font-medium text-zinc-200 ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const dataChartConfig = {
  component: DataChart,
  propsSchema: dataChartSchema,
  name: "DataChart",
};
