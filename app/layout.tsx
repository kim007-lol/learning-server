import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress";
import DarkModeToggle from "@/components/DarkModeToggle";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb", display: "swap" });

export const metadata: Metadata = {
  title: "Server Journey — dari nol sampai server sendiri online",
  description:
    "Panduan interaktif belajar server: VirtualBox, SSH, firewall, deploy aplikasi, sampai online lewat Cloudflare Tunnel. Untuk pemula total.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { const s = localStorage.getItem('sj-dark'); const d = s ? s === '1' : matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.classList.toggle('dark', d); })();`,
          }}
        />
      </head>
      <body className="font-sans">
        <ProgressProvider>
          <header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 font-mono text-sm text-white">▚</span>
                Server Journey
              </Link>
              <DarkModeToggle />
            </div>
          </header>
          <main>{children}</main>
        </ProgressProvider>
      </body>
    </html>
  );
}
