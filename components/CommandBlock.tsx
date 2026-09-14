"use client";

import { useState } from "react";

export default function CommandBlock({ text, note }: { text: string; note?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="group my-3">
      <div className="relative overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 dark:border-zinc-700">
        <pre className="py-3 pl-4 pr-12 font-mono text-sm leading-relaxed text-brand-300">
          <span className="mr-2 select-none text-zinc-500">$</span>
          {text}
          <span aria-hidden className="cursor-blink ml-1 inline-block h-4 w-2 translate-y-0.5 bg-brand-400/70" />
        </pre>
        <button
          onClick={copy}
          aria-label="Salin command"
          className="absolute right-2 top-2 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 opacity-0 transition-all hover:bg-zinc-700 hover:scale-105 focus:opacity-100 group-hover:opacity-100"
        >
          {copied ? <span className="anim-pop inline-block text-brand-300">✓ tersalin</span> : "copy"}
        </button>
      </div>
      {note && <p className="mt-1 pl-1 text-xs text-zinc-500 dark:text-zinc-400">{note}</p>}
    </div>
  );
}
