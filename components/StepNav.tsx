"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";

export default function StepNav({
  slug,
  requireChecklist,
  checklistCount,
  prev,
  next,
}: {
  slug: string;
  requireChecklist: boolean;
  checklistCount: number;
  prev?: { slug: string; title: string };
  next?: { slug: string; title: string };
}) {
  const { allDone } = useProgress();
  const unlocked = !requireChecklist || allDone(slug, checklistCount);
  return (
    <div className="mt-10 flex items-center justify-between gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      {prev ? (
        <Link href={`/steps/${prev.slug}`} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
          ← {prev.title}
        </Link>
      ) : (
        <Link href="/" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
          ← Beranda
        </Link>
      )}
      {next ? (
        unlocked ? (
          <Link href={`/steps/${next.slug}`} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-brand-700">
            Lanjut: {next.title} →
          </Link>
        ) : (
          <span
            title="Centang semua checklist 'tanda berhasil' dulu untuk membuka langkah berikutnya"
            className="cursor-not-allowed rounded-lg bg-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
          >
            🔒 Lanjut (checklist dulu)
          </span>
        )
      ) : (
        <Link href="/" className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Selesai! 🎉
        </Link>
      )}
    </div>
  );
}
