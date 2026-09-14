"use client";

import Link from "next/link";
import { parts } from "@/data";
import { useProgress } from "@/lib/progress";

export default function ProgressStepper({ currentSlug }: { currentSlug?: string }) {
  const { allDone } = useProgress();
  return (
    <nav aria-label="Roadmap langkah" className="space-y-4 text-sm">
      {parts.map((p) => (
        <div key={p.id}>
          <p className="mb-1 font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {p.title.split("—")[0].trim()}
          </p>
          <ol className="space-y-0.5">
            {p.steps.map((s) => {
              const total = s.checklist.length;
              const done = s.requireChecklist === false ? false : allDone(s.slug, total);
              const active = s.slug === currentSlug;
              return (
                <li key={s.slug}>
                  <Link
                    href={`/steps/${s.slug}`}
                    className={`flex items-center gap-2 rounded-md px-2 py-1 transition-colors ${
                      active
                        ? "bg-brand-100 font-medium text-brand-800 dark:bg-brand-900/50 dark:text-brand-200"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] transition-all duration-300 ${
                        done ? "anim-pop bg-brand-500 text-white" : "border border-zinc-300 dark:border-zinc-600"
                      }`}
                    >
                      {done ? "✓" : ""}
                    </span>
                    <span className="truncate">{s.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </nav>
  );
}
