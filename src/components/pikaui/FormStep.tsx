"use client";

import { z } from "zod";
import type { FormStepProps, formFieldSchema } from "@/lib/tambo-components";

const formStepSchema = z.object({
  title: z.string(),
  fields: z.array(z.object({
    label: z.string(),
    value: z.string(),
    type: z.enum(["text", "email", "phone", "select"]),
    filled: z.boolean(),
  })),
  step: z.number(),
  totalSteps: z.number(),
});

type FormField = z.infer<typeof formFieldSchema>;

export function FormStep({ title, fields, step, totalSteps }: FormStepProps) {
  const progress = ((step) / totalSteps) * 100;

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-zinc-400">Step {step} of {totalSteps}</span>
          <span className="text-sm font-medium text-purple-400">{Math.round(progress)}%</span>
        </div>
        
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-6">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h3 className="text-xl font-semibold text-white mb-6">{title}</h3>

        <div className="space-y-4">
          {fields.map((field: FormField, index: number) => (
            <div 
              key={index}
              className="group"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                {field.label}
              </label>
              <div className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                field.filled 
                  ? "border-emerald-500/50 bg-emerald-500/10" 
                  : "border-zinc-700 bg-zinc-800/50 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20"
              }`}>
                <input
                  type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                  value={field.value}
                  readOnly
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  className="w-full bg-transparent px-4 py-3 text-white placeholder-zinc-500 outline-none"
                />
                {field.filled && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 p-6 pt-0">
        {step > 1 && (
          <button className="flex-1 rounded-xl border border-zinc-700 bg-transparent px-4 py-3 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:border-zinc-600">
            Previous
          </button>
        )}
        <button className={`flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 text-sm font-medium text-white transition-all hover:from-purple-500 hover:to-purple-400 ${
          step === 1 ? "flex-1" : ""
        }`}>
          {step === totalSteps ? "Submit" : "Continue"}
        </button>
      </div>
    </div>
  );
}

export const formStepConfig = {
  component: FormStep,
  propsSchema: formStepSchema,
  name: "FormStep",
};
