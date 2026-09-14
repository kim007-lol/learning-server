"use client";

// ledakan emoji kecil saat checklist selesai — murni CSS, tanpa library
const EMOJI = ["🎉", "✨", "⭐", "🎊", "", "✨"];

export default function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-2 h-0">
      {EMOJI.map((e, i) => (
        <span
          key={i}
          className="absolute text-lg"
          style={{
            left: `${8 + i * 15}%`,
            animation: `sj-confetti 1.1s ease-in ${i * 0.07}s both`,
          }}
        >
          {e}
        </span>
      ))}
    </div>
  );
}
