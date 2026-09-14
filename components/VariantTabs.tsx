"use client";

import { useProgress } from "@/lib/progress";
import type { StackVariant } from "@/lib/types";
import Blocks from "./Blocks";

export default function VariantTabs({ slug, variants }: { slug: string; variants: StackVariant[] }) {
  const { getVariant, setVariant } = useProgress();
  const active = variants.find((v) => v.id === getVariant(slug)) ?? variants[0];
  return (
    <div className="mt-6">
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {variants.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={v.id === active.id}
            onClick={() => setVariant(slug, v.id)}
            className={`-mb-px rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              v.id === active.id
                ? "border-brand-500 bg-white text-brand-700 dark:bg-zinc-900 dark:text-brand-300"
                : "border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm italic text-zinc-500 dark:text-zinc-400">{active.desc}</p>
      <Blocks blocks={active.content} />
    </div>
  );
}
