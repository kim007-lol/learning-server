import type { Part } from "@/lib/types";

export const part7: Part = {
  id: 7,
  title: "Bagian 7 — Ringkasan & Dunia Setelah Ini",
  desc: "Rangkai semua jadi satu peta besar, lalu kenali apa yang menanti di level berikutnya.",
  steps: [
    {
      slug: "recap-arsitektur",
      title: "Recap: Arsitektur Lengkap",
      summary: "Dari browser asing sampai proses node-mu — satu gambar yang sekarang kamu bisa baca sendiri.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Lihat lagi apa yang baru saja kamu bangun" },
        { t: "diagram", key: "arsitektur-lengkap", caption: "Request: Browser → Cloudflare (DNS+TLS) → tunnel → cloudflared → nginx → process manager → aplikasimu. Response menyusuri jalan pulangnya." },
        {
          t: "p",
          text: "Setiap kotak di diagram itu sudah kamu sentuh sendiri. Uji pemahaman sejati: jelaskan keras-keras satu request penuh ke teman (atau ke dinding) tanpa melihat catatan — bagian mana yang kamu gagap, buka lagi step-nya.",
        },
        {
          t: "ul",
          items: [
            "**Fondasi (Bagian 0)** — server = komputer + program yang listen; IP/port; DNS; protokol.",
            "**Laboratorium (Bagian 1–2)** — VirtualBox, VM, networking Bridged.",
            "**Kendali jarak jauh (Bagian 3–4)** — SSH, systemctl, UFW, key auth.",
            "**Aplikasi hidup (Bagian 5)** — proses long-running, PM2/systemd/php-fpm, nginx reverse proxy.",
            "**Jendela dunia (Bagian 6)** — Cloudflare Tunnel, DNS record, service auto-start.",
          ],
        },
        {
          t: "callout",
          kind: "tip",
          text: "Kosa kata yang sekarang jadi milikmu: listen, port, daemon, service, reverse proxy, DNS record, nameserver, SIGHUP, unit file, enable/start, ingress, end-to-end. Itu bukan jargon lagi — itu nama-nama benda yang kamu pegang sendiri.",
        },
      ],
      checklist: [
        "Aku bisa menjelaskan perjalanan request dari browser sampai proses aplikasi",
        "Aku tahu di titik mana HTTPS ditangani (Cloudflare edge) dan kenapa",
        "Aku paham semua service yang harus hidup agar situsku hidup (cloudflared, nginx, app)",
      ],
    },
    {
      slug: "docker-next",
      title: "Docker & Containerization",
      summary: "Masalah 'works on my machine' dan cara image/container memecahkannya.",
      requireChecklist: false,
      checklist: [],
      content: [
        { t: "h", text: "Masalah yang belum kamu sadari" },
        {
          t: "p",
          text: "Coba ingat setup-mu: install node + pm2, atau php + ekstensi, atau gunicorn di venv — semuanya menempel langsung di VM, bercampur dengan sistem. Pindah server? Ulangi semua dari nol, doakan versinya sama. Versi dependensi A dan B tidak cocok? Tidak ada jaminan cepat selesai. Ini masalah **konsistensi environment** — dan Docker dirancang persis untuk ini.",
        },
        { t: "diagram", key: "docker", caption: "Dockerfile (resep) → Image (masakan beku siap pakai) → Container (porsi yang dihidupkan). Berbagi kernel host, jauh lebih ringan dari VM" },
        {
          t: "ul",
          items: [
            "**Image** = kemasan sekali-bangun-yang-bisa-dijalankan: OS minimal + runtime + app-mu + dependensinya. Identik di laptop, VM, atau VPS mana pun.",
            "**Container** = image yang sedang dieksekusi — proses yang diisolasi, startup detik.",
            "**Dockerfile** = resep build image — versi yang bisa dibaca manusia dari setup-mu.",
            "**docker compose** = deklarasikan banyak service sekaligus (app + database + nginx) dalam satu file YAML, `docker compose up` dan semuanya hidup sesuai urutan.",
          ],
        },
        { t: "p", text: "Gambaran Node.js-mu jadi satu image:" },
        {
          t: "file",
          name: "Dockerfile (di ~/webapp)",
          text: "FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]",
        },
        { t: "cmd", text: "docker build -t webapp . && docker run -d -p 3000:3000 --name webapp webapp", note: "bangun & jalankan — tidak perlu npm install manual di server lagi" },
        {
          t: "p",
          text: "Perhatikan: konsep yang sudah kamu kuasai tidak dibuang — container tetap butuh 'tetap hidup' (`--restart unless-stopped`), nginx tetap di depan, tunnel tetap sama. Docker mengganti CARA aplikasi dikemas, bukan arsitekturnya. Itulah kenapa web ini mengajar manual dulu: orang yang paham systemd/nginx lebih cepat paham Docker, bukan sebaliknya.",
        },
      ],
      references: [
        { label: "Docker Docs — Get Started", url: "https://docs.docker.com/get-started/" },
        { label: "Dockerfile reference", url: "https://docs.docker.com/reference/dockerfile/" },
      ],
    },
    {
      slug: "ci-cd-next",
      title: "CI/CD",
      summary: "Push git → server meng-update dirinya sendiri. Loop manual SSH-pull-restart diotomasi.",
      requireChecklist: false,
      checklist: [],
      content: [
        { t: "h", text: "Hitung berapa kali tanganmu bergerak per deploy" },
        {
          t: "p",
          text: "Sekarang: commit → push → SSH → git pull → npm install → build → pm2 restart. Setiap langkah = kesempatan human error (lupa build, restart service yang salah). **CI/CD** memindahkan loop itu ke mesin: setiap push ke GitHub memicu pipeline yang menguji, membangun, lalu mendeploy — konsisten, tercatat, bisa di-rollback.",
        },
        {
          t: "ul",
          items: [
            "**Continuous Integration (CI)** — setiap push: install deps, jalankan test, build. Gagal test = gagal deploy (bug tidak pernah sampai produksi).",
            "**Continuous Deployment (CD)** — CI hijau → deploy otomatis: SSH ke server, pull, restart service (atau build image & push registry untuk Docker).",
          ],
        },
        { t: "p", text: "Contoh konkret GitHub Actions — file di repo-mu:" },
        {
          t: "file",
          name: ".github/workflows/deploy.yml",
          text: "name: Deploy\non:\n  push:\n    branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Deploy ke VM via SSH\n        uses: appleboy/ssh-action@v1\n        with:\n          host: ${{ secrets.SERVER_IP }}\n          username: ${{ secrets.SERVER_USER }}\n          key: ${{ secrets.SSH_PRIVATE_KEY }}\n          script: |\n            cd ~/webapp\n            git pull origin main\n            npm ci && npm run build\n            pm2 restart webapp",
          note: "rahasia (IP, private key) disimpan di GitHub Secrets — tidak pernah masuk repo",
        },
        {
          t: "callout",
          kind: "info",
          text: "Kebetulan yang menyenangkan: pipeline-mu memakai SSH private key + restart service — semua yang baru kamu bangun di web ini. CI/CD bukan teknologi asing, dia robot yang mengulang keystroke yang sudah kamu kuasai.",
        },
      ],
      references: [
        { label: "GitHub Actions docs", url: "https://docs.github.com/en/actions" },
        { label: "appleboy/ssh-action", url: "https://github.com/appleboy/ssh-action" },
      ],
    },
    {
      slug: "cloud-vps-next",
      title: "Cloud VPS Sungguhan",
      summary: "DigitalOcean/AWS/GCP: VM yang sama, di data center, dengan IP publik asli.",
      requireChecklist: false,
      checklist: [],
      content: [
        { t: "h", text: "Kabar terbaik dari seluruh web ini" },
        {
          t: "p",
          text: "**Semua yang kamu pelajari 100% terpakai lagi, tanpa perubahan.** VPS adalah VM juga — Linux yang sama (`apt`, `systemctl`, `nginx`, SSH) — tapi dijalankan di data center provider dan **punya IP publik asli**. Bedanya hanya siapa yang menyalakan fisiknya dan di mana ia duduk.",
        },
        {
          t: "table",
          headers: ["", "VirtualBox (kamu sekarang)", "VPS"],
          rows: [
            ["OS & command", "Ubuntu/Xubuntu", "Ubuntu — sama persis"],
            ["IP publik", "Tidak ada → butuh tunnel", "Ada, permanen"],
            ["Ketersediaan", "Menyala saat laptopmu nyala", "24/7, data center + UPS + redundant network"],
            ["Biaya", "Gratis", "±$4–6/bulan (DO Droplet, EC2 Lightsail, GCP e2-micro)"],
            ["Kalau rusak", "Restore snapshot", "Rebuild dari panel; snapshot tetap ada"],
          ],
        },
        {
          t: "p",
          text: "Jalur migrasi yang sebenarnya cuma 5 langkah: buy VPS Ubuntu → (yang belum kamu kenal hanya) login `ssh root@IP_PUBLIK` karena tidak ada VM desktop → install ulang nginx/app dengan command yang sama → arahkan A record domain ke IP baru → (opsional) Cloudflare Tunnel masih boleh dipakai di atasnya sebagai lapisan keamanan & CDN, walau tidak wajib lagi.",
        },
        {
          t: "callout",
          kind: "warn",
          text: "Satu-satunya syok budaya: VPS langsung diserang bot sejak menit pertama (IP publik!). Firewall + SSH key + disable password login dari Bagian 4 berubah dari 'edukatif' jadi 'wajib hukumnya'.",
        },
      ],
      references: [
        { label: "DigitalOcean — Droplets", url: "https://www.digitalocean.com/products/droplets" },
        { label: "AWS Lightsail", url: "https://aws.amazon.com/lightsail/" },
      ],
    },
    {
      slug: "monitoring-next",
      title: "Monitoring & Logging",
      summary: "Server yang tidak kamu pantau adalah server yang ceritanya kamu dengar dari user.",
      requireChecklist: false,
      checklist: [],
      content: [
        { t: "h", text: "Masalah setelah 'live'" },
        {
          t: "p",
          text: "Aplikasi crash jam 3 pagi tidak akan membangunkanmu. User yang melihat error 502 biasanya lebih tahu daripada kamu. Monitoring = memastikan **kamu tahu sebelum user menelepon**.",
        },
        {
          t: "ul",
          items: [
            "**Cek resource cepat** (SSH lalu lihat): `htop` / `btop` — CPU, RAM, proses mana yang rakus.",
            "**Log** — yang sudah kamu pakai diam-diam selama ini: `journalctl -u nginx`, `pm2 logs`, `tail -f /var/log/auth.log` (termasuk upaya brute-force SSH yang tadi disebut).",
            "**Uptime monitoring** — alat eksternal yang bertanya ke domain-mu tiap menit dan memberi tahu kamu kalau situs mati: **Uptime Kuma** (open-source, bisa di-host sendiri, panelnya informatif) sebagai pintu masuk; **Grafana + Prometheus** sebagai level lanjut (metrik grafik, alerting, dashboard).",
          ],
        },
        {
          t: "p",
          text: "Peta alurnya: metrics (angka: CPU%, RAM, latency) + logs (kejadian: error apa) + alerts (siapa yang dibangunkan). Uptime Kuma mencakup titik awal ketiganya untuk proyek kecil.",
        },
      ],
      references: [
        { label: "Uptime Kuma", url: "https://github.com/louislam/uptime-kuma" },
        { label: "Prometheus + Grafana", url: "https://prometheus.io/docs/visualization/grafana/" },
      ],
    },
    {
      slug: "keamanan-lanjutan",
      title: "Keamanan Lanjutan & Backup",
      summary: "fail2ban, update otomatis, backup — pintu masuk yang layak kamu dalami mandiri.",
      requireChecklist: false,
      checklist: [],
      content: [
        { t: "h", text: "Tiga lapis yang belum kita sentuh" },
        {
          t: "ol",
          items: [
            "**fail2ban** — membaca log auth, dan kalau satu IP mencoba password salah berkali-kali, BAN ip-nya di firewall otomatis. Lapisan di atas SSH key (yang sudah kamu pasang) — defense in depth. `sudo apt install fail2ban` sudah memberi konfigurasi dasar yang wajar.",
            "**unattended-upgrades** — patch keamanan otomatis tiap malam. `sudo apt install unattended-upgrades && sudo dpkg-reconfigure -plow unattended-upgrades`. Trade-off klasik: stabilitas vs kecepatan patch — untuk server pribadi kecil, biasakan keamanan.",
            "**Backup & snapshot** — server tanpa backup = soal waktu, bukan kalau-kalau. VM: snapshot VirtualBox + simpan disk image ke drive luar. VPS: snapshot provider + dump database terjadwal (`mysqldump`/`pg_dump` + cron). Uji RESTORE-nya — backup yang tidak pernah dicoba restore hanyalah harapan.",
          ],
        },
        {
          t: "callout",
          kind: "tip",
          text: "Prinsip yang menutup seluruh web ini: keamanan server bukan satu tools ajaib, tapi lapisan-lapisan kecil yang membosankan tapi dilakukan dengan disiplin — update, firewall, key auth, fail2ban, backup. Yang menang di dunia server biasanya bukan yang terpintar, tapi yang paling konsisten mengulang hal dasar.",
        },
        { t: "h", text: "Setelah ini ke mana?" },
        {
          t: "ul",
          items: [
            "Praktik: deploy 1 app sungguhan milikmu lewat jalur ini lengkap.",
            "Lanjut Docker (praktik penuh) → CI/CD untuk repo itu.",
            "Sewa VPS pertama-mu ($5) — semua ilmumu pindahkan, rasakan bedanya.",
            "Dan kapan pun mentok: buka chatbot, dia membawa seluruh materi ini di kepalanya.",
          ],
        },
      ],
      references: [
        { label: "fail2ban docs", url: "https://www.fail2ban.org/wiki/index.php/Manual" },
        { label: "Ubuntu Automatic Updates", url: "https://help.ubuntu.com/community/AutomaticSecurityUpdates" },
      ],
    },
  ],
};
