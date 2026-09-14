import type { Part, FlatStep } from "@/lib/types";
import { part0 } from "./part0";
import { part1 } from "./part1";
import { part2 } from "./part2";
import { part3 } from "./part3";
import { part4 } from "./part4";
import { part5ConceptSteps, part5TailSteps } from "./part5-steps";
import { deployStep } from "./part5-deploy";
import { part6 } from "./part6";
import { part7 } from "./part7";

const part5: Part = {
  id: 5,
  title: "Bagian 5 — Deploy Aplikasi Web",
  desc: "Konsep umum untuk semua stack dulu, baru cabang per bahasa. Pahami polanya, command jadi mudah.",
  steps: [...part5ConceptSteps, deployStep, ...part5TailSteps],
};

export const parts: Part[] = [part0, part1, part2, part3, part4, part5, part6, part7];

export const flatSteps: FlatStep[] = parts.flatMap((p) =>
  p.steps.map((s) => ({
    ...s,
    partId: p.id,
    partTitle: p.title,
    number: 0,
    total: 0,
  }))
);
flatSteps.forEach((s, i) => {
  s.number = i + 1;
  s.total = flatSteps.length;
});

export const totalSteps = flatSteps.length;

export function getStep(slug: string): FlatStep | undefined {
  return flatSteps.find((s) => s.slug === slug);
}

export function getStepByNumber(n: number): FlatStep | undefined {
  return flatSteps[n - 1];
}

// ringkasan teks untuk konteks chatbot (semua blok jadi paragraf polos)
export function stepToPlainText(step: FlatStep): string {
  const lines: string[] = [];
  const walk = (blocks: typeof step.content) => {
    for (const b of blocks) {
      switch (b.t) {
        case "h": lines.push(`## ${b.text}`); break;
        case "p": lines.push(b.text); break;
        case "ul": lines.push(b.items.map((i) => `- ${i}`).join("\n")); break;
        case "ol": lines.push(b.items.map((i, n) => `${n + 1}. ${i}`).join("\n")); break;
        case "cmd": lines.push(`$ ${b.text}${b.note ? `   // ${b.note}` : ""}`); break;
        case "file": lines.push(`FILE ${b.name}:\n${b.text}`); break;
        case "callout": lines.push(b.text); break;
        case "table": lines.push([b.headers.join(" | "), ...b.rows.map((r) => r.join(" | "))].join("\n")); break;
        case "diagram": lines.push(`(diagram: ${b.caption ?? b.key})`); break;
      }
    }
  };
  lines.push(`# Langkah ${step.number}: ${step.title}`);
  lines.push(step.summary);
  walk(step.content);
  step.variants?.forEach((v) => {
    lines.push(`## Varian stack: ${v.label} — ${v.desc}`);
    walk(v.content);
  });
  if (step.checklist.length) lines.push("Checklist keberhasilan: " + step.checklist.join("; "));
  step.troubleshooting?.forEach((t) => {
    lines.push(`T: ${t.q}`);
    walk(t.a);
  });
  return lines.join("\n\n");
}
