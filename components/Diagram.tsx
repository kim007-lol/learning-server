// Diagram SVG data-driven: tiap key = kotak (node) + panah (edge). Satu renderer untuk semuanya.
type Node = { id: string; x: number; y: number; w?: number; h?: number; label: string; tone?: "brand" | "zinc" | "accent" };
type Edge = { from: string; to: string; label?: string; dashed?: boolean };

const C = 640; // viewBox width

function diagram(key: string): { nodes: Node[]; edges: Edge[]; h?: number } | null {
  const n = (id: string, x: number, y: number, label: string, tone?: Node["tone"], w = 120, h = 52): Node =>
    ({ id, x, y, label, tone, w, h });
  switch (key) {
    case "client-server":
      return {
        nodes: [n("a", 40, 40, "Klien\n(browser)", "zinc", 140), n("b", 440, 40, "Server\n(menunggu request)", "brand", 150)],
        edges: [
          { from: "a", to: "b", label: "request" },
          { from: "b", to: "a", label: "respons" },
        ],
        h: 150,
      };
    case "ip-port":
      return {
        nodes: [n("ip", 60, 60, "IP = alamat rumah\n(nomor rumah)", "zinc", 200), n("p1", 400, 20, "Port 80\n= pintu web", "brand"), n("p2", 400, 95, "Port 22\n= pintu SSH", "accent")],
        edges: [{ from: "ip", to: "p1" }, { from: "ip", to: "p2" }],
        h: 170,
      };
    case "ip-privat-publik":
      return {
        nodes: [n("vm", 30, 60, "IP privat\n10.0.2.15 (VM)", "zinc", 150), n("rt", 250, 60, "Router\n(NAT)", "accent", 110), n("net", 460, 60, "Internet\n(IP publik)", "brand", 140)],
        edges: [{ from: "vm", to: "rt", label: "keluar ✓" }, { from: "net", to: "rt", label: "masuk ✗", dashed: true }],
        h: 160,
      };
    case "protokol":
      return {
        nodes: [n("a", 40, 30, "Aplikasi\n(HTTP)", "zinc"), n("b", 40, 110, "Transpor\n(TCP)", "accent"), n("c", 40, 190, "Jaringan\n(IP)", "brand"), n("d", 430, 30, "Aplikasi\n(HTTP)", "zinc"), n("e", 430, 110, "Transpor\n(TCP)", "accent"), n("f", 430, 190, "Jaringan\n(IP)", "brand")],
        edges: [
          { from: "a", to: "b" }, { from: "b", to: "c" }, { from: "c", to: "f", label: "kabel/wifi" }, { from: "f", to: "e" }, { from: "e", to: "d" },
        ],
        h: 260,
      };
    case "dns":
      return {
        nodes: [n("u", 30, 60, "Kamu\nketik domain", "zinc", 130), n("dns", 260, 60, "DNS\n= buku telepon", "accent", 120), n("s", 470, 60, "IP server\n104.16.x.x", "brand", 130)],
        edges: [{ from: "u", to: "dns", label: "domain?" }, { from: "dns", to: "s", label: "ini IP-nya" }],
        h: 160,
      };
    case "terminal":
      return {
        nodes: [n("t", 120, 20, "Terminal = jendela\nke isi komputer (teks)", "zinc", 400, 60), n("o", 120, 120, "OS / shell memproses command", "brand", 400, 50)],
        edges: [{ from: "t", to: "o", label: "kamu ketik →" }],
        h: 200,
      };
    case "permission":
      return {
        nodes: [n("r", 30, 60, "root\n(segala kuasa)", "accent", 120), n("u", 260, 60, "user biasa\n(hanya home-nya)", "zinc", 160), n("f", 480, 60, "File / sistem\nr-w-x per orang", "brand", 130)],
        edges: [{ from: "r", to: "u", label: "sudo = pinjam kuasa sebentar" }, { from: "u", to: "f" }],
        h: 160,
      };
    case "linux-folder":
      return {
        nodes: [
          n("root", 260, 10, "/ (root)", "brand", 110, 40),
          n("etc", 30, 90, "/etc\nkonfigurasi", "zinc", 110),
          n("var", 170, 90, "/var\nlog & data", "zinc", 110),
          n("home", 310, 90, "/home\npunyamu", "accent", 110),
          n("usr", 450, 90, "/usr\nprogram", "zinc", 120),
        ],
        edges: [{ from: "root", to: "etc" }, { from: "root", to: "var" }, { from: "root", to: "home" }, { from: "root", to: "usr" }],
        h: 170,
      };
    case "vm-dalam-host":
      return {
        nodes: [
          n("host", 60, 30, "Host: Windows + VirtualBox", "zinc", 520, 44),
          n("vm", 160, 110, "VM: Xubuntu", "brand", 320, 90),
          n("hw", 160, 240, "CPU · RAM · Disk asli", "accent", 320, 40),
        ],
        edges: [{ from: "host", to: "vm", label: "menumpang" }, { from: "hw", to: "vm", label: "dialokasikan" }],
        h: 300,
      };
    case "nat":
      return {
        nodes: [n("vm", 30, 70, "VM (IP privat)", "brand", 130), n("vb", 250, 70, "VirtualBox\nNAT gateway", "zinc", 140), n("net", 470, 70, "Internet", "accent", 120)],
        edges: [{ from: "vm", to: "vb", label: "keluar ✓" }, { from: "vb", to: "net" }, { from: "net", to: "vb", label: "masuk ✗", dashed: true }],
        h: 170,
      };
    case "bridged":
      return {
        nodes: [n("lan", 240, 20, "Router / WiFi rumah (192.168.1.0/24)", "accent", 300, 44), n("pc", 60, 120, "Laptop (IP .1)", "zinc", 150), n("vm", 420, 120, "VM (dapat IP .5 — sejajar!)", "brand", 190)],
        edges: [{ from: "pc", to: "lan" }, { from: "vm", to: "lan", label: "langsung" }, { from: "pc", to: "vm", label: "bisa saling ping", dashed: true }],
        h: 210,
      };
    case "host-only-nat":
      return {
        nodes: [n("pc", 40, 60, "Laptop host", "zinc", 140), n("net", 250, 20, "Adapter 1: NAT → internet", "accent", 240, 40), n("ho", 250, 110, "Adapter 2: Host-only → 192.168.56.x", "brand", 250, 40), n("vm", 300, 190, "VM", "brand", 120, 40)],
        edges: [{ from: "vm", to: "net" }, { from: "vm", to: "ho" }, { from: "pc", to: "ho", label: "SSH ke sini" }],
        h: 260,
      };
    case "ssh-flow":
      return {
        nodes: [n("h", 40, 60, "Host: ssh user@IP -p 22", "zinc", 200), n("v", 410, 60, "VM: sshd menunggu di :22", "brand", 190), n("enc", 235, 150, "terowongan terenkripsi", "accent", 170, 36)],
        edges: [{ from: "h", to: "v", label: "login + command" }, { from: "v", to: "h", label: "hasil" }],
        h: 220,
      };
    case "firewall":
      return {
        nodes: [n("in", 30, 60, "Internet / jaringan", "zinc", 140), n("fw", 250, 40, "UFW\npenjaga gerbang", "accent", 130, 80), n("ok", 460, 15, "Port 22 (SSH)\nPort 80/443", "brand", 150, 52), n("no", 460, 110, "Port lain → dibuang", "zinc", 150, 44)],
        edges: [{ from: "in", to: "fw", label: "semua pintu diketuk" }, { from: "fw", to: "ok", label: "dibuka (allow)" }, { from: "fw", to: "no", label: "ditolak", dashed: true }],
        h: 190,
      };
    case "ssh-key":
      return {
        nodes: [n("pr", 30, 30, "PRIVATE KEY\ndi laptopmu (rahasia!)", "accent", 190, 60), n("pu", 30, 140, "PUBLIC KEY\n→ ditanam ke authorized_keys VM", "zinc", 230, 60), n("vm", 430, 140, "VM: mencocokkan pasangan", "brand", 180)],
        edges: [{ from: "pr", to: "vm", label: "bukti kepemilikan" }, { from: "pu", to: "vm" }],
        h: 230,
      };
    case "proses-mati":
      return {
        nodes: [n("t", 40, 60, "Terminal ditutup\n(SIGHUP)", "zinc", 150), n("k", 440, 60, "Proses app mati 💀\nsitus down", "accent", 170), n("surv", 240, 160, "solusi: nohup / PM2 / systemd", "brand", 190, 40)],
        edges: [{ from: "t", to: "k", label: "anak proses ikut dibunuh" }, { from: "surv", to: "k", label: "melindungi", dashed: true }],
        h: 240,
      };
    case "process-manager":
      return {
        nodes: [n("pm", 240, 20, "Process Manager (PM2 / systemd)", "brand", 200, 44), n("a", 60, 130, "app-mu\n(hidup terus)", "zinc", 120), n("chk", 460, 130, "monitor tiap detik\nmati → nyalakan lagi", "accent", 160)],
        edges: [{ from: "pm", to: "a", label: "menjaga" }, { from: "pm", to: "chk" }],
        h: 220,
      };
    case "systemd-analogi":
      return {
        nodes: [
          n("sys", 40, 50, "systemd\n=pengelola gedung", "brand", 150, 70),
          n("ctl", 250, 50, "systemctl\n= interphone", "accent", 140, 70),
          n("unit", 460, 50, "unit file .service\n= surat instruksi", "zinc", 150, 70),
          n("svc", 250, 170, "service (nginx, dst)", "zinc", 140, 40),
        ],
        edges: [{ from: "ctl", to: "sys", label: "perintah" }, { from: "sys", to: "svc", label: "menjalankan sesuai" }, { from: "unit", to: "svc", label: "resep" }],
        h: 240,
      };
    case "reverse-proxy":
      return {
        nodes: [n("u", 30, 80, "Browser\n(tanpa port)", "zinc", 130), n("ng", 235, 60, "nginx :80\nresepsionis", "brand", 140, 70), n("app", 470, 20, "app Node :3000", "accent", 150, 40), n("app2", 470, 130, "app lain :8000", "accent", 150, 40)],
        edges: [{ from: "u", to: "ng", label: "80/443" }, { from: "ng", to: "app", label: "proxy_pass" }, { from: "ng", to: "app2", label: "lokasi /forum" }],
        h: 200,
      };
    case "php-fpm":
      return {
        nodes: [n("u", 30, 70, "Browser", "zinc", 110), n("ng", 210, 60, "nginx :80", "brand", 110), n("fpm", 420, 20, "php-fpm pool\n(worker banyak)", "accent", 180, 56), n("sock", 420, 120, "socket unix\n/run/php/...sock", "zinc", 180, 44)],
        edges: [{ from: "u", to: "ng" }, { from: "ng", to: "sock", label: "file .php" }, { from: "sock", to: "fpm" }],
        h: 190,
      };
    case "tunnel":
      return {
        nodes: [n("v", 30, 130, "VM: cloudflared\nmenyembul keluar", "brand", 180, 56), n("cf", 400, 130, "Cloudflare edge\n(IP publik, TLS)", "accent", 200, 56), n("vis", 220, 20, "Pengunjung internet", "zinc", 160)],
        edges: [
          { from: "v", to: "cf", label: "koneksi KELUAR ditahan terbuka = terowongan" },
          { from: "vis", to: "cf", label: "https://domain" },
          { from: "cf", to: "v", label: "trafik lewat terowongan", dashed: true },
        ],
        h: 230,
      };
    case "tunnel-vs-port-forward":
      return {
        nodes: [
          n("pf", 60, 20, "Cara lama: port forwarding", "zinc", 220, 36),
          n("pf1", 60, 70, "Lubangi router + IP publik statis — berbahaya & ribet di rumah", "accent", 220, 64),
          n("tn", 370, 20, "Cloudflare Tunnel", "brand", 210, 36),
          n("tn1", 370, 70, "VM yang mengulurkan tangan keluar — router tak disentuh", "brand", 210, 64),
        ],
        edges: [],
        h: 160,
      };
    case "arsitektur-lengkap":
      return {
        nodes: [
          n("br", 10, 70, "Browser", "zinc", 90),
          n("cf", 125, 60, "Cloudflare\nDNS + TLS", "accent", 110, 60),
          n("cfd", 260, 60, "cloudflared\n(tunnel)", "brand", 110, 60),
          n("ng", 395, 60, "nginx :80", "brand", 95, 60),
          n("pm", 510, 20, "PM2 / systemd /\nphp-fpm", "zinc", 120, 52),
          n("app", 510, 100, "aplikasimu", "brand", 120, 44),
        ],
        edges: [
          { from: "br", to: "cf" }, { from: "cf", to: "cfd", label: "terowongan" }, { from: "cfd", to: "ng" }, { from: "ng", to: "pm", label: "proxy/socket" }, { from: "pm", to: "app" },
        ],
        h: 170,
      };
    case "docker":
      return {
        nodes: [n("df", 30, 60, "Dockerfile\n(resep)", "zinc", 130), n("img", 240, 60, "Image\n(masakan beku)", "accent", 140), n("ct", 460, 40, "Container jalan #1", "brand", 150, 40), n("ct2", 460, 100, "Container jalan #2", "brand", 150, 40)],
        edges: [{ from: "df", to: "img", label: "build" }, { from: "img", to: "ct", label: "run" }, { from: "img", to: "ct2", label: "run" }],
        h: 170,
      };
    default:
      return null;
  }
}

