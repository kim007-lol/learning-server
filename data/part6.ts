import type { Part } from "@/lib/types";

export const part6: Part = {
  id: 6,
  title: "Bagian 6 — Expose ke Internet dengan Cloudflare Tunnel",
  desc: "Tanpa IP publik, tanpa buka port router: VM di kolong meja-mu online dengan domain sendiri.",
  steps: [
    {
      slug: "kenapa-cloudflare-tunnel",
      title: "Kenapa Butuh Cloudflare Tunnel",
      summary: "Masalah IP publik & bagaimana tunnel membalik arah koneksi.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Dinding yang kita temui di Bagian 0" },
        {
          t: "p",
          text: "Ingat: IP-mu di rumah adalah IP PRIVAT — internet tidak bisa mengetuknya. Cara klasik untuk tetap bisa diakses: **port forwarding** di router + IP publik statis dari ISP (biasanya paket business mahal) — atau **Cloudflare Tunnel** yang tidak butuh keduanya.",
        },
        { t: "diagram", key: "tunnel", caption: "Cloudflare Tunnel: VM membangun koneksi KELUAR ke Cloudflare (arah yang selalu diizinkan firewall/NAT), lalu Cloudflare mengirim trafik pengunjung MELEWATI terowongan yang sudah terbuka itu" },
        {
          t: "p",
          text: "Kunci pemahamannya: firewall/NAT memblokir masuk, tapi membolehkan keluar (browser-mu bisa browsing kan?). **cloudflared** (binary resmi Cloudflare) memanfaatkan itu: ia membuat koneksi keluar ke jaringan Cloudflare dan MENAHAN-nya terbuka, menjadi terowongan dua arah. Pengunjung → Cloudflare (punya IP publik, TLS, DDoS protection) → terowongan → VM → nginx → app. Router tidak disentuh, IP publik tidak dibeli, port tidak dibuka.",
        },
        {
          t: "table",
          headers: ["Cara", "Butuh IP publik?", "Ubah router?", "Catatan"],
          rows: [
            ["Port forwarding", "Ya (statis)", "Ya — buka port", "Umum di rumah: IP berubah-ubah, repot"],
            ["Cloudflare Tunnel", "Tidak", "Tidak", "Gratis; trafik lewat jaringan CF; butuh akun CF"],
            ["VPS/cloud (Bagian 7)", "Punyanya sudah publik", "Tidak", "Pada akhirnya ini jalur produksi normal"],
          ],
        },
        {
          t: "callout",
          kind: "info",
          text: "Bonus arsitektur ini: karena pengunjung hanya 'melihat' Cloudflare, IP asli VM-mu tidak pernah terekspos, dan Cloudflare menyaring serangan & menangani HTTPS otomatis. Kekurangannya, jujur saja: trafikmu lewat infrastruktur pihak ketiga (ada batas bandwidth untuk plan gratis) — cukup untuk belajar, portofolio, atau app pribadi.",
        },
      ],
      checklist: [
        "Saya bisa menjelaskan 'membalik arah koneksi' dengan kalimat sendiri",
        "Saya paham kenapa firewall rumahan tidak menghalangi tunnel",
        "Saya tahu bedanya tunnel vs port forwarding klasik",
      ],
    },
    {
      slug: "prasyarat-domain-cloudflare",
      title: "Prasyarat: Domain & Nameserver Cloudflare",
      summary: "Domain yang nameserver-nya di Cloudflare — atau skip pakai subdomain trycloudflare untuk tes.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Dua jalur — pilih salah satu" },
        {
          t: "p",
          text: "Untuk tunnel dengan domain sendiri, Cloudflare harus jadi 'penjaga buku telepon' (nameserver) domainmu (Ingat Bagian 0, topik DNS?). Syarat: punya akun Cloudflare gratis (dash.cloudflare.com) dan satu domain.",
        },
        {
          t: "ol",
          items: [
            "**Jalur A — sudah punya domain (misal dari .com/.id favoritmu)**: Site add di dashboard Cloudflare → pilih plan Free → Cloudflare menampilkan 2 nameserver (misal `ana.ns.cloudflare.com`, `lee.ns.cloudflare.com`) → login ke tempat kamu beli domain → cari menu 'Nameservers' → ganti ke dua nama itu → tunggu (hitungan menit s/d 24 jam; cek status aktif di dashboard). Domain juga bisa dibeli langsung lewat Cloudflare Registrar (harga modal) untuk satu pintu.",
            "**Jalur B — belum punya domain? Quick tunnel**: `cloudflared tunnel --url http://localhost:3000` menghasilkan URL acak `https://xxx-yyy.trycloudflare.com` tanpa akun, tanpa domain — bagus untuk DEMO konsep, tapi URL-nya berubah tiap start ulang dan tidak untuk permanen. Web ini lanjut dengan jalur A; catat quick tunnel sebagai alternatif tes.",
          ],
        },
        {
          t: "callout",
          kind: "warn",
          text: "Kalau nameserver belum aktif, tunnel tetap 'terhubung' tapi DNS domain belum menunjuk ke Cloudflare → pengunjung tidak akan sampai. Ini penyebab #1 'tunnel saya jalan tapi tidak bisa dibuka' — cek status aktif di dashboard sebelum panik.",
        },
      ],
      checklist: [
        "Akun Cloudflare gratis dibuat",
        "Domain ditambahkan ke dashboard (zone aktif) ATAU aku sengaja pakai quick tunnel",
        "Nameserver sudah diset ke Cloudflare (status Active di dashboard)",
      ],
      troubleshooting: [
        {
          q: "Sudah ganti nameserver berjam-jam tapi belum Active",
          a: [
            { t: "p", text: "Propagasi DNS memang bertahap (cache global). Cek objektif dari terminal: `nslookup -type=ns domainmu.com` — kalau jawaban sudah nama cloudflare, tinggal tunggu sisi Cloudflare-nya scan. Di atas 24 jam baru curiga ada typo saat menyalin." },
          ],
        },
      ],
    },
    {
      slug: "install-cloudflared",
      title: "Install cloudflared",
      summary: "Binary agen tunnel dipasang & diverifikasi di VM.",
      requireChecklist: true,
      content: [
        {
          t: "p",
          text: "cloudflared berjalan di DALAM server (VM) — dialah yang membuat koneksi keluar. Ambil dari repo apt resmi Cloudflare (update otomatis mengikuti apt):",
        },
        { t: "cmd", text: "sudo mkdir -p --mode=0755 /usr/share/keyrings", note: "tempat menyimpan kunci verifikasi repo" },
        { t: "cmd", text: "sudo curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg -o /usr/share/keyrings/cloudflare-main.gpg", note: "unduh GPG key resmi — alasan perintah apt bisa percaya sumber ini" },
        { t: "cmd", text: "echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list", note: "daftarkan repo ke apt" },
        { t: "cmd", text: "sudo apt update && sudo apt install -y cloudflared", note: "" },
        { t: "cmd", text: "cloudflared --version", note: "bukti terpasang" },
        {
          t: "p",
          text: "Alternatif satu-baris kalau repo bermasalah: unduh binary langsung dari github.com/cloudflare/cloudflared/releases terbaru → chmod +x → pindahkan ke /usr/local/bin. Lihat dulu pola lama yang kamu kenal.",
        },
      ],
      checklist: [
        "cloudflared --version menampilkan versi",
        "Aku paham cloudflared berjalan di sisi server, bukan di Cloudflare",
      ],
    },
    {
      slug: "login-dan-buat-tunnel",
      title: "Login & Buat Tunnel",
      summary: "Autentikasi browser + tunnel pertama dengan identitas resminya.",
      requireChecklist: true,
      content: [
        { t: "h", text: "1. Login" },
        {
          t: "p",
          text: "Sesi SSH-mu bisa meneruskan URL-nya, tapi lebih mudah dari terminal desktop VM:",
        },
        { t: "cmd", text: "cloudflared tunnel login", note: "membuka browser untuk authorize akun & pilih zone domain" },
        {
          t: "p",
          text: "Kalau muncul 'A browser is required... Please visit the URL' di sesi SSH: salin URL-nya, buka di browser laptop, authorize, pilih domain. Lalu (cloudflared tidak bisa otomatis kembali ke SSH-mu) cek `ls ~/.cloudflared/` — kalau cert.pem belum muncul, jalankan login dari desktop VM atau ikuti instruksi lanjutannya.",
        },
        { t: "h", text: "2. Buat tunnel" },
        { t: "cmd", text: "cloudflared tunnel create web-journey", note: "nama bebas; menghasilkan credentials web-journey.json + tunnel UUID" },
        {
          t: "ul",
          items: [
            "**Tunnel = identitas**, belum tahu mau melayani apa — konfigurasi rute (ingress) di step berikutnya.",
            "File JSON credentials adalah 'kartu akses'-nya; jangan bocorkan.",
            "`cloudflared tunnel list` untuk melihat yang sudah dibuat.",
          ],
        },
      ],
      checklist: [
        "login berhasil & cert.pem tersimpan di ~/.cloudflared/",
        "tunnel create sukses, keluar JSON credentials",
        "cloudflared tunnel list menampilkan web-journey",
      ],
    },
    {
      slug: "konfigurasi-tunnel",
      title: "Konfigurasi Tunnel (config.yml + DNS route)",
      summary: "Beri tahu tunnel: hostname mana → port berapa. Jembatan antara DNS dan aplikasimu.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Isi kepala dulu: ingress = peta rute" },
        {
          t: "p",
          text: "config.yml menjawab: 'kalau ada yang masuk ke hostname X, teruskan ke service lokal mana?'. Ini analog persis location block nginx — dua reverse proxy sekarang tersambung: Cloudflare edge → terowongan → cloudflared → nginx (atau langsung port app).",
        },
        {
          t: "file",
          name: "~/.cloudflared/config.yml",
          text: "tunnel: TUNNEL_UUID   # dari output create / cloudflared tunnel list\ncredentials-file: /home/USERNAME/.cloudflared/TUNNEL_UUID.json\n\ningress:\n  - hostname: app.domainmu.com\n    service: http://localhost:80     # lewat nginx (rekomendasi)\n  # service: http://localhost:3000  # ATAU langsung ke app tanpa nginx\n  - service: http_status:404        # aturan catch-all wajib: selain rute atas → 404",
          note: "UUID + path credentials dari hasil cloudflared tunnel create. hostname: subdomain pilihanmu di bawah domain yang aktif di Cloudflare",
        },
        { t: "h", text: "Pilih rute: nginx atau langsung?" },
        {
          t: "ul",
          items: [
            "**→ localhost:80 (nginx)** — pilih ini: aturan HTTPS/header/logging-mu terpusat di nginx, tunnel cuma 'pipa'. Konsisten dengan arsitektur yang sudah dibangun.",
            "→ localhost:3000 (langsung app) — lebih pendek tapi bypass nginx; hanya praktis kalau memang tidak pakai nginx.",
          ],
        },
        { t: "h", text: "1. Rute DNS → tunnel" },
        { t: "cmd", text: "cloudflared tunnel route dns web-journey app.domainmu.com", note: "otomatis membuat CNAME record di zone Cloudflare — kamu tidak perlu sentuh dashboard DNS" },
        { t: "h", text: "2. Uji manual sebelum jadikan service" },
        { t: "cmd", text: "cloudflared tunnel run web-journey", note: "biarkan jendela SSH ini terbuka — tunnel aktif selama prosesnya hidup" },
        {
          t: "p",
          text: "Buka `https://app.domainmu.com` dari browser HP-mu memakai data seluler (BUKAN wifi rumah yang sama) → halaman aplikasi muncul? Beres — dunia sudah bisa mengakses VM di kamarmu. (Beri ~1-2 menit agar DNS route tersinkron.) Ctrl+C untuk menghentikan — step berikutnya membuatnya permanen.",
        },
      ],
      checklist: [
        "config.yml diisi dengan UUID & credentials path yang benar",
        "route dns sukses (cek: record CNAME muncul di dashboard DNS)",
        "https://subdomain-mu terbuka dari browser HP (data seluler) — minimal sekali",
      ],
      troubleshooting: [
        {
          q: "Error 1033 / DNS resolution is not configured",
          a: [{ t: "p", text: "route dns belum dijalankan atau hostname di config ≠ hostname yang dirute. Cek `cloudflared tunnel route dns list web-journey` dan cocokkan ejaan persis dengan config.yml." }],
        },
        {
          q: "Error 1101 / tunnel tidak mau connect",
          a: [
            { t: "p", text: "cloudflared gagal membuat koneksi keluar: cek internet VM (ping 1.1.1.1). Kalau nameserver belum aktif di Cloudflare, domain juga tidak resolve. Run manual dengan `cloudflared tunnel run --loglevel debug web-journey` untuk melihat tahap kegagalannya." },
          ],
        },
        {
          q: "Domain utama ( apex, domainmu.com tanpa subdomain) bisa?",
          a: [{ t: "p", text: "Bisa — hostname di config & route dns isi domainmu.com tanpa prefix. Untuk belajar lebih jelas pakai subdomain dulu." }],
        },
      ],
    },
    {
      slug: "tunnel-jadi-service",
      title: "Jalankan Tunnel sebagai Service",
      summary: "Terapkan semua yang sudah dipelajari: cloudflared harus auto-start saat VM boot.",
      requireChecklist: true,
      content: [
        {
          t: "p",
          text: "Tunnel yang hanya hidup selama jendela SSH terbuka = bukan server. Ini momen semua konsep Bagian 5 menyatu — install-nya bahkan membuatkan unit systemd untukmu:",
        },
        {
          t: "callout",
          kind: "info",
          text: "cloudflared service install membaca config dari ~/.cloudflared dan menyalin unit-nya ke sisi root (service berjalan sebagai user cloudflare). Setelah install, jalankan sekali dengan sudo karena service root tidak bisa membaca credentials-mu sebelum disalin.",
        },
        { t: "cmd", text: "sudo cloudflared service install", note: "membuat & enable service cloudflared (lihat: ada unit .service baru di systemd!)" },
        { t: "cmd", text: "sudo systemctl status cloudflared", note: "active (running)?" },
        { t: "cmd", text: "journalctl -u cloudflared -f", note: "log tunnel — 'registered with edge' menandakan terowongan tersambung" },
        { t: "h", text: "Uji ketahanan (melelahkan tapi penting)" },
        {
          t: "ol",
          items: [
            "`sudo reboot` VM-mu. Jangan sentuh apa-apa.",
            "Setelah login: tanpa menjalankan apa pun, cek `systemctl status cloudflared` — hidup sendiri.",
            "Buka domain dari browser HP. Habis reboot, domain tetap bisa diakses TANPA start apa pun. Kamu resmi punya server yang survive reboot. 🎉",
          ],
        },
        {
          t: "p",
          text: "Kalau kamu pernah menjalankan `cloudflared tunnel run` manual dan service juga hidup, dua instance akan saling berebut koneksi (yang lama 'mencuri' jalur tunnel) — selalu hentikan yang manual sebelum service install.",
        },
      ],
      checklist: [
        "systemctl status cloudflared: active + enabled",
        "VM sudah kureboot dan domain tetap bisa diakses TANPA start apa pun",
        "Aku paham unit service cloudflared yang tadi dibuat = konsep bagian 5 yang sama",
      ],
      troubleshooting: [
        {
          q: "Service error 'TUNNEL_TOKEN' atau tidak baca config",
          a: [{ t: "p", text: "service install perlu config di lokasi yang terbaca root. Jalankan dari user yang memiliki ~/.cloudflared/config.yml; jika tetap gagal, cara modern: `cloudflared tunnel login` tidak wajib — buat tunnel di dashboard Zero Trust (online wizard) dan pakai TOKEN-nya: sudo cloudflared service install <TOKEN>. Keduanya sah; config.yml + login adalah jalur yang kita pelajari di sini." }],
        },
      ],
    },
    {
      slug: "test-akhir-end-to-end",
      title: "Tes Akhir: End-to-End",
      summary: "Verifikasi rantai penuh — dan kemampuan membacanya dari satu request.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Rantai yang akan kamu uji" },
        {
          t: "p",
          text: "Browser (internet) → DNS Cloudflare resolve → edge Cloudflare (TLS berhenti di sini) → terowongan cloudflared → VM → nginx:80 → 127.0.0.1:3000 (atau backend stack-mu) → respons pulang.",
        },
        { t: "diagram", key: "tunnel-vs-port-forward", caption: "Bandingkan: cara lama menancapkan lubang di router; tunnel membuat VM yang mengulurkan tangan keluar" },
        {
          t: "ol",
          items: [
            "Buka dari jaringan seluler (bukan wifi rumah): https://domainmu — harus HTTPS, halaman benar.",
            "Cek chain of trust: klik gembok di browser → sertifikat penerbit = Cloudflare (bukan Let's Encrypt) — bukti trafik benar-benar lewat Cloudflare.",
            "Matikan nginx sebentar (sudo systemctl stop nginx) → domain menampilkan 502/cloudflare error page, BUKAN halaman lama = rute benar. Nyalakan lagi.",
            "Update sesuatu di aplikasi-mu → terlihat dalam hitungan detik end-to-end.",
          ],
        },
        {
          t: "callout",
          kind: "tip",
          text: "Setiap titik kegagalan di rantai ini punya gejala uniknya sendiri (DNS resolve vs tunnel registered vs 502 nginx vs app crash) — kebiasaan membaca 'siapa yang menjawab' saat error adalah 80% skill debugging produksi.",
        },
      ],
      checklist: [
        "Domain terbuka dari internet sungguhan (data seluler)",
        "Aku bisa menunjuk siapa yang menyajikan error page saat nginx dimatikan",
        "Seluruh stack tahan reboot — dibuktikan",
      ],
    },
  ],
};
