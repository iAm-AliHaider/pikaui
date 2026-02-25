"use client";

import { z } from "zod";
import type { ProductCardProps } from "@/lib/tambo-components";

const productCardSchema = z.object({
  name: z.string(),
  price: z.number(),
  image: z.string().url(),
  description: z.string(),
  color: z.string().optional(),
  inStock: z.boolean(),
});

export function ProductCard({ name, price, image, description, color, inStock }: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
      <div className="aspect-square overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {color && (
          <div className="absolute top-3 left-3 rounded-full bg-purple-600/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {color}
          </div>
        )}
        <div className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
          inStock 
            ? "bg-emerald-600/90 text-white" 
            : "bg-red-600/90 text-white"
        }`}>
          {inStock ? "In Stock" : "Out of Stock"}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-1 truncate">{name}</h3>
        <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-cyan-400">${price.toFixed(2)}</span>
          <button className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-500 hover:scale-105 active:scale-95">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export const productCardConfig = {
  component: ProductCard,
  propsSchema: productCardSchema,
  name: "ProductCard",
};
