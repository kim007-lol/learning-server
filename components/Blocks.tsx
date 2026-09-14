"use client";

import type { Block } from "@/lib/types";
import Inline from "./Inline";
import CommandBlock from "./CommandBlock";
import Diagram from "./Diagram";
import { useState } from "react";

function FileBlock({ name, text, note }: { name: string; text: string; note?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group my-3">
      <div className="relative overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-1.5 dark:border-zinc-800">
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{name}</span>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {}
            }}
            className="rounded-md px-2 py-0.5 text-xs text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-200 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-zinc-800"
          >
            {copied ? "✓ tersalin" : "copy"}
          </button>
        </div>
        <pre className="px-4 py-3 font-mono text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200">{text}</pre>
      </div>
      {note && <p className="mt-1 pl-1 text-xs text-zinc-500 dark:text-zinc-400">{note}</p>}
    </div>
  );
}

const calloutStyle = {
  info: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200",
  warn: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  tip: "border-brand-300 bg-brand-50 text-brand-900 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-200",
};
const calloutIcon = { info: "ℹ", warn: "⚠", tip: "★" };

export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="step-content">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h": return <h3 key={i}>{b.text}</h3>;
          case "p": return <p key={i}><Inline text={b.text} /></p>;
          case "ul": return <ul key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ul>;
          case "ol": return <ol key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}</ol>;
          case "cmd": return <CommandBlock key={i} text={b.text} note={b.note} />;
          case "file": return <FileBlock key={i} name={b.name} text={b.text} note={b.note} />;
          case "callout": {
            const k = b.kind ?? "info";
            return (
              <div key={i} className={`my-4 flex gap-3 rounded-lg border p-3 text-sm ${calloutStyle[k]}`}>
                <span aria-hidden className="mt-0.5 shrink-0 font-bold">{calloutIcon[k]}</span>
                <span><Inline text={b.text} /></span>
              </div>
            );
          }
          case "table":
            return (
              <div key={i} className="my-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-100 dark:bg-zinc-900">
                    <tr>{b.headers.map((hd, j) => <th key={j} className="px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200">{hd}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-t border-zinc-200 dark:border-zinc-800">
                        {r.map((c, k) => <td key={k} className="px-3 py-2 align-top text-zinc-600 dark:text-zinc-400"><Inline text={c} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "diagram": return <Diagram key={i} diagKey={b.key} caption={b.caption} />;
        }
      })}
    </div>
  );
}
