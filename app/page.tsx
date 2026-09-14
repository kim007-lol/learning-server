"use client";

import Link from "next/link";
import { parts, flatSteps } from "@/data";
import { useProgress } from "@/lib/progress";

const partIcon = ["🧠", "🖥", "🔌", "🔑", "🛡", "🚀", "🌐", "🗺"];

export default function Landing() {
  const { doneCount, ready } = useProgress();
  const done = ready ? doneCount(flatSteps.map((s) => ({ slug: s.slug, checks: s.checklist.length }))) : 0;
  const pct = Math.round((done / flatSteps.length) * 100);
  const nextStep = flatSteps[Math.min(done, flatSteps.length - 1)];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="text-center">
        <p className="mb-3 inline-block rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
          Gratis · tanpa login · progres tersimpan di browser-mu
        </p>
        <h1 className="anim-fade-up text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100">
          <span aria-hidden className="anim-float mr-2 inline-block">🚀</span>Server Journey
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Dari “apa sih server itu?” sampai <strong>aplikasimu online dengan domain sendiri</strong> —
          lewat VirtualBox + Xubuntu, tanpa perlu beli server apa pun. Setiap langkah menjelaskan
          <em> kenapa</em>, bukan cuma command untuk di-copy.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href={`/steps/${nextStep.slug}`}
            className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-brand-700"
          >
            {done === 0 ? "Mulai perjalanan →" : "Lanjutkan →"}
          </Link>
        </div>
        {done > 0 && (
          <div className="mx-auto mt-6 max-w-sm">
            <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-xs text-zinc-500">{done} dari {flatSteps.length} langkah selesai ({pct}%)</p>
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Peta perjalanan</h2>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">Delapan bagian, {flatSteps.length} langkah. Klik bagian mana pun untuk melompat.</p>
        <ol className="relative space-y-3 border-l-2 border-dashed border-zinc-200 pl-6 dark:border-zinc-800">
          {parts.map((p, i) => {
            const firstSlug = p.steps[0].slug;
            return (
              <li key={p.id} className="relative">
                <span className="absolute -left-[33px] top-3 flex h-4 w-4 items-center justify-center rounded-full border-2 border-brand-500 bg-white dark:bg-zinc-950" />
                <Link
                  href={`/steps/${firstSlug}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700"
                >
                  <div className="flex items-start gap-3">
                    <span aria-hidden className="text-2xl">{partIcon[i] ?? "•"}</span>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{p.title}</p>
                      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{p.desc}</p>
                      <p className="mt-1 text-xs font-medium text-brand-600 dark:text-brand-400">{p.steps.length} langkah</p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-14 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Yang kamu butuhkan</h2>
        <ul className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2 dark:text-zinc-400">
          <li>• Laptop dengan <strong>VirtualBox</strong> terpasang</li>
          <li>• ISO / VM <strong>Xubuntu</strong> (sudah ada? sempurna)</li>
          <li>• Koneksi internet</li>
          <li>• Akun Cloudflare gratis (nanti di Bagian 6)</li>
        </ul>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Bonus: setiap halaman punya chatbot pendamping yang membaca materi step-mu — macet tengah malam?
          Tanya, jangan Google 40 tab.
        </p>
      </section>
    </div>
  );
}
