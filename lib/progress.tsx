"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Checks = Record<string, number[]>; // slug -> index checklist yang dicentang

interface ProgressApi {
  ready: boolean;
  isDone: (slug: string, i: number) => boolean;
  toggle: (slug: string, i: number) => void;
  allDone: (slug: string, n: number) => boolean;
  getVariant: (slug: string) => string | undefined;
  setVariant: (slug: string, id: string) => void;
  doneCount: (steps: { slug: string; checks: number }[]) => number;
}

const Ctx = createContext<ProgressApi>(null!);
export const useProgress = () => useContext(Ctx);

const KEY = "sj-p…ss-v1";

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ checks: Checks; variants: Record<string, string> }>({
    checks: {},
    variants: {},
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {}
    }
  }, [state, ready]);

  const isDone = useCallback((slug: string, i: number) => (state.checks[slug] ?? []).includes(i), [state]);
  const toggle = useCallback((slug: string, i: number) => {
    setState((s) => {
      const cur = s.checks[slug] ?? [];
      const next = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i];
      return { ...s, checks: { ...s.checks, [slug]: next } };
    });
  }, []);
  const allDone = useCallback((slug: string, n: number) => n > 0 && (state.checks[slug] ?? []).length >= n, [state]);
  const getVariant = useCallback((slug: string) => state.variants[slug], [state]);
  const setVariant = useCallback((slug: string, id: string) => {
    setState((s) => ({ ...s, variants: { ...s.variants, [slug]: id } }));
  }, []);
  const doneCount = useCallback(
    (steps: { slug: string; checks: number }[]) => steps.filter((s) => allDone(s.slug, s.checks)).length,
    [allDone]
  );

  return (
    <Ctx.Provider value={{ ready, isDone, toggle, allDone, getVariant, setVariant, doneCount }}>
      {children}
    </Ctx.Provider>
  );
}
