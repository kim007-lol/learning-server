"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "model"; text: string };

function renderInline(text: string) {
  // Regex to match:
  // 1. `inline code`
  // 2. **bold**
  // 3. *italic* or _italic_
  // 4. [link](url)
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          className="mx-0.5 rounded bg-zinc-200/90 px-1.5 py-0.5 font-mono text-[12px] font-medium text-brand-700 dark:bg-zinc-700/70 dark:text-brand-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-zinc-950 dark:text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (
      (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
      (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
    ) {
      return (
        <em key={i} className="italic text-zinc-800 dark:text-zinc-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 underline hover:text-brand-700 dark:text-brand-400"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function Answer({ text }: { text: string }) {
  // Pisahkan code blocks (```lang ... ```) dan teks standar
  const codeBlockRegex = /```([\w-]*)\n([\s\S]*?)```/g;
  const blocks: { type: "code" | "text"; lang?: string; content: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    blocks.push({ type: "code", lang: match[1] || "bash", content: match[2].trimEnd() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    blocks.push({ type: "text", content: text.slice(lastIndex) });
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
      {blocks.map((block, bIdx) => {
        if (block.type === "code") {
          return (
            <div key={bIdx} className="my-2 overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-900 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/70 px-3 py-1 font-mono text-[10px] text-zinc-400">
                <span>{block.lang || "bash"}</span>
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-xs text-brand-300">
                <code>{block.content}</code>
              </pre>
            </div>
          );
        }

        const paragraphs = block.content.split(/\n\n+/);
        return (
          <div key={bIdx} className="space-y-2">
            {paragraphs.map((para, pIdx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              // Horizontal rule
              if (/^[-*_]{3,}$/.test(trimmed)) {
                return <hr key={pIdx} className="my-2 border-zinc-200 dark:border-zinc-700" />;
              }

              // Headings (#, ##, ###)
              const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
              if (headingMatch) {
                const level = headingMatch[1].length;
                const hText = headingMatch[2];
                if (level <= 2) {
                  return (
                    <div key={pIdx} className="pt-1.5 text-base font-bold text-zinc-950 dark:text-white">
                      {renderInline(hText)}
                    </div>
                  );
                }
                return (
                  <div key={pIdx} className="pt-1 font-semibold text-brand-600 dark:text-brand-400">
                    {renderInline(hText)}
                  </div>
                );
              }

              const lines = trimmed.split("\n");

              // Bullet list murni
              const isBulletList = lines.every((l) => /^\s*[-*•]\s+/.test(l));
              if (isBulletList) {
                return (
                  <ul key={pIdx} className="my-1.5 ml-4 list-disc space-y-1">
                    {lines.map((l, lIdx) => (
                      <li key={lIdx} className="leading-snug">
                        {renderInline(l.replace(/^\s*[-*•]\s+/, ""))}
                      </li>
                    ))}
                  </ul>
                );
              }

              // Numbered list murni
              const isNumberedList = lines.every((l) => /^\s*\d+\.\s+/.test(l));
              if (isNumberedList) {
                return (
                  <ol key={pIdx} className="my-1.5 ml-4 list-decimal space-y-1">
                    {lines.map((l, lIdx) => (
                      <li key={lIdx} className="leading-snug">
                        {renderInline(l.replace(/^\s*\d+\.\s+/, ""))}
                      </li>
                    ))}
                  </ol>
                );
              }

              // Campuran baris dan bullet
              const hasListItems = lines.some((l) => /^\s*[-*•]\s+/.test(l) || /^\s*\d+\.\s+/.test(l));
              if (hasListItems) {
                return (
                  <div key={pIdx} className="space-y-1">
                    {lines.map((l, lIdx) => {
                      if (/^\s*[-*•]\s+/.test(l)) {
                        return (
                          <div key={lIdx} className="flex items-start gap-2 pl-1.5">
                            <span className="font-bold text-brand-500">•</span>
                            <span className="flex-1 leading-snug">{renderInline(l.replace(/^\s*[-*•]\s+/, ""))}</span>
                          </div>
                        );
                      }
                      const numMatch = l.match(/^\s*(\d+)\.\s+(.*)$/);
                      if (numMatch) {
                        return (
                          <div key={lIdx} className="flex items-start gap-2 pl-1.5">
                            <span className="font-semibold text-brand-500">{numMatch[1]}.</span>
                            <span className="flex-1 leading-snug">{renderInline(numMatch[2])}</span>
                          </div>
                        );
                      }
                      return <p key={lIdx} className="leading-relaxed">{renderInline(l)}</p>;
                    })}
                  </div>
                );
              }

              // Paragraf biasa dengan line breaks
              return (
                <p key={pIdx} className="leading-relaxed">
                  {lines.map((l, lIdx) => (
                    <span key={lIdx}>
                      {renderInline(l)}
                      {lIdx < lines.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function ChatWidget({ stepSlug, stepTitle }: { stepSlug?: string; stepTitle?: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // riwayat per step, tahan reload
  useEffect(() => {
    if (!stepSlug) return;
    try {
      setMsgs(JSON.parse(localStorage.getItem(`sj-chat-${stepSlug}`) ?? "[]"));
    } catch {
      setMsgs([]);
    }
  }, [stepSlug]);
  useEffect(() => {
    if (stepSlug) localStorage.setItem(`sj-chat-${stepSlug}`, JSON.stringify(msgs));
  }, [msgs, stepSlug]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open, busy]);

  const send = useCallback(
    async (question: string) => {
      if (!question.trim() || busy) return;
      const next: Msg[] = [...msgs, { role: "user", text: question.trim() }];
      setMsgs(next);
      setInput("");
      setBusy(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ slug: stepSlug, messages: next }),
        });
        const data = await res.json();
        if (data.reply) {
          setMsgs([...next, { role: "model", text: data.reply }]);
        } else if (res.status === 402 || String(data.error).includes("402") || String(data.error).toLowerCase().includes("depleted") || String(data.error).toLowerCase().includes("credit")) {
          setMsgs([...next, { role: "model", text: "Saldo kredit Gemini API pada akun Google ini telah habis (HTTP 402: Prepayment credits depleted). Silakan isi billing di Google AI Studio (ai.studio/projects) atau gunakan API key baru di .env.local." }]);
        } else if (res.status === 500 && String(data.error).includes("GEMINI_API_KEY")) {
          setMsgs([...next, { role: "model", text: "GEMINI_API_KEY belum terkonfigurasi di file .env.local. Silakan isi API key terlebih dahulu lalu restart server Next.js agar asisten DevOps aktif." }]);
        } else {
          setMsgs([...next, { role: "model", text: `Gagal memproses pesan (${data.error || "Server AI sedang sibuk"}). Coba beberapa saat lagi.` }]);
        }
      } catch {
        setMsgs([...next, { role: "model", text: "Gagal terhubung ke endpoint server AI. Pastikan GEMINI_API_KEY sudah valid di .env.local dan koneksi internet aktif." }]);
      } finally {
        setBusy(false);
      }
    },
    [msgs, busy, stepSlug]
  );

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Tanya asisten DevOps Server Journey"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? "×" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[70vh] max-h-[560px] w-[min(92vw,420px)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-brand-600 px-4 py-3 text-white dark:border-zinc-800">
            <div>
              <p className="text-sm font-semibold">🛠️ Mentor DevOps</p>
              {stepTitle && <p className="text-xs opacity-80">Konteks: {stepTitle}</p>}
            </div>
            <button onClick={() => setOpen(false)} aria-label="Tutup chat" className="text-lg">✕</button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.length === 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Halo! Saya mentor DevOps kamu di Server Journey. Tanyakan apa saja seputar Linux, jaringan (LAN/Tailscale), SSH, firewall, Nginx, deploy, hingga CI/CD. Saya sudah memegang konteks materi yang sedang kamu buka — langsung tanyakan kendala atau hal yang membingungkanmu!
              </p>
            )}
            {msgs.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2.5 text-white shadow-sm"
                    : "mr-auto max-w-[92%] rounded-2xl rounded-bl-sm border border-zinc-200/80 bg-zinc-50 px-3.5 py-2.5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-800"
                }
              >
                {m.role === "model" ? <Answer text={m.text} /> : <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>}
              </div>
            ))}
            {busy && <p className="animate-pulse text-sm text-zinc-400">menganalisis kendala sistem... ⚙️</p>}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Tanyakan masalah teknis, command, SSH, Tailscale... 💬"
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <button onClick={() => send(input)} disabled={busy || !input.trim()} className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
              Kirim
            </button>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="border-t border-zinc-100 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
          >
            Siap, lanjut eksplorasi! 🚀
          </button>
        </div>
      )}
    </>
  );
}