function cx(nd: Node) { return nd.x + (nd.w ?? 120) / 2; }
function cy(nd: Node) { return nd.y + (nd.h ?? 52) / 2; }

const toneFill: Record<string, [string, string, string]> = {
  // [rect (fill+stroke), text baris 1+2] — pakai class Tailwind supaya dark mode ikut
  brand: ["fill-[#d9f7e8] dark:fill-[#0c3527] stroke-[#20ae79] dark:stroke-[#34d399]", "fill-[#117050] dark:fill-[#a7f3d0]", "fill-[#117050]/70 dark:fill-[#a7f3d0]/70"],
  zinc: ["fill-[#e4e4e7] dark:fill-[#27272a] stroke-[#a1a1aa] dark:stroke-[#71717a]", "fill-[#3f3f46] dark:fill-[#e4e4e7]", "fill-[#3f3f46]/70 dark:fill-[#e4e4e7]/70"],
  accent: ["fill-[#fef3c7] dark:fill-[#3b2605] stroke-[#f59e0b] dark:stroke-[#fbbf24]", "fill-[#92400e] dark:fill-[#fde68a]", "fill-[#92400e]/70 dark:fill-[#fde68a]/70"],
};

export default function Diagram({ diagKey, caption }: { diagKey: string; caption?: string }) {
  const d = diagram(diagKey);
  if (!d) return null;
  const byId = Object.fromEntries(d.nodes.map((x) => [x.id, x]));
  const h = d.h ?? 200;
  return (
    <figure className="my-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <svg viewBox={`0 0 ${C} ${h}`} className="h-auto w-full" role="img" aria-label={caption ?? diagKey}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" className="fill-zinc-400" />
          </marker>
        </defs>
        {d.edges.map((e, i) => {
          const a = byId[e.from], b = byId[e.to];
          if (!a || !b) return null;
          const x1 = cx(a), y1 = cy(a), x2 = cx(b), y2 = cy(b);
          const mx = (x1 + x2) / 2;
          // panah kanan→kiri: label di bawah garis, supaya tidak bertumpuk dengan lawannya
          const my = (y1 + y2) / 2 + (x2 < x1 ? 16 : -6);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd="url(#arr)" strokeDasharray={e.dashed ? "5 4" : undefined} className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth={1.5} />
              {e.label && <text x={mx} y={my} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400" fontSize={11}>{e.label}</text>}
            </g>
          );
        })}
        {d.nodes.map((nd) => {
          const [boxCls, line1Cls, line2Cls] = toneFill[nd.tone ?? "zinc"];
          const w = nd.w ?? 120, hh = nd.h ?? 52;
          const lines = nd.label.split("\n");
          return (
            <g key={nd.id}>
              <rect x={nd.x} y={nd.y} width={w} height={hh} rx={10} strokeWidth={1.5} opacity={0.95} className={boxCls} />
              {lines.map((l, i) => (
                <text key={i} x={nd.x + w / 2} y={cy(nd) + (i - (lines.length - 1) / 2) * 15 + 4} textAnchor="middle" fontSize={12.5} fontWeight={i === 0 ? 600 : 400} className={i === 0 ? line1Cls : line2Cls}>
                  {l}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
      {caption && <figcaption className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{caption}</figcaption>}
    </figure>
  );
}
