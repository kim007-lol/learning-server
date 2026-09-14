import type { Block, Step } from "@/lib/types";

// Steps konsep umum Bagian 5 (dipakai oleh data/part5.ts)
export const part5ConceptSteps: Step[] = [
  {
    slug: "proses-yang-harus-tetap-hidup",
    title: "Konsep: Proses yang Harus Tetap Hidup",
    summary: "Kenapa app yang jalan di terminal ikut mati saat terminal ditutup — masalah inti yang dipecahkan process manager.",
    requireChecklist: true,
    content: [
      { t: "h", text: "Coba sendiri, lihat langsung masalahnya" },
      { t: "p", text: "Di VM (lewat sesi SSH), jalankan server web sederhana tanpa tool apa pun:" },
      { t: "cmd", text: "python3 -m http.server 8000", note: "server file statis super sederhana bawaan Python" },
      {
        t: "p",
        text: "Dari browser laptop, buka http://IP_VM:8000 → jalan. Sekarang tutup jendela SSH (atau Ctrl+C lalu exit). Muat ulang browser → MATI. Aplikasi ikut mati bersamanya.",
      },
      { t: "diagram", key: "proses-mati", caption: "Silsilah proses: SSH session → shell → aplikasimu. Sesi putus, shell dapat SIGHUP, anak-anaknya ikut dibersihkan" },
      {
        t: "p",
        text: "Kenapa? Linux menyusun proses seperti silsilah keluarga: sesi SSH menyalakan shell (bash), dan aplikasi yang kamu jalankan adalah ANAK dari shell itu. Saat SSH terputus, kernel mengirim sinyal SIGHUP (hangup) ke shell, dan shell 'pensiun' bersama anak-anaknya. Server yang sehat tidak boleh ikut mati ketika sesi adminnya selesai — padahal itu default-nya.",
      },
      { t: "h", text: "Apa yang dibutuhkan server sungguhan" },
      {
        t: "ul",
        items: [
          "Aplikasi tetap hidup saat TIDAK ada sesi terminal terbuka.",
          "Auto-restart kalau crash — proses yang mati karena bug harus hidup lagi dalam hitungan detik, bukan menunggu kamu sadar besok pagi.",
          "Auto-start saat server reboot — habis update kernel, aplikasi harus naik sendiri.",
        ],
      },
      {
        t: "p",
        text: "Tiga syarat itu = pekerjaan sebuah **process manager**. Ada banyak tools yang memenuhi; di web ini kamu akan mengenal dua pendekatan besar:",
      },
      {
        t: "ol",
        items: [
          "**PM2** — process manager khusus ekosistem Node.js/JS, diinstal lewat npm, sangat simpel.",
          "**systemd** — process manager bawaan Linux di level sistem operasi: bisa menjaga proses bahasa APA PUN (Go, Python, PHP, bahkan Node). Semua service yang sudah kamu pakai diam-diam (sshd, nginx) dikelola olehnya.",
        ],
      },
      {
        t: "callout",
        kind: "info",
        text: "tools lawas seperti nohup, tmux, screen juga 'menyelamatkan' proses dari SIGHUP — tapi tidak memberi auto-restart & auto-boot yang rapi. Untuk produksi, pilihannya process manager — dan dua yang akan kamu pakai adalah PM2 dan systemd.",
      },
    ],
    checklist: [
      "Saya membuktikan sendiri: server di sesi SSH mati saat sesi ditutup",
      "Saya bisa menjelaskan kenapa (SIGHUP ke shell, proses anak ikut)",
      "Saya tahu 3 syarat aplikasi produksi: background, auto-restart, auto-start saat boot",
      "Saya tahu dua nama yang akan dipakai: PM2 dan systemd",
    ],
    troubleshooting: [
      {
        q: "Kalau aku jalankan dari terminal DESKTOP VM (bukan SSH), ditutup juga ikut mati?",
        a: [
          { t: "p", text: "Ya — jendela terminal emulator juga induk shell-nya. Menutup jendela = shell mati = SIGHUP. Yang membedakan hanya siapa yang memegang 'tali' sesi. Solusinya tetap sama: process manager." },
        ],
      },
    ],
  },
  {
    slug: "systemd-vs-systemctl-vs-pm2",
    title: "Istilah: systemd vs systemctl vs Service",
    summary: "Tiga istilah yang paling sering tertukar di dunia Linux — dibedah sekali, cukup selamanya.",
    requireChecklist: true,
    content: [
      { t: "h", text: "Satu kalimat dulu, baru analogi" },
      {
        t: "p",
        text: "**systemd** adalah sistemnya (program pertama yang jalan saat boot, mengurus semua service di mesin). **systemctl** adalah perintah untuk menyuruh systemd. **.service (unit file)** adalah instruksi tertulis yang kamu berikan ke systemd tentang cara menjalankan aplikasi-mu.",
      },
      { t: "diagram", key: "systemd-analogi", caption: "Analogi gedung: kamu (admin) → systemctl (interphone) → systemd (pengelola gedung) → unit file (surat instruksi) → aplikasimu (lampunya)" },
      {
        t: "ul",
        items: [
          "**systemd = pengelola gedung.** Dia bangun paling awal setiap mesin menyala (init process, PID 1), punya kunci semua ruangan, menyalakan/mematikan lampu sesuai jadwal (service), dan mencatat semuanya. Kamu tidak berbicara langsung dengan systemd — tidak ada command bernama systemd untuk penggunaan harian.",
          "**systemctl = interphone-nya.** Alat komunikasimu ke pengelola: start, stop, restart, enable (nyalakan otomatis setiap gedung dibuka), status (bagaimana kondisinya sekarang?).",
          "**unit file = surat instruksi.** File teks di /etc/systemd/system/nama.service: 'hidupkan aplikasi ini, command-nya X, kerjanya di folder Y, jalankan sebagai user Z, nyalakan lagi kalau mati.' Pengelola membacanya saat menerima perintah.",
        ],
      },
      { t: "h", text: "Command yang akan kamu pakai (hafal pola, bukan hapalan)" },
      { t: "cmd", text: "sudo systemctl start myapp", note: "nyalakan sekarang" },
      { t: "cmd", text: "sudo systemctl enable myapp", note: "nyalakan otomatis setiap boot (TIDAK start sekarang)" },
      { t: "cmd", text: "sudo systemctl enable --now myapp", note: "kombinasi paling umum: start sekarang + auto-boot" },
      { t: "cmd", text: "sudo systemctl status myapp", note: "hidup/mati, sejak kapan, log 10 baris terakhir" },
      { t: "cmd", text: "sudo systemctl restart myapp", note: "matikan lalu nyalakan — wajib setelah ubah config/unit file" },
      { t: "cmd", text: "sudo systemctl daemon-reload", note: "beri tahu systemd bahwa ada unit file yang DIUBAH di disk — dilakukan sebelum restart saat mengedit .service" },
      { t: "cmd", text: "journalctl -u myapp -f", note: "log milik service itu (-u = unit, -f = follow/ik seperti tail -f)" },
      {
        t: "callout",
        kind: "info",
        text: "Perhatikan polanya: daemon-reload itu 'systemd, baca ulang surat-suratnya', bukan merestart apa pun. Urutan wajib setelah edit unit file: daemon-reload → restart. Lupa daemon-reload = systemd masih memakai instruksi lama, dan kamu bingung kenapa editanmu tidak berdampak.",
      },
      { t: "h", text: "Lalu PM2 posisinya di mana?" },
      {
        t: "p",
        text: "**PM2** = process manager pihak ketiga KHUSUS ekosistem Node.js — konsepnya paralel dengan systemd (jaga proses, auto-restart, lihat log) tapi berjalan 'di atas' OS, bukan di dalamnya. Kelebihan PM2 untuk orang JS: nol konfigurasi file (langsung `pm2 start`), log viewer built-in, cluster mode (pakai semua core CPU), reload tanpa downtime. Bedanya dengan systemd, praktis:",
      },
      {
        t: "table",
        headers: ["", "systemd", "PM2"],
        rows: [
          ["Level", "OS — bahasa apa pun", "Ekosistem Node/JS"],
          ["Cara konfigurasi", "Unit file .service", "Perintah CLI / file JSON kecil"],
          ["Install", "Sudah ada di Ubuntu", "npm install -g pm2"],
          ["Fitur unik", "Jaringan target, socket activation, terintegrasi journal log", "Cluster mode, pm2 logs real-time, deploy JSON"],
          ["Kapan pilih", "Default untuk apa pun di luar JS (Go/Python/biner)", "App Node yang ingin manajemen simpel"],
        ],
      },
      {
        t: "p",
        text: "Catatan jujur: app Node JUGA bisa dijalankan systemd (banyak produksi memilih itu — satu cara untuk semua). PM2 bukan syarat, hanya kenyamanan. Setelah step deploy stack, kamu akan punya opini sendiri.",
      },
    ],
    checklist: [
      "Saya bisa menjelaskan beda systemd / systemctl / unit file dengan analogi sendiri",
      "Saya tahu daemon-reload diperlukan setelah EDIT unit file",
      "Saya tahu beda mendasar systemd vs PM2 (level OS vs level ekosistem Node)",
      "Saya hafal 3 command: status, restart, journalctl -u",
    ],
    troubleshooting: [
      {
        q: "Bedanya enable vs start masih membingungkan",
        a: [
          { t: "p", text: "start = 'nyalakan sekarang'. enable = 'nyalakan otomatis setiap kali mesin boot'. Keduanya terpisah! Service yang enabled tapi belum pernah start setelah konfigurasi baru? enable --now atau start manual. Cara cek status dua-duanya: systemctl status menampilkan 'enabled'/'disabled' baris sendiri." },
        ],
      },
    ],
  },
  {
    slug: "nginx-reverse-proxy",
    title: "Nginx sebagai Reverse Proxy",
    summary: "Kenapa aplikasi tidak dilayani langsung di port-nya, tapi lewat 'resepsionis' di port 80.",
    requireChecklist: true,
    content: [
      { t: "h", text: "Konsep reverse proxy dulu, config belakangan" },
      {
        t: "p",
        text: "Aplikasi Node-mu listen di port 3000. User internet tidak akan mengetik `domainmu.com:3000` — dan kamu tidak mau mengekspos port aplikasi langsung: port 80/443 adalah alamat 'resmi' web, satu-satunya yang boleh dibuka di firewall, dan satu-satunya tempat TLS (HTTPS) ditangani dengan rapi.",
      },
      { t: "diagram", key: "reverse-proxy", caption: "Reverse proxy nginx: satu pintu depan (80/443), meneruskan ke banyak pintu belakang (3000, 8000, socket php-fpm)" },
      {
        t: "p",
        text: "**nginx** (dibaca 'engine-x') berperan sebagai resepsionis gedung: semua tamu datang ke lobi (port 80), nginx yang mengantar ke ruangan yang tepat — `/api/*` ke aplikasi Node port 3000, `/` ke app PHP, dan seterusnya. Ini disebut **reverse proxy**: 'proxy' karena mewakili klien meneruskan permintaan, 'reverse' karena ia di sisi server (kebalikannya: proxy di sisi klien, misalnya untuk menembus sensor).",
      },
      {
        t: "ul",
        items: [
          "**Satu port publik untuk banyak aplikasi** — dua app di port 3000 & 8000 bisa dilayani bersamaan, bahkan beda domain.",
          "**HTTPS cukup di satu tempat** — sertifikat TLS dipasang di nginx, tidak di tiap app.",
          "**Pekerjaan infrastruktur** — serve file statis (CSS/JS/gambar) jauh lebih cepat di nginx daripada di app, plus rate limiting, gzip, header keamanan.",
          "nginx sendiri sangat ringan & stabil — ia tidak ikut mati kalau aplikasimu crash (user melihat error page, bukan connection refused).",
        ],
      },
      { t: "h", text: "Install" },
      { t: "cmd", text: "sudo apt install -y nginx", note: "di Ubuntu, paketnya sudah include konfigurasi default yang sehat" },
      { t: "cmd", text: "sudo systemctl enable --now nginx", note: "service-nya bernama nginx — kenali polanya dari Bagian 0" },
      { t: "cmd", text: "sudo ufw allow 'Nginx Full'", note: "buka port 80+443 sekaligus (ufw sudah punya profil bernama ini)" },
      {
        t: "p",
        text: "Buka http://IP_VM di browser laptop → halaman 'Welcome to nginx!' = nginx hidup dan firewall tidak menghalangi. Belum ada appmu di sana — itu tugas step berikutnya.",
      },
      { t: "h", text: "Anatomi konfigurasi (dibaca dulu, dipraktekkan di step stack)" },
      {
        t: "p",
        text: "Config nginx di /etc/nginx/ mengikuti pola: satu file 'site' di sites-available diaktifkan lewat symlink ke sites-enabled. File minimal untuk mem-proxy sebuah app:",
      },
      {
        t: "file",
        name: "/etc/nginx/sites-available/myapp",
        text: "server {\n    listen 80;\n    server_name _;                # _ = tangkap semua hostname dulu\n\n    location / {\n        proxy_pass http://127.0.0.1:3000;   # kirim ke aplikasi\n        proxy_set_header Host $host;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n}",
        note: "header X-Forwarded-* wajib: memberi tahu app 'IP & protokol asli pengunjung' karena dari sudut pandang app, semua request tampak datang dari nginx (127.0.0.1)",
      },
      { t: "cmd", text: "sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/", note: "aktifkan site" },
      { t: "cmd", text: "sudo nginx -t", note: "WAJIB sebelum reload — cek typo config. nginx tidak akan jalan dengan config rusak" },
      { t: "cmd", text: "sudo systemctl reload nginx", note: "reload = terapkan config baru tanpa memutus koneksi yang sedang jalan" },
      {
        t: "callout",
        kind: "tip",
        text: "reload vs restart di nginx: reload membangun worker baru dengan config baru sambil menyelesaikan request lama — nyaris tanpa kilatan. Kebiasaan: nginx -t dulu, reload kedua.",
      },
    ],
    checklist: [
      "nginx terinstall dan welcome page muncul di http://IP_VM",
      "Saya bisa menjelaskan reverse proxy dengan analogi resepsionis sendiri",
      "Saya tahu kenapa proxy_pass mengarah ke 127.0.0.1 (loopback, Bagian 0)",
      "Saya tahu urutan wajib: edit config → nginx -t → reload",
    ],
    troubleshooting: [
      {
        q: "Port 80 sudah dipakai (address already in use)",
        a: [
          { t: "p", text: "Cari penghuninya: sudo ss -tlnp | grep :80. Di Ubuntu desktop kadang ada apache2 atau service lain yang terpasang bawaan. Lumpuhkan yang tidak dipakai: sudo systemctl disable --now apache2." },
        ],
      },
      {
        q: "nginx -t sukses tapi reload tidak membawa perubahan",
        a: [
          { t: "p", text: "Dua tersangka: symlink sites-enabled belum dibuat (ln -s terlewat), atau browser cache — coba hard refresh (Ctrl+Shift+R) atau buka di private window." },
        ],
      },
    ],
  },
];

