"use client";

import { useProgress } from "@/lib/progress";
import Inline from "./Inline";
import Confetti from "./Confetti";

export default function Checklist({ slug, items }: { slug: string; items: string[] }) {
  const { isDone, toggle } = useProgress();
  const doneAll = items.length > 0 && items.every((_, i) => isDone(slug, i));
  // affirmation tetap per step (hash slug) supaya tidak terasa acak gantian tiap render
  const AFFIRMATIONS = [
    "Mantap! Step ini beres — satu lagi rasa percaya diri berhasil kamu kumpulkan. 💪",
    "Keren! Dulu ini terasa mustahil, sekarang sudah jadi kebiasaanmu. 🔥",
    "Nah gitu! Setiap centang berarti kamu sedang jadi orang yang bisa pegang server. ⚡",
    "Bagus sekali! Otakmu baru saja memasang satu blok penting di peta besar ini. 🧱",
    "Yeay! Progres nyata > baca teori seharian. Kamu jelas pilih yang pertama. 🎯",
    "Kerja bagus! Pemula berhenti di sini, kamu tidak. Itu yang membedakan. 🌟",
  ];
  const cheer = AFFIRMATIONS[slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AFFIRMATIONS.length];
  return (
    <ul className="space-y-2">
      {items.map((it, i) => {
        const done = isDone(slug, i);
        return (
          <li key={i}>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                done
                  ? "border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-900/30"
                  : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              }`}
            >
              <input
                type="checkbox"
                checked={done}
                onChange={() => toggle(slug, i)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
              />
              <span className={`text-sm ${done ? "text-brand-800 line-through decoration-brand-500/50 dark:text-brand-300" : ""}`}>
                <Inline text={it} />
              </span>
            </label>
          </li>
        );
      })}
      {doneAll && (
        <li className="anim-pop relative rounded-lg border border-brand-300 bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-800 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
          <Confetti />
          🎉 {cheer}
        </li>
      )}
    </ul>
  );
}
