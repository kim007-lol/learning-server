import type { Part } from "@/lib/types";

export const part3: Part = {
  id: 3,
  title: "Bagian 3 — SSH ke VM",
  desc: "Momen 'aha' pertama: mengontrol Linux dari terminal laptopmu tanpa menyentuh jendela VirtualBox.",
  steps: [
    {
      slug: "install-ssh-server",
      title: "Install & Aktifkan SSH Server",
      summary: "sshd adalah 'penjaga pintu port 22' — pasang, nyalakan, lalu verifikasi.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Apa yang sebenarnya kita pasang" },
        {
          t: "p",
          text: "**SSH (Secure Shell)** = protokol untuk mengontrol komputer jarak jauh lewat terminal yang terenkripsi. Yang kita pasang di VM adalah **SSH server** (`openssh-server`, programnya bernama `sshd`) — pihak yang *melayani* koneksi masuk. Client-nya (`ssh`) sudah ada di laptopmu. Ingat fondasi Bagian 0: server = program yang mendengarkan di sebuah port. SSH server mendengarkan di **port 22**.",
        },
        { t: "diagram", key: "ssh-flow", caption: "sshd di VM listen port 22; client ssh di laptop menghubunginya — semua terenkripsi" },
        { t: "h", text: "Langkah-langkah (ketik di terminal DALAM VM)" },
        { t: "cmd", text: "sudo apt update && sudo apt install -y openssh-server", note: "pasang paket SSH server" },
        { t: "cmd", text: "sudo systemctl enable --now ssh", note: "enable = auto-start saat boot; --now = langsung start sekarang juga" },
        { t: "cmd", text: "sudo systemctl status ssh", note: "verifikasi — cari tulisan hijau 'active: active (running)'" },
        {
          t: "p",
          text: "`systemctl` mungkin terdengar asing — untuk sekarang, ikuti saja resepnya: `enable` membuat service hidup lagi otomatis setiap VM boot, `--now` langsung menjalankannya tanpa perlu reboot. Bedah tuntas `systemd`/`systemctl` ada di Bagian 5 (step 19), dan chatbot bisa menjelaskannya kapan pun.",
        },
        { t: "h", text: "Bukti listen" },
        { t: "cmd", text: "sudo ss -tlnp | grep :22", note: "tampilkan socket TCP yang LISTEN di port 22" },
        {
          t: "p",
          text: "Output seperti `LISTEN 0 128 *:22 *:* users:(\"sshd\"...))` adalah bukti 'pintu 22 sudah dijaga'. Baris `*:22` artinya menunggu koneksi dari interface mana pun.",
        },
      ],
      checklist: [
        "openssh-server terinstall tanpa error",
        "systemctl status ssh menampilkan active (running)",
        "enable sudah terpasang (Enabled: enabled) — service akan hidup lagi setelah reboot",
        "ss -tlnp menunjukkan sshd listen di port 22",
      ],
      troubleshooting: [
        {
          q: "Unit ssh.service could not be found",
          a: [{ t: "p", text: "Paketnya belum terinstall (install mungkin gagal karena internet VM bermasalah — cek lagi Bagian 2). Nama unit di Ubuntu adalah `ssh` (bukan `sshd`), tapi kalau ragu coba `systemctl status sshd` juga — keduanya mengarah ke service yang sama di sebagian besar instalasi." }],
        },
      ],
    },
    {
      slug: "cari-ip-vm",
      title: "Cari IP VM",
      summary: "Bedah output ip a dan pakai hostname -I — langkah kecil yang akan kamu ulang di setiap step berikutnya.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Dua cara, satu tujuan" },
        { t: "cmd", text: "hostname -I", note: "jalan pintas: langsung tampilkan IP yang bisa dirutekan (spasi jika banyak)" },
        { t: "cmd", text: "ip a", note: "tampilan lengkap semua interface — yang perlu kamu pelajari cara bacanya" },
        { t: "h", text: "Cara membaca `ip a`" },
        {
          t: "ul",
          items: [
            "`1: lo` — **loopback** (`127.0.0.1`): 'cermin' komputer ke dirinya sendiri. Abaikan untuk SSH.",
            "`2: enp0s3` (atau `ens33`/`eth0`) — **interface fisik utama**. Cari baris `inet 192.168.1.xx/24 broadcast ...`. Itu IP LAN VM-mu. `/24` = mask jaringan (255.255.255.0, artinya jaringan 192.168.1.0–255).",
            "Baris `link/ether xx:xx:...` — **MAC address**, 'nomor KTP'-nya kartu jaringan; berguna saat mau kunci IP di router.",
            "`state UP` = kabel terhubung; `LOWER_UP` = fisik aktif. Kalau `state DOWN` — adapter belum nyala (`sudo ip link set enp0s3 up`).",
          ],
        },
        {
          t: "callout",
          kind: "warn",
          text: "Jangan pakai IP `127.0.0.1` untuk SSH dari laptop — itu selalu berarti 'komputer ini sendiri'. Kamu butuh IP yang bisa dijangkau dari luar VM: bisa IP LAN lokal (`192.168.x.x` / `192.168.56.x`) ATAU IP mesh privat Tailscale (`100.x.y.z`).",
        },
        {
          t: "callout",
          kind: "tip",
          text: "Wawasan DevOps: Di dunia nyata, mengandalkan IP LAN lokal (192.168.x.x) punya kelemahan — IP bisa berubah saat ganti WiFi/tethering, dan WiFi publik sering memblokir komunikasi antar perangkat (AP Isolation). Karena itu, setelah mencoba SSH via LAN di step berikutnya, kita juga menyediakan opsi modern: **Tailscale Mesh VPN** (step 4) yang memberi IP 100.x statis dan tembus jaringan apa pun.",
        },
      ],
      checklist: [
        "Saya bisa membedakan lo vs interface fisik di output ip a",
        "Saya sudah dapat IP VM dengan hostname -I",
        "IP VM tercatat di notes: ___________",
      ],
    },
    {
      slug: "ssh-dari-host",
      title: "SSH dari Host ke VM",
      summary: "Tinggalkan jendela VirtualBox — kontrol VM dari PowerShell cukup dengan ssh.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Syarat wajib sebelum mulai" },
        {
          t: "callout",
          kind: "warn",
          text: "VM harus dalam keadaan **menyala (Running)**. Kalau VM di-shutdown atau di-Save state, tidak ada apa pun yang merespons IP-nya → SSH akan timeout / connection refused. Nyalakan dulu, baru coba.",
        },
        { t: "h", text: "Windows 10/11 tidak perlu PuTTY" },
        {
          t: "p",
          text: "PowerShell modern sudah punya **OpenSSH client bawaan** — command `ssh` yang sama persis seperti di Linux/macOS. PuTTY tetap oke bagi yang suka GUI, tapi kita belajar command yang universal (server asli nanti ya command ini juga).",
        },
        { t: "h", text: "Pilihan Alamat Target SSH" },
        {
          t: "p",
          text: "Ada dua opsi alamat yang bisa kamu hubungi dari PowerShell laptop host:",
        },
        {
          t: "ul",
          items: [
            "**Opsi A (IP LAN Lokal):** `ssh username@192.168.1.xx` — cepat dan standar saat laptop dan VM berada di satu jaringan WiFi rumah yang sama.",
            "**Opsi B (IP Tailscale Mesh):** `ssh username@100.x.y.z` atau `ssh username@nama-vm` — opsi modern bebas pusing, tetap tersambung meski laptop pindah ke cafe, tethering HP, atau beda jaringan (dibahas lengkap di step setelah ini).",
          ],
        },
        { t: "h", text: "Command-nya" },
        { t: "p", text: "Di **PowerShell laptop (host)** — bukan di VM:" },
        { t: "cmd", text: "ssh username@192.168.1.xx", note: "ganti username dengan user VM-mu, dan IP dengan IP LAN (atau IP 100.x jika sudah pasang Tailscale)" },
        {
          t: "ol",
          items: [
            "Koneksi pertama kali akan bertanya `Are you sure you want to continue connecting (yes/no/[fingerprint])?` — ketik `yes`. Ini SSH menyimpan 'sidik jari' server untuk mendeteksi penyadap di koneksi berikutnya.",
            "Masukkan **password user VM** (tidak tampil saat diketik — normal!).",
            "Sukses = prompt berubah menjadi `username@xubuntu-virtualbox:...$`. Sekarang semua yang kamu ketik di PowerShell dieksekusi DI VM, seolah kamu duduk di depannya. Coba `hostname` dan `ip a` untuk membuktikan.",
          ],
        },
        { t: "cmd", text: "exit", note: "putuskan sesi SSH — sesi VM lain / jendela VirtualBox tidak ikut tertutup" },
        {
          t: "p",
          text: "Perhatikan bedanya: **sesi SSH** (jendela koneksi yang kamu buka dari PowerShell) vs **service sshd** (program yang terus hidup di VM). Menutup sesi SSH hanya menutup satu 'pintu masuk' — service-nya tetap standby menunggu koneksi baru. Konsep 'apa yang mati dan apa yang tetap hidup saat terminal ditutup' akan dibahas panjang di Bagian 5.",
        },
      ],
      checklist: [
        "VM dalam keadaan Running",
        "ssh username@ip sukses dari PowerShell (muncul prompt VM)",
        "hostname di sesi SSH menampilkan nama VM, bukan laptop",
        "Aku paham yes/fingerprint saat koneksi pertama itu validasi identitas server",
      ],
      troubleshooting: [
        {
          q: "'ssh' is not recognized as an internal or external command",
          a: [{ t: "p", text: "Fitur OpenSSH Client Windows belum aktif: Settings → Apps → Optional features → Add a feature → cari 'OpenSSH Client' → Install. Alternatif sementara: gunakan Windows Terminal/PowerShell sebagai admin." }],
        },
        {
          q: "Connection timed out",
          a: [{ t: "p", text: "Paket tidak sampai sama sekali. Urutan cek: (1) VM running? (2) IP benar & masih sama (`ip a` di VM)? (3) Host bisa ping IP VM? — `ping 192.168.1.xx` dari PowerShell. Kalau ping gagal karena beda WiFi atau isolasi router, pertimbangkan pakai opsi **Tailscale** di step berikutnya." }],
        },
        {
          q: "Connection refused",
          a: [{ t: "p", text: "Paket SAMPAI ke VM tapi tidak ada yang listen di port 22 → sshd mati/belum install. Cek `sudo systemctl status ssh` di dalam VM." }],
        },
        {
          q: "Permission denied (publickey) padahal password benar",
          a: [{ t: "p", text: "Masih di step hardening nanti — tapi kalau muncul sekarang: pastikan benar-benar user yang sama (`whoami`), dan cek `PasswordAuthentication` di /etc/ssh/sshd_config. Biasanya belum terjadi; lewati kalau belum." }],
        },
      ],
    },
    {
      slug: "opsi-tailscale-ssh",
      title: "Opsi Modern: Setup Tailscale untuk SSH",
      summary: "Bebas dari masalah IP LAN yang berubah: hubungkan host dan VM lewat private WireGuard mesh VPN dengan IP 100.x statis & MagicDNS.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Mengapa Opsi Tailscale Ini Mengubah Segalanya?" },
        {
          t: "p",
          text: "Di materi sebelumnya, kita mengandalkan IP LAN lokal (`192.168.1.xx`). Cara itu bekerja baik di rumah, tapi punya 3 masalah fatal yang dihadapi setiap developer:",
        },
        {
          t: "ol",
          items: [
            "**IP Berubah-Ubah (DHCP lease):** Saat router reboot atau masa sewa IP habis, IP VM bisa berganti, membuat sesi SSH gagal konek.",
            "**Pindah WiFi / Tethering:** Saat kamu bawa laptop ke cafe, kampus, atau pakai hotspot HP, laptop dan VM berada di subnet berbeda atau router memberlakukan *AP Client Isolation* (perangkat dilarang saling sapa).",
            "**Tidak Bisa Diakses Jarak Jauh:** Kamu tidak bisa SSH ke VM dari luar rumah tanpa mengkonfigurasi port-forwarding router yang rumit dan rawan dibobol bot.",
          ],
        },
        {
          t: "p",
          text: "**Tailscale** memecahkan semua masalah ini. Tailscale adalah **zero-config mesh VPN** berbasis protokol **WireGuard**. Tailscale membuat jaringan privat virtual (disebut *Tailnet*) yang menghubungkan laptop dan VM secara langsung (peer-to-peer terenkripsi).",
        },
        { t: "diagram", key: "tailscale-mesh", caption: "Laptop Host dan VM sama-sama terhubung ke Tailscale mesh — komunikasi terenkripsi end-to-end tanpa peduli di mana letak fisiknya" },
        {
          t: "ul",
          items: [
            "**IP Privat Statis:** VM mendapat IP privat khusus berawalan `100.x.y.z` yang tidak akan pernah berubah.",
            "**MagicDNS:** Kamu bahkan bisa SSH langsung dengan nama mesin: `ssh username@nama-vm` tanpa perlu mengingat angka IP.",
            "**Tembus NAT & Firewall:** Menggunakan teknologi NAT traversal otomatis (dan relay DERP jika diperlukan), jadi koneksi tembus tanpa kamu menyentuh router sedikit pun.",
            "**Fitur Tailscale SSH Opsional:** Tailscale bahkan punya fitur `tailscale up --ssh` yang mengautentikasi sesi SSH via akun loginmu tanpa perlu repot kelola kunci privat manual.",
          ],
        },
        { t: "h", text: "Langkah 1 — Pasang Tailscale di VM (Linux)" },
        { t: "p", text: "Di terminal VM (bisa lewat jendela VirtualBox atau sesi SSH LAN yang sedang aktif):" },
        { t: "cmd", text: "curl -fsSL https://tailscale.com/install.sh | sh", note: "skrip instalasi resmi paket Tailscale untuk Debian/Ubuntu" },
        { t: "cmd", text: "sudo tailscale up", note: "nyalakan Tailscale dan dapatkan tautan autentikasi akun" },
        {
          t: "callout",
          kind: "tip",
          text: "Ingin tanpa kelola SSH key manual? Kamu bisa menjalankan: `sudo tailscale up --ssh`. Fitur ini membuat Tailscale mengambil alih otentikasi SSH dengan akun Google/GitHub login Tailscale-mu, aman dan praktis!",
        },
        {
          t: "p",
          text: "Terminal akan menampilkan pesan: `To authenticate, visit: https://login.tailscale.com/a/...`. Buka tautan tersebut di browser laptopmu, login dengan akun Google/GitHub/Microsoft (gratis untuk personal hingga 100 perangkat). Setelah diapprove, VM resmi bergabung ke jaringan privatmu.",
        },
        { t: "cmd", text: "tailscale ip -4", note: "lihat IP Tailscale VM-mu (formatnya 100.x.y.z)" },
        { t: "h", text: "Langkah 2 — Pasang Tailscale di Laptop Host (Windows / macOS / Linux)" },
        {
          t: "ol",
          items: [
            "Buka **https://tailscale.com/download** di browser laptopmu dan unduh installer (misalnya Windows).",
            "Install aplikasi Tailscale di laptop, buka aplikasinya, dan klik **Log in** menggunakan **akun yang sama persis** dengan yang kamu pakai di VM.",
            "Setelah terhubung, icon Tailscale di taskbar akan menyala, dan laptopmu sekarang berada di satu 'ruangan virtual' yang sama dengan VM.",
          ],
        },
        { t: "h", text: "Langkah 3 — Uji Koneksi SSH via Tailscale dari Host" },
        { t: "p", text: "Buka **PowerShell di laptop host**:" },
        { t: "cmd", text: "ping 100.x.y.z", note: "ganti dengan IP 100.x yang didapat dari tailscale ip -4 di VM" },
        { t: "cmd", text: "ssh username@100.x.y.z", note: "koneksi SSH langsung melalui terowongan WireGuard privat Tailscale" },
        {
          t: "p",
          text: "Sukses! Sekarang kamu bisa mematikan WiFi rumah, berganti ke tethering HP atau nongkrong di cafe: command `ssh username@100.x.y.z` akan **tetap bisa masuk** ke VM tanpa terganggu!",
        },
      ],
      checklist: [
        "Tailscale terpasang di VM dan terminal menampilkan status connected",
        "Aplikasi Tailscale terpasang di laptop host dan login dengan akun yang sama",
        "Saya sudah mencatat IP 100.x.y.z dari perintah tailscale ip -4",
        "ssh username@100.x.y.z sukses terhubung dari PowerShell host",
        "Saya paham keuntungan Tailscale mesh dibanding hanya mengandalkan IP LAN lokal",
      ],
      troubleshooting: [
        {
          q: "Link login https://login.tailscale.com tidak bisa diklik di terminal VM",
          a: [{ t: "p", text: "Sorot URL tersebut dengan mouse di terminal VM, klik kanan / copy, lalu paste di browser laptop host-mu. Kamu bisa mengotentikasi dari browser perangkat mana pun asalkan login akunmu sesuai." }],
        },
        {
          q: "Host tidak bisa ping ke IP 100.x VM",
          a: [{ t: "p", text: "Pastikan client Tailscale di laptop Windows dalam kondisi **Connected** (cek icon di system tray). Di VM, jalankan `tailscale status` untuk memverifikasi apakah kedua mesin saling melihat di daftar node." }],
        },
        {
          q: "Apakah firewall UFW memblokir Tailscale?",
          a: [{ t: "p", text: "Tailscale membuat interface jaringan virtual bernama `tailscale0`. Jika UFW aktif, kamu bisa menambahkan rule eksplisit: `sudo ufw allow in on tailscale0 to any port 22` agar akses SSH lewat Tailscale selalu diizinkan tanpa membuka port 22 ke sembarang orang di WiFi lokal." }],
        },
      ],
    },
    {
      slug: "troubleshooting-ssh",
      title: "Troubleshooting SSH Gagal Connect",
      summary: "Checklist sistematis 5 titik kegagalan — hafal urutannya, jangan tebak-tebakan.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Berpikir seperti dokter, bukan menebak-nebak" },
        {
          t: "p",
          text: "'SSH tidak jalan' itu gejala, bukan diagnosis. Alur paket: **client → jaringan (LAN/Tailscale) → port → service → auth**. Cek berurutan dari luar ke dalam; berhenti di titik pertama yang gagal.",
        },
        { t: "ol",
          items: [
            "**VM nyala?** — di VirtualBox statusnya harus `Running`. Saved/Powered off = tidak ada program yang menunggu koneksi di port 22.",
            "**Jaringan & IP aktif?** — `ping <ip-target>` dari host. Jika pakai IP LAN (192.168.x.x) dan ping gagal → masalah adapter/WiFi beda subnet. Solusi cerdas: gunakan opsi **Tailscale IP (100.x.y.z)** yang bypass semua masalah router fisik.",
            "**Service hidup?** — di jendela VM (bukan SSH, karena SSH-nya belum jalan): `sudo systemctl status ssh`. Inactive → `sudo systemctl start ssh`.",
            "**Firewall menghalangi?** — `sudo ufw status`. Kalau `Status: active` dan tidak ada rule untuk 22, blokir terjadi. Sementara: `sudo ufw allow ssh` atau `sudo ufw allow in on tailscale0 to any port 22` (pembahasan firewall lengkap ada di Bagian 4).",
            "**Auth-nya yang salah?** — sudah sampai tahap password berarti koneksi OK; yang gagal kredensial. Perhatikan keyboard (Caps Lock), dan ingat password tidak tampil saat diketik.",
          ],
        },
        { t: "h", text: "Cara tercepat saat bingung: mode verbose" },
        { t: "cmd", text: "ssh -v username@192.168.1.xx", note: "atau ssh -v username@100.x.y.z untuk mencetak setiap tahap koneksi dan letak kegagalannya" },
        {
          t: "p",
          text: "Saat bingung, `-v` (atau `-vv`) hampir selalu menjawab sendirian. Baca baris terakhir sebelum error: `Connecting to ... port 22` (berarti masih tahap jaringan), `Connection established` lalu `Permission denied` (berarti tahap auth).",
        },
        {
          t: "callout",
          kind: "tip",
          text: "Keterampilan yang bisa dipakai di mana saja: pola 'periksa berlapis dari luar ke dalam + aktifkan mode verbose' ini persis yang dipakai untuk mendiagnosis masalah server apa pun — nanti saat web error 502 atau tunnel mati, caranya sama.",
        },
      ],
      checklist: [
        "Saya hafal urutan 5 titik cek: VM → IP/ping (LAN/Tailscale) → service → firewall → auth",
        "Saya pernah menjalankan ssh -v dan bisa menunjuk baris tahap kegagalannya",
        "SSH-ku sekarang sudah bekerja via LAN atau Tailscale (atau sudah tahu persis di tahap mana macetnya)",
      ],
    },
  ],
};
