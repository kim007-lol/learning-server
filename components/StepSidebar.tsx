"use client";

import { flatSteps } from "@/data";
import { useProgress } from "@/lib/progress";
import { useEffect, useState } from "react";
import ProgressStepper from "./ProgressStepper";

const CHEERS: Record<number, string> = {
  25: "Perempat jalan! Kalau kamu sampai sini, kamu sudah lewat fase paling membingungkan. ",
  50: "Setengah! Separuh konsep server dunia sudah ada di kepalamu. Keren. 🚀",
  75: "Tiga perempat — tinggal sedikit lagi kamu bisa bilang 'aku ngerti server'. 💪",
  100: "100% — SELURUHNYA BERES! Perjalanan dari nol sampai server online baru saja kamu taklukkan. ",
};

export default function StepSidebar({ slug }: { slug: string }) {
  const { ready, doneCount } = useProgress();
  const step = flatSteps.find((s) => s.slug === slug)!;
  const done = ready ? doneCount(flatSteps.map((s) => ({ slug: s.slug, checks: s.checklist.length }))) : 0;
  const pct = Math.round((done / flatSteps.length) * 100);

  // pesan milestone: muncul saat pct baru saja melewati angka milestone (naik, bukan saat load)
  const [cheer, setCheer] = useState<string | null>(null);
  const [lastPct, setLastPct] = useState(pct);
  useEffect(() => {
    for (const m of [25, 50, 75, 100]) {
      if (lastPct < m && pct >= m) {
        setCheer(CHEERS[m]);
        const t = setTimeout(() => setCheer(null), 8000);
        setLastPct(pct);
        return () => clearTimeout(t);
      }
    }
    setLastPct(pct);
  }, [pct, lastPct]);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <span>Step {step.number} dari {step.total}</span>
        <span>{pct}%</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      {cheer && (
        <div className="mb-4 animate-pulse rounded-lg border border-brand-300 bg-brand-50 p-2.5 text-xs font-medium leading-relaxed text-brand-800 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
          {cheer}
        </div>
      )}
      <ProgressStepper currentSlug={slug} />
    </div>
  );
}
