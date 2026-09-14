import type { TroubleshootingItem } from "@/lib/types";
import Blocks from "./Blocks";

export default function TroubleshootingAccordion({ items }: { items: TroubleshootingItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <details key={i} className="group rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50">
            <span>{it.q}</span>
            <span aria-hidden className="shrink-0 text-zinc-400 transition-transform group-open:rotate-45">+</span>
          </summary>
          <div className="border-t border-zinc-100 px-3 dark:border-zinc-800">
            <Blocks blocks={it.a} />
          </div>
        </details>
      ))}
    </div>
  );
}
