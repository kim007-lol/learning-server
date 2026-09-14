"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("sj-dark");
    const init = stored ? stored === "1" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(init);
    document.documentElement.classList.toggle("dark", init);
  }, []);

  return (
    <button
      onClick={() => {
        setDark((d) => {
          const next = !d;
          document.documentElement.classList.toggle("dark", next);
          localStorage.setItem("sj-dark", next ? "1" : "0");
          return next;
        });
      }}
      aria-label="Ganti mode gelap/terang"
      className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      {dark === null ? "·" : dark ? "☀" : "🌙"}
    </button>
  );
}
