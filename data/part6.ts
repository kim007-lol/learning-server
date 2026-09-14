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
      title: "Setup Domain & Hubungkan ke Cloudflare",
      summary: "Dari beli domain sampai nameserver aktif di Cloudflare — panduan klik demi klik.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Tiga pihak yang harus kamu kenal" },
        {
          t: "p",
          text: "Sebelum menyentuh dashboard mana pun, pahami dulu **siapa melakukan apa** — ini sumber kebingungan #1 pemula:",
        },
        { t: "diagram", key: "registrar-cloudflare-server", caption: "Registrar = toko tempat beli domain. Cloudflare = manajer lalu lintas & satpam. Server/Vercel = dapur tempat app berjalan." },
        {
          t: "table",
          headers: ["Pihak", "Peran", "Contoh"],
          rows: [
            ["**Registrar**", "Tempat kamu BELI/SEWA domain (bayar tahunan). Setelah beli, kamu bisa mengarahkan nameserver ke mana saja.", "Niagahoster, Domainesia, IDCloudHost, Namecheap, GoDaddy, Cloudflare Registrar"],
            ["**Cloudflare**", "Manajer DNS (buku telepon) + proteksi DDoS + CDN + SSL gratis. Dia yang menjawab 'IP-nya domain ini apa?' ke seluruh dunia.", "dash.cloudflare.com"],
            ["**Server / Platform**", "Tempat aplikasi berjalan. Bisa VM sendiri (lewat tunnel), VPS, atau platform seperti Vercel/Netlify.", "VM-mu, DigitalOcean, Vercel, Railway"],
          ],
        },
        {
          t: "callout",
          kind: "info",
          text: "Analogi: Registrar = kantor pencatatan nama toko. Cloudflare = satpam + papan petunjuk arah di depan toko. Server = toko fisiknya sendiri. Kamu beli nama di Registrar, lalu bilang 'yang pegang papan petunjuk arah saya adalah Cloudflare' — itu delegasi nameserver.",
        },
        { t: "h", text: "Langkah 1 — Beli domain (jika belum punya)" },
        {
          t: "p",
          text: "Pilih registrar mana saja — yang penting domainnya sudah jadi milikmu. Beberapa opsi populer:",
        },
        {
          t: "ul",
          items: [
            "**Cloudflare Registrar** (dash.cloudflare.com → Domain Registration → Register Domain) — harga modal (tanpa markup), langsung terintegrasi, nameserver otomatis Cloudflare. Paling sedikit langkahnya.",
            "**Registrar Indonesia** (Niagahoster, Domainesia, IDCloudHost) — pilihan lokal, bayar via bank transfer/e-wallet. Domain `.my.id` / `.co.id` murah, cocok untuk belajar.",
            "**Registrar internasional** (Namecheap, Porkbun, GoDaddy) — banyak promo tahun pertama, bayar via kartu.",
          ],
        },
        {
          t: "callout",
          kind: "tip",
          text: "Untuk belajar, domain `.my.id` sering harga ±Rp 10.000–15.000/tahun di registrar Indonesia — paling murah. Kalau beli langsung di Cloudflare Registrar, nameserver langsung otomatis aktif dan kamu bisa skip Langkah 3.",
        },
        { t: "h", text: "Langkah 2 — Buat akun Cloudflare & tambahkan domain" },
        {
          t: "ol",
          items: [
            "Buka **dash.cloudflare.com** → Sign Up (gratis).",
            "Setelah login, klik **\"Add a Site\"** (atau \"Add a Domain\") di halaman utama.",
            "Ketik nama domain-mu (misal `domainmu.com` atau `domainmu.my.id`) → klik **Add site**.",
            "Pilih paket **Free** (gratis, sudah lebih dari cukup) → klik **Continue**.",
            "Cloudflare akan scan DNS record yang sudah ada (kalau domain baru, biasanya kosong). Klik **Continue**.",
            "Cloudflare menampilkan **2 nameserver** yang harus kamu set di registrar. Contoh: `ana.ns.cloudflare.com` dan `lee.ns.cloudflare.com`. **CATAT atau screenshot kedua nama ini.**",
          ],
        },
        { t: "h", text: "Langkah 3 — Ganti nameserver di registrar" },
        {
          t: "p",
          text: "Ini langkah paling krusial: kamu memberitahu dunia 'yang memegang buku telepon domain saya sekarang adalah Cloudflare'. Caranya berbeda tiap registrar, tapi polanya selalu sama:",
        },
        {
          t: "ol",
          items: [
            "Login ke **panel registrar** tempat kamu beli domain.",
            "Cari menu **Domain Management** / **Kelola Domain** → pilih domain-mu.",
            "Cari bagian **Nameservers** (kadang di tab DNS, kadang di 'Change Nameservers' atau 'Custom NS').",
            "Ganti dari nameserver default registrar ke **2 nameserver Cloudflare** yang tadi kamu catat. Hapus yang lama, isi yang baru.",
            "Simpan perubahan.",
          ],
        },
        {
          t: "table",
          headers: ["Registrar", "Lokasi menu Nameserver"],
          rows: [
            ["Niagahoster", "Member Area → Domain → Kelola → Overview → Ubah Nameserver"],
            ["Domainesia", "Clientarea → Domains → domain kamu → Nameservers"],
            ["Namecheap", "Dashboard → Domain List → Manage → Nameservers → Custom DNS"],
            ["GoDaddy", "My Products → DNS → Nameservers → Change → Enter my own nameservers"],
            ["Cloudflare Registrar", "Otomatis — tidak perlu ganti apa-apa! 🎉"],
          ],
        },
        { t: "h", text: "Langkah 4 — Tunggu propagasi & verifikasi" },
        {
          t: "p",
          text: "Setelah menyimpan, **propagasi nameserver** butuh waktu — bisa 5 menit, bisa 24 jam (biasanya 15–60 menit). Selama menunggu:",
        },
        {
          t: "ul",
          items: [
            "Cek status di **dashboard Cloudflare** → domain-mu → kalau sudah berubah dari 'Pending Nameserver Update' ke **'Active'**, selesai.",
            "Verifikasi dari terminal: `nslookup -type=ns domainmu.com 8.8.8.8` — kalau jawaban menampilkan nama `*.ns.cloudflare.com`, nameserver sudah tersebar.",
            "Kalau sudah lewat 24 jam dan belum Active: kemungkinan besar **typo** saat menyalin nameserver, atau registrar belum memproses (coba save ulang).",
          ],
        },
        { t: "cmd", text: "nslookup -type=ns domainmu.com 8.8.8.8", note: "ganti domainmu.com dengan domain aslimu — jawaban harus *.ns.cloudflare.com" },
        { t: "h", text: "Langkah 5 — Mengenal DNS record di dashboard Cloudflare" },
        {
          t: "p",
          text: "Setelah domain Active, buka menu **DNS → Records** di dashboard Cloudflare. Di sinilah kamu menambah, mengubah, dan menghapus 'buku telepon' domain-mu. Record yang paling sering dipakai:",
        },
        { t: "diagram", key: "dns-record-types", caption: "A record langsung menunjuk ke IP. CNAME adalah alias ke nama lain. NS menentukan siapa otoritas DNS-nya." },
        {
          t: "table",
          headers: ["Tipe Record", "Fungsi", "Contoh"],
          rows: [
            ["**A**", "Mengarahkan nama → IP address (IPv4)", "domainmu.com → 76.76.21.21"],
            ["**AAAA**", "Sama seperti A, tapi untuk IPv6", "domainmu.com → 2606:4700::1"],
            ["**CNAME**", "Mengarahkan nama → nama lain (alias)", "server.domainmu.com → cname.vercel-dns.com"],
            ["**NS**", "Menentukan nameserver otoritas", "domainmu.com → ana.ns.cloudflare.com"],
            ["**TXT**", "Teks bebas (sering untuk verifikasi kepemilikan)", "domainmu.com → \"v=spf1 ...\""],
            ["**CAA**", "Mengatur siapa boleh menerbitkan SSL untuk domain ini", "domainmu.com → 0 issue \"pki.goog\""],
          ],
        },
        {
          t: "p",
          text: "Cara menambah record: klik **Add record** → pilih Type → isi Name (subdomain atau `@` untuk root) → isi Value (IP atau target CNAME) → pilih TTL (biarkan Auto) → klik **Save**.",
        },
        { t: "h", text: "Fitur kunci: Proxy Status (Awan Oranye vs Abu-abu)" },
        {
          t: "p",
          text: "Di sebelah setiap DNS record, ada toggle awan berwarna. Ini fitur unik Cloudflare yang WAJIB kamu pahami — salah setting di sini adalah penyebab error #1 pemula:",
        },
        {
          t: "table",
          headers: ["Status", "Ikon", "Trafik lewat", "Efek"],
          rows: [
            ["**Proxied**", "☁️ Awan Oranye", "User → Cloudflare → Server", "IP asli server tersembunyi. Dapat DDoS protection, CDN, caching, analytics, SSL Cloudflare. **Tapi**: Cloudflare yang meng-handle SSL, jadi setting SSL/TLS mode harus benar."],
            ["**DNS Only**", "☁️ Awan Abu-abu", "User → langsung ke Server", "Cloudflare hanya jadi DNS resolver biasa. IP asli server terekspos. Server harus handle SSL-nya sendiri (atau platform seperti Vercel yang handle)."],
          ],
        },
        {
          t: "callout",
          kind: "warn",
          text: "Aturan emas: saat setup pertama kali, **selalu mulai dengan DNS Only (abu-abu)** sampai semua berfungsi. Baru setelah yakin jalan, aktifkan Proxied (oranye) jika ingin fitur Cloudflare. Ini menghindari 90% masalah SSL loop dan ERR_TOO_MANY_REDIRECTS.",
        },
        { t: "h", text: "Kapan pakai Proxied vs DNS Only?" },
        {
          t: "ul",
          items: [
            "**Cloudflare Tunnel (VM server sendiri)**: record CNAME yang dibuat oleh `cloudflared tunnel route dns` otomatis Proxied — biarkan apa adanya, tunnel sudah di-design untuk ini.",
            "**Vercel / Netlify**: mulai dengan **DNS Only** sampai SSL terbit. Jika ingin aktifkan Proxied nanti, SSL/TLS mode di Cloudflare harus diset ke **Full (Strict)** — bukan Flexible!",
            "**VPS dengan IP publik**: A record ke IP VPS, Proxied menyembunyikan IP asli — bagus untuk keamanan.",
          ],
        },
      ],
      checklist: [
        "Aku punya domain (dibeli dari registrar mana saja)",
        "Akun Cloudflare gratis sudah dibuat",
        "Domain ditambahkan ke dashboard Cloudflare (status Active)",
        "Nameserver di registrar sudah diganti ke nameserver Cloudflare",
        "Aku paham cara menambah DNS record (A/CNAME) di dashboard Cloudflare",
        "Aku paham bedanya Proxy Status: awan oranye (Proxied) vs abu-abu (DNS Only)",
      ],
      troubleshooting: [
        {
          q: "Sudah ganti nameserver berjam-jam tapi belum Active",
          a: [
            { t: "p", text: "Propagasi DNS memang bertahap (cache global). Cek objektif dari terminal: `nslookup -type=ns domainmu.com 8.8.8.8` — kalau jawaban sudah nama cloudflare, tinggal tunggu sisi Cloudflare-nya scan. Di atas 24 jam baru curiga ada typo saat menyalin. Coba juga: klik 'Re-check now' di dashboard Cloudflare untuk memaksa pengecekan ulang." },
          ],
        },
        {
          q: "Registrar-ku tidak punya menu 'Custom Nameserver'",
          a: [
            { t: "p", text: "Beberapa registrar menyembunyikannya di menu lain: coba cari 'DNS Management', 'Name Server', atau 'NS Record'. Kalau benar-benar tidak ada (jarang terjadi), hubungi support registrar dan minta mereka mengubahnya secara manual — ini hak kamu sebagai pemilik domain." },
          ],
        },
        {
          q: "Aku beli domain langsung di Cloudflare, perlu ganti nameserver?",
          a: [
            { t: "p", text: "TIDAK — kalau domain dibeli lewat Cloudflare Registrar, nameserver otomatis sudah Cloudflare. Kamu bisa langsung lanjut ke langkah berikutnya. Ini keuntungan utama beli domain di Cloudflare: satu pintu, tanpa ribet." },
          ],
        },
      ],
    },
    {
      slug: "domain-vercel-cloudflare",
      title: "Jalur Vercel: Domain + Cloudflare + Vercel untuk Frontend",
      summary: "Deploy frontend (React/Next.js/static site) di Vercel dengan custom domain lewat Cloudflare DNS.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Kapan pakai jalur ini?" },
        {
          t: "p",
          text: "Kalau aplikasimu adalah **frontend-only** (React, Next.js, Vue, static HTML) yang tidak butuh server VM sendiri — Vercel/Netlify sudah menyediakan hosting gratis dengan CI/CD otomatis dari GitHub. Kamu cukup push ke repo, Vercel build & deploy otomatis. Yang perlu diatur: **custom domain lewat Cloudflare DNS** supaya aksesnya pakai nama profesional, bukan `namaproject.vercel.app`.",
        },
        { t: "diagram", key: "vercel-cloudflare-flow", caption: "User → Cloudflare DNS (resolve) → Vercel CDN (serve app) → response. Tidak ada VM, tidak ada nginx, tidak ada tunnel." },
        {
          t: "table",
          headers: ["", "Cloudflare Tunnel + VM", "Vercel + Cloudflare DNS"],
          rows: [
            ["Cocok untuk", "Backend API, full-stack, database, custom server", "Frontend/static site, JAMstack, Next.js SSR (tanpa infra sendiri)"],
            ["Server sendiri?", "Ya — VM/VPS-mu yang menjalankan app", "Tidak — Vercel yang menjalankan"],
            ["Biaya server", "Gratis (VM lokal) atau $4-6/bln (VPS)", "Gratis (Vercel Free tier)"],
            ["SSL", "Otomatis dari Cloudflare (lewat tunnel)", "Otomatis dari Vercel (Let's Encrypt / Google)"],
            ["Setup", "Install cloudflared + config tunnel", "Klik-klik di dashboard Vercel + 1 DNS record"],
          ],
        },
        { t: "h", text: "Step 1 — Deploy project ke Vercel" },
        {
          t: "ol",
          items: [
            "Push kode-mu ke **GitHub repository** (sudah harus ada di GitHub).",
            "Buka **vercel.com** → Sign Up / Login (bisa pakai akun GitHub langsung).",
            "Klik **New Project** → Import dari GitHub → pilih repo-mu.",
            "Vercel otomatis mendeteksi framework (Next.js, React, dll) → klik **Deploy**.",
            "Tunggu build selesai → project-mu sudah live di `namaproject.vercel.app`. 🎉",
          ],
        },
        { t: "h", text: "Step 2 — Tambahkan custom domain di Vercel" },
        {
          t: "ol",
          items: [
            "Di dashboard Vercel, buka project-mu → **Settings** → **Domains**.",
            "Ketik domain/subdomain yang ingin dipakai, misal: `server.domainmu.com` atau `domainmu.com` → klik **Add**.",
            "Vercel akan menampilkan instruksi DNS yang harus kamu set:",
          ],
        },
        {
          t: "table",
          headers: ["Jenis domain", "Tipe record", "Name", "Value"],
          rows: [
            ["**Subdomain** (server.domainmu.com)", "CNAME", "server", "cname.vercel-dns.com"],
            ["**Root/Apex** (domainmu.com)", "A", "@", "76.76.21.21"],
          ],
        },
        { t: "h", text: "Step 3 — Tambahkan DNS record di Cloudflare" },
        {
          t: "ol",
          items: [
            "Buka **dash.cloudflare.com** → pilih domain-mu → **DNS** → **Records**.",
            "Klik **Add record**.",
            "Untuk **subdomain** (misal `server.domainmu.com`): Type = **CNAME**, Name = **server**, Target = **cname.vercel-dns.com**, Proxy status = **DNS Only (awan abu-abu)**.",
            "Untuk **root domain** (misal `domainmu.com`): Type = **A**, Name = **@**, IPv4 = **76.76.21.21**, Proxy status = **DNS Only (awan abu-abu)**.",
            "Klik **Save**.",
          ],
        },
        {
          t: "callout",
          kind: "warn",
          text: "PENTING: Saat pertama kali setup, pastikan Proxy Status = **DNS Only (awan abu-abu)**. Ini agar Vercel bisa menerbitkan sertifikat SSL tanpa halangan dari Cloudflare proxy. Kalau langsung di-set oranye, SSL Vercel bisa gagal terbit dan domain menampilkan error.",
        },
        { t: "h", text: "Step 4 — Tunggu verifikasi & SSL" },
        {
          t: "p",
          text: "Kembali ke halaman Domains di Vercel — statusnya akan berubah dari ⏳ ke ✅ dalam hitungan menit. Vercel otomatis menerbitkan sertifikat SSL. Kalau sudah ✅, buka `https://server.domainmu.com` di browser — seharusnya sudah jalan.",
        },
        { t: "h", text: "Step 5 (Opsional) — Aktifkan Cloudflare Proxy setelah jalan" },
        {
          t: "p",
          text: "Setelah domain sudah jalan dan SSL Vercel sudah terbit, kamu **boleh** mengaktifkan Proxied (awan oranye) untuk mendapat fitur Cloudflare (DDoS protection, analytics, caching). Tapi ada syarat wajib:",
        },
        {
          t: "ol",
          items: [
            "Buka **Cloudflare dashboard** → domain-mu → **SSL/TLS** → **Overview**.",
            "Ubah mode dari **Flexible** ke **Full** (atau lebih baik **Full (Strict)**).",
            "Baru setelah itu, kembali ke DNS → edit record → ubah Proxy Status ke **Proxied (awan oranye)**.",
          ],
        },
        {
          t: "table",
          headers: ["SSL Mode", "Arti", "Dengan Vercel?"],
          rows: [
            ["**Flexible**", "Cloudflare → Server tanpa HTTPS", "❌ JANGAN — menyebabkan redirect loop (ERR_TOO_MANY_REDIRECTS)"],
            ["**Full**", "Cloudflare → Server dengan HTTPS (sertifikat tidak diverifikasi)", "✅ Boleh — tapi kurang aman"],
            ["**Full (Strict)**", "Cloudflare → Server dengan HTTPS + sertifikat valid", "✅ REKOMENDASI — Vercel punya sertifikat valid"],
          ],
        },
        {
          t: "callout",
          kind: "tip",
          text: "Ingat urutan aman: (1) DNS Only dulu → (2) tunggu SSL Vercel terbit → (3) ubah SSL mode ke Full (Strict) → (4) baru nyalakan Proxied. Urutan ini mencegah 99% masalah.",
        },
        { t: "h", text: "Tambahan: CAA Record (kalau SSL gagal terbit)" },
        {
          t: "p",
          text: "Kadang SSL Vercel gagal terbit karena domain-mu punya **CAA record** yang membatasi siapa yang boleh menerbitkan sertifikat. Solusi: tambahkan CAA record di Cloudflare DNS untuk CA yang dipakai Vercel:",
        },
        {
          t: "table",
          headers: ["Type", "Name", "Tag", "Value"],
          rows: [
            ["CAA", "@", "issue", "pki.goog"],
            ["CAA", "@", "issue", "sectigo.com"],
            ["CAA", "@", "issue", "letsencrypt.org"],
          ],
        },
        {
          t: "p",
          text: "Atau kalau tidak ada CAA record sama sekali (kosong), **biarkan kosong** — artinya semua CA boleh menerbitkan, dan SSL akan terbit tanpa masalah.",
        },
      ],
      checklist: [
        "Project sudah di-deploy di Vercel (live di namaproject.vercel.app)",
        "Custom domain ditambahkan di Settings → Domains Vercel",
        "DNS record (CNAME atau A) sudah dibuat di dashboard Cloudflare",
        "Proxy status awal = DNS Only (abu-abu)",
        "SSL/certificate di Vercel sudah terbit (status ✅)",
        "https://domainmu terbuka di browser — tes dari HP pakai data seluler",
        "Kalau ingin fitur Cloudflare proxy: SSL mode sudah diubah ke Full (Strict) SEBELUM nyalakan awan oranye",
      ],
      troubleshooting: [
        {
          q: "ERR_TOO_MANY_REDIRECTS setelah aktifkan awan oranye",
          a: [
            { t: "p", text: "Penyebab klasik: SSL/TLS mode di Cloudflare masih **Flexible**. Cloudflare menghubungi Vercel lewat HTTP, Vercel redirect ke HTTPS, Cloudflare kirim lagi HTTP — loop tak berujung. Solusi: ubah ke **Full (Strict)** di Cloudflare → SSL/TLS → Overview. Biasanya langsung sembuh dalam hitungan detik." },
          ],
        },
        {
          q: "SSL certificate gagal terbit di Vercel (error provisioning)",
          a: [
            { t: "p", text: "Periksa: (1) DNS record sudah benar dan Proxy Status = DNS Only (abu-abu)? Vercel perlu koneksi langsung untuk verifikasi. (2) Ada CAA record yang membatasi? Tambahkan `0 issue \"pki.goog\"` dan `0 issue \"letsencrypt.org\"`. (3) Tunggu 5-10 menit lalu klik retry di Vercel." },
          ],
        },
        {
          q: "Domain sudah setup tapi Vercel masih bilang 'Invalid Configuration'",
          a: [
            { t: "p", text: "DNS belum propagasi. Cek di terminal: `nslookup server.domainmu.com 8.8.8.8` — kalau belum ada jawaban, tunggu beberapa menit. Kalau sudah ada tapi Vercel tetap invalid, pastikan value CNAME persis `cname.vercel-dns.com` (bukan `cname.vercel-dns.com.` dengan titik — walaupun beberapa DNS tool menampilkan titik, itu normal dan biasanya bukan masalah)." },
          ],
        },
      ],
    },
    {
      slug: "troubleshoot-dns-lapangan",
      title: "Troubleshooting DNS di Lapangan",
      summary: "ERR_NAME_NOT_RESOLVED, cache ISP, propagasi — diagnosa dan solusi masalah DNS paling sering.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Kenapa step ini penting?" },
        {
          t: "p",
          text: "Kamu akan menemui ini berulang kali: domain sudah disetup dengan benar, server jalan, tapi browser bilang **ERR_NAME_NOT_RESOLVED** atau web tidak terbuka. 90% kasusnya BUKAN server yang mati — melainkan **DNS yang belum sampai ke perangkatmu**. Step ini mengajarkan cara membedakannya dan menyelesaikannya dengan cepat.",
        },
        { t: "h", text: "Golden Rule: Tes dari HP pakai data seluler" },
        {
          t: "callout",
          kind: "tip",
          text: "Cara TERCEPAT membedakan 'masalah DNS lokal' vs 'masalah server': matikan Wi-Fi di HP, pakai kuota data seluler, buka domainmu di browser HP. Kalau di HP bisa tapi di laptop gagal → 100% masalah DNS lokal/cache, bukan server. Ini menghemat berjam-jam debugging yang salah arah.",
        },
        { t: "h", text: "Masalah 1: ERR_NAME_NOT_RESOLVED" },
        {
          t: "p",
          text: "Artinya: browser meminta DNS resolver 'IP-nya domain ini apa?' dan TIDAK DAPAT jawaban. Beda dari 'server mati' (itu error 502/504) — ini **domain-nya sendiri belum dikenal**.",
        },
        {
          t: "p",
          text: "Penyebab umum dan solusinya:",
        },
        {
          t: "table",
          headers: ["Penyebab", "Cara cek", "Solusi"],
          rows: [
            ["DNS belum propagasi (baru setup)", "Buka dnschecker.org → masukkan domainmu → lihat apakah sudah hijau di seluruh dunia", "Tunggu 15-60 menit. Propagasi nameserver bisa sampai 24 jam."],
            ["Cache DNS di komputer (sudah propagasi tapi laptop masih simpan info lama)", "Tes dari HP pakai data seluler — kalau di HP bisa, masalahnya cache lokal", "Windows: `ipconfig /flushdns` di PowerShell. Mac: `sudo dscacheutil -flushcache`. Restart browser."],
            ["DNS resolver ISP lambat (ISP Indonesia sering cache berjam-jam)", "Coba `nslookup domainmu.com 8.8.8.8` — kalau 8.8.8.8 bisa resolve tapi browser gagal, ISP resolver-mu yang lambat", "Ganti DNS komputer/router ke 1.1.1.1 (Cloudflare) atau 8.8.8.8 (Google) — lihat instruksi di bawah"],
            ["Typo di DNS record", "`nslookup domainmu.com 8.8.8.8` tidak mengembalikan hasil", "Cek ulang ejaan record di dashboard Cloudflare"],
            ["Nameserver belum diganti di registrar", "`nslookup -type=ns domainmu.com 8.8.8.8` masih menampilkan nameserver lama (bukan cloudflare)", "Kembali ke registrar, pastikan nameserver sudah diubah ke Cloudflare"],
          ],
        },
        { t: "h", text: "Cara ganti DNS resolver di Windows" },
        {
          t: "p",
          text: "Kalau ISP-mu (Indihome, Firstmedia, Biznet, dll) lambat me-resolve domain baru, ganti DNS resolver menyelesaikan semuanya:",
        },
        {
          t: "ol",
          items: [
            "Buka **Settings** → **Network & Internet** → klik koneksi aktif (Wi-Fi atau Ethernet).",
            "Klik **Edit** di bagian DNS server assignment.",
            "Pilih **Manual** → aktifkan **IPv4**.",
            "Isi Preferred DNS: **1.1.1.1** — Alternate DNS: **1.0.0.1** (Cloudflare DNS, paling cepat).",
            "Atau isi: Preferred **8.8.8.8** — Alternate **8.8.4.4** (Google DNS).",
            "Save → restart browser.",
          ],
        },
        {
          t: "callout",
          kind: "info",
          text: "Ganti DNS resolver ini aman dan bisa permanen — tidak mengubah kecepatan internet-mu, hanya membuat pencarian nama domain lebih cepat dan akurat. Banyak developer Indonesia yang langsung set ini dari awal agar tidak perlu repot lagi.",
        },
        { t: "h", text: "Masalah 2: ERR_TOO_MANY_REDIRECTS" },
        {
          t: "p",
          text: "Browser terus-terusan dialihkan (redirect loop). Penyebab: Cloudflare Proxy aktif (awan oranye) tapi SSL mode = Flexible. Cloudflare mengirim HTTP ke server, server redirect ke HTTPS, Cloudflare kirim lagi HTTP — tak berhenti.",
        },
        {
          t: "p",
          text: "Solusi: buka Cloudflare → SSL/TLS → ubah ke **Full** atau **Full (Strict)**. Atau matikan dulu awan oranye ke abu-abu sampai stabil.",
        },
        { t: "h", text: "Masalah 3: Kenapa Incognito juga gagal?" },
        {
          t: "p",
          text: "Banyak yang mengira mode Incognito 'reset semua'. SALAH — Incognito hanya menghapus cookie dan cache browser (gambar, CSS, JS). Tapi **DNS resolver yang dipakai tetap sama** dengan mode biasa (dari sistem operasi → router → ISP). Jadi kalau masalahnya adalah cache DNS di ISP/router, Incognito juga gagal. Solusi yang benar: ganti DNS resolver atau tes dari jaringan lain (data seluler).",
        },
        { t: "h", text: "Toolkit diagnosis DNS" },
        {
          t: "table",
          headers: ["Tool", "Kegunaan", "Cara pakai"],
          rows: [
            ["**nslookup**", "Tanya DNS resolver spesifik — sudah ada di Windows/Mac/Linux", "`nslookup domainmu.com 8.8.8.8`"],
            ["**dig**", "Lebih detail dari nslookup (response header, TTL) — bawaan Linux/Mac", "`dig domainmu.com @8.8.8.8`"],
            ["**dnschecker.org**", "Cek apakah domain sudah tersebar ke DNS global (banyak lokasi)", "Buka browser → ketik domain → lihat ✅ hijau"],
            ["**check-host.net**", "Tes HTTP response dari banyak server di dunia", "Masukkan https://domainmu.com → lihat status code"],
            ["**ipconfig /flushdns**", "Reset cache DNS lokal Windows", "Jalankan di PowerShell / CMD"],
          ],
        },
        { t: "cmd", text: "nslookup domainmu.com 8.8.8.8", note: "tanya Google DNS — kalau ada jawaban, DNS sudah propagasi; masalahnya di cache lokal" },
        { t: "cmd", text: "nslookup domainmu.com 1.1.1.1", note: "tanya Cloudflare DNS — biasanya tercepat ter-update" },
        { t: "cmd", text: "ipconfig /flushdns", note: "Windows: buang cache DNS lokal supaya lookup berikutnya ambil data baru" },
        { t: "h", text: "Ringkasan alur diagnosis" },
        {
          t: "ol",
          items: [
            "Domain tidak bisa dibuka → **jangan panik**.",
            "Tes dari HP pakai data seluler → **berhasil?** → masalah cache lokal, bukan server.",
            "Jalankan `nslookup domainmu.com 8.8.8.8` → **ada jawaban?** → DNS sudah propagasi, tinggal flush cache atau ganti DNS resolver.",
            "Tidak ada jawaban di nslookup → **DNS belum propagasi** → cek nameserver di registrar, cek record di Cloudflare, tunggu.",
            "Domain resolve tapi error 502/504 → **server yang bermasalah**, bukan DNS → cek nginx, app, tunnel.",
          ],
        },
      ],
      checklist: [
        "Aku paham bedanya 'DNS belum resolve' (ERR_NAME_NOT_RESOLVED) vs 'server mati' (502/504)",
        "Aku tahu cara cepat: tes dari HP pakai data seluler untuk bedakan masalah DNS lokal vs server",
        "Aku bisa pakai nslookup untuk mendiagnosa DNS",
        "DNS resolver di komputerku sudah diganti ke 1.1.1.1 atau 8.8.8.8",
      ],
      troubleshooting: [
        {
          q: "Sudah ganti DNS ke 1.1.1.1 tapi masih gagal",
          a: [
            { t: "p", text: "Pastikan perubahan DNS sudah tersimpan dan browser sudah di-restart (bukan hanya refresh halaman). Jalankan `ipconfig /flushdns` lagi setelah ganti DNS. Kalau masih gagal: buka PowerShell, coba `nslookup domainmu.com 1.1.1.1` — kalau ini berhasil tapi browser gagal, restart koneksi Wi-Fi/Ethernet (disable → enable) atau restart komputer." },
          ],
        },
        {
          q: "nslookup berhasil tapi browser tetap ERR_NAME_NOT_RESOLVED",
          a: [
            { t: "p", text: "Browser punya DNS cache sendiri. Di Chrome: buka `chrome://net-internals/#dns` → klik 'Clear host cache'. Di Firefox/Edge: restart browser biasanya cukup. Kalau pakai VPN/proxy, matikan dulu — VPN sering mengarahkan DNS ke server mereka sendiri yang mungkin belum ter-update." },
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