export const part5TailSteps: Step[] = [
  {
    slug: "tabel-perbandingan-stack",
    title: "Peta Mental: Deploy per Bahasa",
    summary: "Tabel ringkas yang menjawab 'bahasa X pakai apa?' tanpa perlu googling panik.",
    requireChecklist: true,
    content: [
      { t: "h", text: "Satu tabel untuk menyatukan semuanya" },
      {
        t: "p",
        text: "Ini jawaban yang akan terus kamu cari di tahun pertama: 'kalau bahasa/framework ini, deploy-nya gimana?' Polanya selalu dua pertanyaan: (1) apakah hasil jadinya proses long-running atau dipanggil per-request? (2) siapa yang menjaganya hidup?",
      },
      {
        t: "table",
        headers: ["Stack", "Jenis", "Penjaga proses", "Reverse proxy?", "Bukti jalan"],
        rows: [
          ["Node.js / Next.js", "Runtime-based, 1 proses long-running", "PM2 (paling simpel) atau systemd", "Ya — app di 3000, nginx di 80", "pm2 list / systemctl status"],
          ["PHP (native/Laravel)", "Per-request via FastCGI", "php-fpm (sudah process manager sendiri) di bawah nginx", "nginx adalah web server-nya langsung", "systemctl status php8.x-fpm"],
          ["Go", "Compiled, biner tunggal long-running", "systemd (unit file)", "Ya — biner di 8080, nginx di 80", "systemctl status myapp + journalctl"],
          ["Python Flask/FastAPI", "Runtime-based via WSGI/ASGI", "gunicorn/uvicorn DI BAWAH systemd", "Ya", "systemctl status + journalctl -u"],
        ],
      },
      {
        t: "p",
        text: "Satu kalimat per baris, dihafal sebagai pola, bukan isi: **runtime-based → butuh runtime di server; compiled → cukup copy biner; per-request (PHP) → web server yang memanggil per request; long-running → butuh process manager.**",
      },
      {
        t: "callout",
        kind: "info",
        text: "Ditanya stack lain (Ruby/Rails, Java/Spring, Rust, .NET)? Polanya sama: long-running → systemd (bisa, PM2 tidak), per-request seperti PHP → butuh handler FastCGI-nya masing-masing. Chatbot siap menjelaskan ini kapan pun.",
      },
    ],
    checklist: [
      "Saya bisa menjelaskan kenapa Go deploy-nya beda dari PHP",
      "Saya tahu PHP-FPM sudah 'process manager sendiri', tidak perlu PM2/systemd untuk app-nya",
      "Saya tahu nginx di depan app Node/Go/Python, tapi PHP bisa langsung di nginx",
    ],
  },
  {
    slug: "test-akses-browser",
    title: "Uji End-to-End Lokal",
    summary: "Buka IP VM di browser sebelum sibuk tunnel — pastikan mata rantai lokalnya solid dulu.",
    requireChecklist: true,
    content: [
      { t: "h", text: "Definisi 'selesai' untuk Bagian 5" },
      {
        t: "p",
        text: "Kamu lulus bagian ini kalau request ini bekerja penuh: browser laptop → http://IP_VM (port 80) → nginx → proses aplikasi-mu → halaman yang benar. Uji tiap segmen kalau hasilnya tidak sesuai:",
      },
      { t: "cmd", text: "curl -I http://127.0.0.1:80", note: "di VM: nginx menjawab di port 80? (header respons saja, -I)" },
      { t: "cmd", text: "curl -s http://127.0.0.1:3000 | head", note: "di VM: aplikasi menjawab langsung? sesuaikan port ke stack-mu" },
      { t: "cmd", text: "curl -s http://IP_VM/ | head", note: "dari VM juga boleh, atau PowerShell host: lewat nginx dari 'luar'" },
      {
        t: "ol",
        items: [
          "Langkah 1 gagal tapi 2 sukses → nginx/reload/syntax config.",
          "Langkah 2 gagal → proses aplikasi mati atau port salah: pm2 list / systemctl status.",
          "Keduanya sukses di 127.0.0.1 tapi browser host gagal → firewall (ufw allow 80) atau IP salah.",
          "Semua sukses → SELAMAT. Stack-nya hidup end-to-end. Lanjut ke Bagian 6 untuk membuatnya bisa diakses dunia.",
        ],
      },
      {
        t: "callout",
        kind: "tip",
        text: "Kebiasaan mendiagnosis 'potong mata rantai dari tengah' (uji internal dulu, baru eksternal) adalah skill debugging server nomor satu — kamu akan memakainya selamanya, termasuk saat tunnel nanti error.",
      },
    ],
    checklist: [
      "curl localhost di VM: nginx 200, aplikasi 200",
      "Browser host ke http://IP_VM menampilkan aplikasi (bukan welcome nginx)",
      "Service-ku enable (tahan reboot) — tes cepat: sudo reboot, lalu cek status lagi",
    ],
  },
];
