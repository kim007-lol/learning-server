import type { Part } from "@/lib/types";

export const part0: Part = {
  id: 0,
  title: "Bagian 0 — Fondasi: Apa Itu Server & Cara Kerja Internet",
  desc: "Murni konsep, tanpa terminal. Pahami gambaran besarnya dulu supaya kamu tidak cuma ikut resep.",
  steps: [
    {
      slug: "apa-itu-server",
      title: "Apa itu Server, Sebenarnya?",
      summary: "Server bukan alat ajaib — cuma komputer biasa yang menyala terus dan 'mendengarkan' permintaan.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Luruskan miskonsepsinya dulu" },
        {
          t: "p",
          text: "Banyak pemula membayangkan 'server' sebagai mesin hitam misterius di ruang ber-AC penuh lampu berkedip, seperti di film. Aslinya jauh lebih sederhana — dan itu kabar baik: **server hanyalah komputer biasa** (bisa laptop lama, Raspberry Pi, atau VM seperti Xubuntu-mu) yang memenuhi dua syarat: **menyala terus** dan **punya program yang 'mendengarkan' (listen) permintaan dari komputer lain**.",
        },
        {
          t: "p",
          text: "Yang membuat komputer jadi 'server' bukan wujud fisiknya, tapi perannya. Komputer yang sama bisa jadi server saat kamu jalankan program yang listen, dan jadi client saat kamu buka browser.",
        },
        { t: "h", text: "Tiga istilah yang sering tertukar" },
        {
          t: "table",
          headers: ["Istilah", "Artinya", "Contoh"],
          rows: [
            ["Server (peran)", "Komputer yang melayani permintaan komputer lain", "VM Xubuntu-mu nanti"],
            ["Mesin / host (wujud)", "Hardware atau VM tempat peran server dijalankan", "Laptop + VirtualBox-mu"],
            ["Service / daemon (program)", "Program yang jalan di background dan mendengarkan permintaan", "nginx (web server), sshd (SSH server), MySQL (database server)"],
          ],
        },
        {
          t: "p",
          text: "Perhatikan: kata 'server' dipakai untuk dua hal berbeda — komputer yang melayani, DAN program yang melayani (web server, database server). Konteks biasanya menjelaskan yang mana.",
        },
        { t: "h", text: "Model client-server" },
        {
          t: "p",
          text: "Semua yang kamu lakukan online mengikuti pola yang sama: **client mengirim request, server mengirim response**. Kamu klik link → browser (client) mengirim request 'tolong kirim halaman ini' → komputer di ujung sana (server) memproses lalu mengirim response berisi halaman itu. ChatGPT, Instagram, YouTube — semuanya pola yang sama, berulang miliaran kali per detik.",
        },
        { t: "diagram", key: "client-server", caption: "Model client–server: request pergi, response pulang" },
        {
          t: "callout",
          kind: "tip",
          text: "Di sepanjang web ini, kamu akan membalik peran: laptopmu jadi client, VM Xubuntu-mu jadi server. Setelah Bagian 6, seluruh internet jadi client dan VM-mu jadi server sungguhan (dengan domain sendiri).",
        },
      ],
      checklist: [
        "Saya paham server = komputer biasa yang menyala terus + punya program yang listen",
        "Saya bisa bedakan server (peran), mesin fisik, dan service/daemon (program)",
        "Saya paham setiap akses web adalah pasangan request → response",
      ],
      troubleshooting: [
        {
          q: "Jadi laptopku sekarang ini server atau client?",
          a: [{ t: "p", text: "Dua-duanya, tergantung momen. Saat kamu buka website, laptopmu client. Saat kamu nyalakan shared folder atau jalankan server lokal (`npm run dev`), dia jadi server untuk komputer di jaringan yang sama. Peran, bukan identitas." }],
        },
      ],
    },
    {
      slug: "ip-dan-port",
      title: "Apa itu IP Address & Port",
      summary: "IP = alamat gedung, port = nomor pintu. Satu server bisa layani banyak service sekaligus.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Analogi gedung" },
        {
          t: "p",
          text: "Bayangkan sebuah **IP address** (contoh `192.168.1.42` atau `104.18.32.7`) sebagai alamat gedung, dan **port** sebagai nomor pintu/apartemen di gedung itu. Satu komputer punya satu IP, tapi bisa membuka banyak 'pintu' (port) sekaligus — tiap pintu dijaga satu service berbeda.",
        },
        { t: "diagram", key: "ip-port", caption: "Satu IP, banyak port — tiap service 'menjaga' pintunya sendiri" },
        {
          t: "table",
          headers: ["Port", "Biasanya untuk", "Nanti muncul di step"],
          rows: [
            ["22", "SSH (remote terminal)", "Bagian 3"],
            ["80", "HTTP (web biasa)", "Bagian 5–6"],
            ["443", "HTTPS (web terenkripsi)", "Bagian 6"],
            ["3000 / 8080 / dst", "Port aplikasi custom", "Bagian 5"],
          ],
        },
        {
          t: "p",
          text: "Angka 80 dan 443 itu 'konvensi' — kesepakatan bersama supaya browser tahu harus mengetuk pintu mana tanpa ditanya. Port 0–1023 disebut *well-known ports* dan butuh izin root untuk dipakai; aplikasi-mu sebaiknya pakai port tinggi (≥1024) seperti 3000.",
        },
        { t: "h", text: "IP privat vs IP publik — fondasi terpenting Bagian 6" },
        {
          t: "p",
          text: "IP punyamu di rumah/kampus (biasanya `192.168.x.x`, `10.x.x.x`, atau `172.16-31.x.x`) adalah **IP privat**: hanya berlaku di dalam jaringan lokal, seperti nama 'kantin' yang cuma dimengerti orang di dalam kampus yang sama. Internet luar tidak bisa mengetuk IP privat — jutaan router di seluruh dunia punya alamat `192.168.1.1` yang sama, jadi paket dari luar tidak akan tahu harus masuk ke router yang mana.",
        },
        { t: "diagram", key: "ip-privat-publik", caption: "IP publik cuma satu (punya ISP); semua perangkat di rumah 'naik kelas' IP privat di belakang router" },
        {
          t: "p",
          text: "Yang bisa diakses dari internet hanyalah **IP publik**, dan itu mahal/langka — ISP rumahan umumnya tidak memberikannya. Ini alasan kenapa nanti (Bagian 6) kita pakai Cloudflare Tunnel: **membalik arah koneksi** — bukan internet yang mengetuk masuk ke VM-mu (mustahil tanpa IP publik), tapi VM-mu yang keluar mengetuk Cloudflare, lalu membuka 'terowongan' balik.",
        },
      ],
      checklist: [
        "Saya paham analogi IP = alamat gedung, port = nomor pintu",
        "Saya hafal minimal port 22, 80, dan 443 untuk apa",
        "Saya paham kenapa IP privat tidak bisa diakses langsung dari internet",
      ],
      troubleshooting: [
        {
          q: "Cara cek IP-ku yang mana yang privat, mana yang publik?",
          a: [
            { t: "p", text: "Jalankan `ip a` di Linux (atau cek adapter WiFi di Windows) → itu IP privat lokal (biasanya 192.168.x.x). Buka https://ip.cn dari browser → itu IP publik-mu (punya router/ISP, dipakai bersama semua perangkat di rumah)." },
          ],
        },
      ],
    },
    {
      slug: "protokol",
      title: "Apa itu Protokol (TCP/IP, HTTP/HTTPS)",
      summary: "Protokol = aturan bahasa supaya dua komputer saling ngerti.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Protokol = kesepakatan cara bicara" },
        {
          t: "p",
          text: "Dua komputer di jaringan fisik yang sama tetap tidak bisa 'ngobrol' kalau tidak sepakat bahasanya. **Protokol** adalah aturan main itu. Internet pakai susunan protokol berlapis (disebut TCP/IP stack) — tiap lapis urusannya beda, seperti tim logistik: ada yang urus truk, ada yang urus paket, ada yang urus isi paket.",
        },
        { t: "diagram", key: "protokol", caption: "Lapisan protokol: HTTP bicara soal 'halaman web', TCP menjamin 'paket sampai utuh', IP mengurus 'alamat & rute'" },
        {
          t: "ul",
          items: [
            "**IP** — lapisan paling dasar: memberi alamat & merutekan paket data dari A ke B. Tidak menjamin sampai, tidak peduli isinya apa.",
            "**TCP** — di atas IP: memecah data jadi paket, memastikan semua sampai & urut, kirim ulang yang hilang. Ini yang bikin koneksi SSH-mu tidak korup di tengah jalan.",
            "**HTTP** — di atas TCP lagi: format spesifik request/response web. 'GET /index.html', jawaban '200 OK' + isinya. Kode status yang sering kamu lihat (404, 500) bagian dari protokol ini.",
          ],
        },
        { t: "h", text: "HTTP vs HTTPS" },
        {
          t: "p",
          text: "**HTTPS = HTTP + enkripsi (TLS/SSL)**. Tanpa HTTPS, isi pesanmu lewat internet dalam teks polos — siapa pun di tengah rute (wifi kafe, ISP) bisa baca dan rekam, termasuk password. HTTPS memastikan hanya si penerima yang bisa membaca isinya. Nanti Cloudflare Tunnel juga mengurus HTTPS untuk domain-mu secara gratis.",
        },
        {
          t: "callout",
          kind: "info",
          text: "Kamu tidak perlu hafal detail teknisnya — cukup paham urutan lapisannya, supaya saat nanti membaca 'TCP port 80' atau ' HTTPS di Cloudflare', kamu tahu itu merujuk ke lapisan yang mana.",
        },
      ],
      checklist: [
        "Saya paham protokol itu 'aturan bahasa', bukan alat/software tertentu",
        "Saya tahu bedanya peran IP, TCP, dan HTTP secara garis besar",
        "Saya tahu kenapa HTTPS lebih aman dari HTTP",
      ],
    },
    {
      slug: "dns-dan-domain",
      title: "Apa itu DNS & Bagaimana Domain Bekerja",
      summary: "Domain cuma 'nama panggilan' — DNS menerjemahkannya jadi IP address.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Buku telepon internet" },
        {
          t: "p",
          text: "Komputer cuma kenal angka (IP). Manusia kenal nama. **DNS (Domain Name System)** adalah penerjemah di antara keduanya — seperti kontak HP: kamu tap 'Bunda', HP-mu yang menelepon nomornya. Saat kamu ketik `google.com`, browser diam-diam bertanya ke server DNS: 'IP-nya google.com apa?' → dapat jawaban (misal `142.250.172.14`) → baru koneksi sungguhan terjadi.",
        },
        { t: "diagram", key: "dns", caption: "Sebelum request web terjadi, ada satu percakapan tersembunyi: 'IP-nya apa?'" },
        { t: "h", text: "Anatomi nama domain" },
        {
          t: "p",
          text: "Di `app.contoh.com`: `com` = **TLD** (top-level domain), `contoh` = **domain** yang kamu daftarkan (dibeli/disewa tahunan), `app` = **subdomain** — gratis, kamu yang bikin sendiri setelah punya domain. Satu domain bisa punya ribuan subdomain, masing-masing menunjuk ke server/port berbeda.",
        },
        { t: "h", text: "DNS record & nameserver — istilah yang akan kamu sentuh di Bagian 6" },
        {
          t: "ul",
          items: [
            "**A record** — peta paling dasar: 'nama ini → IP ini'.",
            "**CNAME record** — 'nama ini → nama lain' (panggilan alias).",
            "**Nameserver** — menentukan perusahaan mana yang 'menjaga buku telepon' domain-mu. Kalau nameserver diarahkan ke Cloudflare, maka Cloudflare yang jadi otorita DNS domain-mu — dan itu syarat wajib supaya Cloudflare Tunnel bisa bekerja.",
          ],
        },
        {
          t: "callout",
          kind: "info",
          text: "Catatan penting: perubahan DNS menyebar bertahap ke seluruh dunia (cache tiap server DNS) — ini yang disebut propagasi. Kadang perlu beberapa menit sampai beberapa jam sebelum domain-mu 'kelihatan' berubah di semua tempat.",
        },
      ],
      checklist: [
        "Saya paham domain bukan alamat sungguhan, hanya nama yang diterjemahkan DNS ke IP",
        "Saya bedakan domain vs subdomain",
        "Saya tahu nameserver = siapa yang 'memegang buku telepon' domain",
      ],
    },
    {
      slug: "terminal-dan-command-line",
      title: "Command Line & Terminal",
      summary: "Kenapa dunia server identik dengan layar hitam ketikan, dan command dasar yang akan kamu pakai terus.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Kenapa tanpa GUI?" },
        {
          t: "p",
          text: "Server sungguhan biasanya **tidak punya tampilan grafis sama sekali** — cuma teks. Alasannya praktis: GUI (desktop, window, animasi) memakan RAM dan CPU yang mahal di server; server dikelola dari jarak jauh lewat koneksi seperti SSH yang lebih cepat & stabil untuk teks; dan hampir semua hal di Linux bisa dilakukan lebih presisi lewat command daripada klik-klik menu.",
        },
        {
          t: "p",
          text: "Maka menguasai terminal bukan 'cara alternatif yang ribet' — itu **skill inti** seorang yang mengelola server. Kabar baiknya: kamu tidak perlu menghafal ribuan command. 80% pekerjaan server memakai segelintir command yang sama berulang-ulang, dan web ini akan memandumu step by step.",
        },
        { t: "diagram", key: "terminal", caption: "Terminal = jendela ke shell (bash): kamu ketik perintah, shell yang mengeksekusinya" },
        {
          t: "p",
          text: "Istilah yang sering tercampur: **terminal** = jendela aplikasinya; **shell** = program yang menerima perintahmu (umumnya `bash`); **command line** = cara kerjanya. Untuk praktik sehari-hari, anggap saja sama.",
        },
        { t: "h", text: "Command dasar yang akan dipakai terus" },
        { t: "p", text: "Coba dulu di Xubuntu VM-mu (terminal: klik kiri desktop → Terminal Emulator). Belum paham detailnya tidak apa-apa — tujuannya biar akrab dulu." },
        { t: "cmd", text: "pwd", note: "print working directory — 'aku sedang di folder mana?'" },
        { t: "cmd", text: "ls -la", note: "list — lihat isi folder (-a termasuk file tersembunyi, -l format detail)" },
        { t: "cmd", text: "cd /etc", note: "change directory — pindah folder (cd .. = mundur satu tingkat)" },
        { t: "cmd", text: "mkdir proyek && cd proyek", note: "buat folder baru lalu masuk ke dalamnya" },
        { t: "cmd", text: "cat /etc/os-release", note: "tampilkan isi file teks di terminal" },
        { t: "cmd", text: "nano ~/.bashrc", note: "buka file di text editor dalam terminal — Ctrl+O simpan, Ctrl+X keluar" },
        {
          t: "p",
          text: "`nano` itu text editor paling ramah pemula di terminal. `vim` lebih kuat tapi kurva belajarnya lebih tajam (keluar vim saja sudah pertanyaan klasik 😄). Satu saja cukup dihafal — pilih nano.",
        },
        { t: "cmd", text: "sudo ls /root", note: "jalankan command sebagai root/admin — akan diminta password; ini tema step berikutnya" },
      ],
      checklist: [
        "Saya paham kenapa server umumnya tanpa GUI",
        "Saya tahu fungsi pwd, ls, cd, mkdir, cat",
        "Saya sudah coba minimal satu kali membuka file dengan nano",
        "Saya sudah lihat sendiri apa yang terjadi saat pakai sudo",
      ],
      troubleshooting: [
        {
          q: "Terminal-ku 'menggantung' tidak menerima ketikan, gimana?",
          a: [
            { t: "p", text: "Kalau kamu baru jalankan program yang tidak keluar-keluar (misal `python` tanpa argumen), tekan `Ctrl+C` untuk menghentikan program tersebut. Kalau layar berantakan, ketik `reset` lalu Enter. Kalau minta password sudo tapi tidak muncul saat diketik — memang begitu, password di terminal tidak ditampilkan, tinggal ketik lalu Enter." },
          ],
        },
      ],
    },
    {
      slug: "user-dan-permission",
      title: "User, Permission, dan sudo",
      summary: "Linux melindungi sistemnya dengan model user & izin — dan sudo adalah gerbang resminya.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Semua file punya 'pintu pagar'" },
        {
          t: "p",
          text: "Di Linux, setiap file/folder punya **owner** (user pemilik) dan tiga set izin: **r**ead (baca), **w**rite (ubah), e**x**ecute (jalankan) — untuk tiga pihak: pemiliknya, kelompoknya (group), dan lainnya (others). Makanya `ls -l` menampilkan baris seperti `-rw-r--r--` : pemilik bisa baca+tulis, group cuma baca, others cuma baca.",
        },
        { t: "diagram", key: "permission", caption: "Model izin Linux: owner/group/other × read/write/execute" },
        { t: "h", text: "root — user 'dewa'" },
        {
          t: "p",
          text: "**root** adalah user khusus yang tidak terbentur pagar apa pun — bisa baca/ubah/hapus file sistem manapun. Kekuatan penuh juga berarti bahaya penuh: salah command sebagai root bisa melumpuhkan sistem tanpa peringatan.",
        },
        { t: "h", text: "Lalu apa itu sudo?" },
        {
          t: "p",
          text: "**`sudo`** = 'jalankan command INI sebagai root, sementara'. Alih-alih login sebagai root seharian (berbahaya — tiap kesalahan ketik jadi bom), kamu bekerja sebagai user biasa dan hanya 'meminjam' kekuatan root saat memang perlu — dan semua pemakaian sudo tercatat di log. Inilah kenapa hampir semua command instalasi/konfigurasi server di web ini diawali `sudo`: install paket, ubah config, restart service = urusan sistem, bukan urusan pribadimu.",
        },
        {
          t: "callout",
          kind: "warn",
          text: "Kebiasaan yang dibangun dari sekarang: jangan `sudo` untuk hal yang bisa jalan tanpa sudo, dan jangan `sudo su` lalu lupa keluar. Saat kamu lihat command yang ingin diketik dengan sudo tapi tidak yakin kenapa — tanya chatbot dulu sebelum Enter.",
        },
        {
          t: "p",
          text: "Command permission yang akan sering muncul: `chmod +x script.sh` (buat file bisa dieksekusi semua user), `chown -r user:group /folder` (ganti pemilik — untuk kasus service perlu akses folder aplikasi).",
        },
      ],
      checklist: [
        "Saya paham bedanya user biasa vs root",
        "Saya paham sudo = pinjam kekuatan root sementara, bukan ganti identitas permanen",
        "Saya bisa baca simbol rwx di hasil ls -l (minimal tahu maksud kolom itu)",
      ],
    },
    {
      slug: "anatomi-linux-server",
      title: "Anatomi Linux Server: apt, Service, Struktur Folder",
      summary: "Paket manager, konsep service, dan peta folder /etc dan /var/log.",
      requireChecklist: true,
      content: [
        { t: "h", text: "apt: 'Play Store'-nya Ubuntu" },
        {
          t: "p",
          text: "Install software di Ubuntu hampir selalu lewat **package manager** bernama `apt`, bukan download-exe dari website. Perbedaannya penting: apt mengambil software dari repository resmi yang terverifikasi, otomatis menangani dependensi (library yang dibutuhkan software itu), dan mencatat semuanya supaya bisa di-update/di-undo serentak.",
        },
        { t: "cmd", text: "sudo apt update", note: "refresh daftar katalog: 'software apa versi terbaru apa?' — BUKAN meng-install apa pun" },
        { t: "cmd", text: "sudo apt upgrade", note: "baru langkah ini yang meng-update semua paket terpasang" },
        { t: "cmd", text: "sudo apt install nginx", note: "install (atau upgrade) satu paket spesifik" },
        {
          t: "p",
          text: "Analogi: `update` = cek notifikasi toko aplikasi; `upgrade` = tekan 'update all'. Kalau kamu lupa `update` dulu, katalogmu ikut tertinggal dan install bisa gagal atau memakai versi lama.",
        },
        { t: "h", text: "Service: program yang hidup di background" },
        {
          t: "p",
          text: "Software server tidak dijalankan dengan double-click — mereka dipasang sebagai **service**: program yang start otomatis saat OS boot dan terus hidup di background, menunggu permintaan. nginx, sshd, database — semuanya service. Cara mengelolanya lewat `systemctl`, yang akan dibedah tuntas di Bagian 5. Untuk sekarang kenali dulu bentuknya:",
        },
        { t: "cmd", text: "sudo systemctl status ssh", note: "lihat kondisi service (± jalan, sejak kapan, PID-nya)" },
        { t: "cmd", text: "sudo systemctl restart nginx", note: "restart service setelah ubah config" },
        { t: "h", text: "Peta folder — cukup kenali, jangan hafal" },
        {
          t: "table",
          headers: ["Folder", "Isinya", "Akan dipakai di"],
          rows: [
            ["/etc", "Semua file konfigurasi sistem & service", "nginx, tunnel config"],
            ["/var/log", "File log — catatan kejadian tiap service", "troubleshooting"],
            ["/home", "Folder pribadi tiap user (kamu kerja di sini)", "semua step"],
            ["/usr/bin, /usr/local/bin", "Program/executable terpasang", "cloudflared, node"],
            ["/var/www", "Default folder file web", "nginx"],
          ],
        },
        {
          t: "callout",
          kind: "tip",
          text: "Dua kebiasaan server-man: (1) ada masalah? cek log dulu (`/var/log/...` atau `journalctl`) sebelum googling; (2) ubah config? salin backupnya dulu — `sudo cp file file.bak`.",
        },
      ],
      checklist: [
        "Saya paham bedanya apt update vs apt upgrade",
        "Saya tahu service = program yang jalan otomatis di background",
        "Saya tahu /etc untuk config dan /var/log untuk log",
      ],
      troubleshooting: [
        {
          q: "apt update lama sekali / error connection refused",
          a: [
            { t: "p", text: "Kalau VM-mu belum konek internet, cek networking VirtualBox (Bagian 2 nanti membahasnya lengkap). Sementara ini bisa diabaikan dulu — kamu sudah menyelesaikan Bagian 0, lanjut ke Bagian 1." },
          ],
        },
      ],
    },
  ],
};
