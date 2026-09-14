"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "model"; text: string };

// render jawaban model sangat sederhana: code block ```...``` + baris
function Answer({ text }: { text: string }) {
  const parts = text.split(/```/);
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="overflow-x-auto rounded-md bg-zinc-800 p-2 font-mono text-xs text-brand-300">{p.replace(/^\w+\n/, "")}</pre>
        ) : (
          <div key={i} className="whitespace-pre-wrap">
            {p.split(/(\*\*[^*]+\*\*)/g).map((s, j) =>
              s.startsWith("**") && s.endsWith("**") ? <strong key={j}>{s.slice(2, -2)}</strong> : <span key={j}>{s}</span>
            )}
          </div>
        )
      )}
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
        if (data.reply) setMsgs([...next, { role: "model", text: data.reply }]);
        else if (res.status === 500 && String(data.error).includes("GEMINI_API_KEY"))
          setMsgs([...next, { role: "model", text: "API key belum diisi — minta pemilik web mengisi GEMINI_API_KEY di file .env.local lalu restart servernya." }]);
        else setMsgs([...next, { role: "model", text: "Hmm, server AI-nya sedang sibuk atau tidak merespons. Tunggu sebentar lalu kirim ulang pertanyaanmu ya." }]);
      } catch {
        setMsgs([...next, { role: "model", text: "Tidak bisa menghubungi server. Pastikan GEMINI_API_KEY sudah diisi di .env.local." }]);
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
        aria-label="Tanya asisten Server Journey"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? "×" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[70vh] max-h-[560px] w-[min(92vw,420px)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-brand-600 px-4 py-3 text-white dark:border-zinc-800">
            <div>
              <p className="text-sm font-semibold">Tanya Si Penjaga Server</p>
              {stepTitle && <p className="text-xs opacity-80">Konteks: {stepTitle}</p>}
            </div>
            <button onClick={() => setOpen(false)} aria-label="Tutup chat" className="text-lg">✕</button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Halo! Tanya apa saja soal step ini — server, Linux, jaringan, deploy. Aku sudah membaca materi
                yang sedang kamu buka.
              </p>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-brand-100 px-3 py-2 dark:bg-brand-900/50" : "mr-auto max-w-[85%] rounded-xl rounded-bl-sm bg-zinc-100 px-3 py-2 dark:bg-zinc-800"}>
                {m.role === "model" ? <Answer text={m.text} /> : <p className="whitespace-pre-wrap text-sm">{m.text}</p>}
              </div>
            ))}
            {busy && <p className="animate-pulse text-sm text-zinc-400">mengetik…</p>}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Tanya tentang step ini…"
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
            Saya paham, lanjut →
          </button>
        </div>
      )}
    </>
  );
}
