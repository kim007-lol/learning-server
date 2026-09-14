import { NextResponse } from "next/server";
import { getStep, stepToPlainText } from "@/data";
import { BASE_SYSTEM_PROMPT } from "@/lib/chat-prompt";

const MODELS = [process.env.GEMINI_MODEL ?? "gemini-flash-latest", "gemini-3.6-flash", "gemini-flash-lite-latest"];

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "GEMINI_API_KEY belum diisi di .env.local" }, { status: 500 });

  let body: { slug?: string; messages?: { role: string; text: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "body tidak valid" }, { status: 400 });
  }
  const messages = (body.messages ?? []).filter((m) => (m.role === "user" || m.role === "model") && typeof m.text === "string").slice(-12);
  if (!messages.length) return NextResponse.json({ error: "tidak ada pesan" }, { status: 400 });

  const step = body.slug ? getStep(body.slug) : undefined;
  const context = step ? `\n\nSTEP SAAT INI (judul: ${step.title}):\n${stepToPlainText(step).slice(0, 12000)}` : "";

  const payload = {
    systemInstruction: { parts: [{ text: BASE_SYSTEM_PROMPT + context }] },
    contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
  };

  // coba model utama, fallback kalau overloaded/not found; 503/500 dicoba ulang 1x
  let lastErr = "model tidak merespons";
  for (const model of MODELS.filter(Boolean)) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "(jawaban kosong)";
        return NextResponse.json({ reply });
      }
      lastErr = `${res.status}: ${(await res.text()).slice(0, 200)}`;
      // error auth/quota tidak ada gunanya di-retry; 503/500 tunggu sebentar lalu coba lagi
      if (res.status !== 503 && res.status !== 500) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
    // 404 = model tidak tersedia untuk key ini → lanjut ke model cadangan
    if (lastErr.startsWith("403") || lastErr.startsWith("429")) break;
  }
  return NextResponse.json({ error: lastErr }, { status: 502 });
}
