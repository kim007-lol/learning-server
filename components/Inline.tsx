// Teks inline sederhana: **tebal** dan `kode`. Aman untuk server & client component.
export default function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
            {p.slice(2, -2)}
          </strong>
        ) : p.startsWith("`") && p.endsWith("`") ? (
          <code key={i}>{p.slice(1, -1)}</code>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}
