import { notFound } from "next/navigation";
import { flatSteps, getStep } from "@/data";
import Blocks from "@/components/Blocks";
import Checklist from "@/components/Checklist";
import TroubleshootingAccordion from "@/components/TroubleshootingAccordion";
import VariantTabs from "@/components/VariantTabs";
import StepNav from "@/components/StepNav";
import ChatWidget from "@/components/ChatWidget";
import StepSidebar from "@/components/StepSidebar";

export function generateStaticParams() {
  return flatSteps.map((s) => ({ slug: s.slug }));
}

export default async function StepPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const step = getStep(slug);
  if (!step) notFound();

  const idx = flatSteps.findIndex((s) => s.slug === slug);
  const prev = idx > 0 ? flatSteps[idx - 1] : undefined;
  const next = idx < flatSteps.length - 1 ? flatSteps[idx + 1] : undefined;
  const requireChecklist = step.requireChecklist !== false;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ChatWidget stepSlug={step.slug} stepTitle={`Langkah ${step.number}: ${step.title}`} />
      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <StepSidebar slug={step.slug} />
          </div>
        </aside>
        <article key={step.slug} className="anim-fade-up mx-auto w-full max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {step.partTitle} · Langkah {step.number} dari {step.total}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{step.title}</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">{step.summary}</p>

          <Blocks blocks={step.content} />

          {step.variants && <VariantTabs slug={step.slug} variants={step.variants} />}

          {step.checklist.length > 0 && (
            <section className="mt-10 rounded-xl border border-brand-200 bg-brand-50/50 p-5 dark:border-brand-900 dark:bg-brand-950/20">
              <h2 className="text-base font-semibold text-brand-800 dark:text-brand-300">
                ✓ Tanda berhasil — centang kalau sudah kamu lihat/buktikan sendiri
              </h2>
              <div className="mt-3">
                <Checklist slug={step.slug} items={step.checklist} />
              </div>
              {requireChecklist && (
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  Tombol “lanjut” terbuka setelah semua tercentang — bukan hukuman, tapi jaring pengaman:
                  pastikan step ini benar-benar beres sebelum menumpuk step berikutnya di atasnya.
                </p>
              )}
            </section>
          )}

          {step.troubleshooting && step.troubleshooting.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Lagi bermasalah?</h2>
              <TroubleshootingAccordion items={step.troubleshooting} />
            </section>
          )}

          {step.references && step.references.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Baca lebih lanjut</h2>
              <ul className="space-y-1 text-sm">
                {step.references.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-400">
                      {r.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <StepNav
            slug={step.slug}
            requireChecklist={requireChecklist}
            checklistCount={step.checklist.length}
            prev={prev && { slug: prev.slug, title: prev.title }}
            next={next && { slug: next.slug, title: next.title }}
          />
        </article>
      </div>
    </div>
  );
}
