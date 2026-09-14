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
            "`2: enp0s3` (atau `ens33`/`eth0`) — **interface fisik utama**. Cari baris `inet 192.168.1.xx/24 broadcast ...`. Itu IP VM-mu. `/24` = mask jaringan (255.255.255.0, artinya jaringan 192.168.1.0–255).",
            "Baris `link/ether xx:xx:...` — **MAC address**, 'nomor KTP'-nya kartu jaringan; berguna saat mau kunci IP di router.",
            "`state UP` = kabel terhubung; `LOWER_UP` = fisik aktif. Kalau `state DOWN` — adapter belum nyala (`sudo ip link set enp0s3 up`).",
          ],
        },
        {
          t: "callout",
          kind: "warn",
          text: "Jangan pakai IP `127.0.0.1` untuk SSH dari laptop — itu selalu berarti 'komputer ini sendiri'. Kamu butuh IP 192.168.x.x (atau sesuai mode Host-only: biasanya 192.168.56.x).",
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
        { t: "h", text: "Command-nya" },
        { t: "p", text: "Di **PowerShell laptop (host)** — bukan di VM:" },
        { t: "cmd", text: "ssh username@192.168.1.xx", note: "ganti username dengan hasil whoami di VM, xx dengan IP VM-mu" },
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
          a: [{ t: "p", text: "Paket tidak sampai sama sekali. Urutan cek: (1) VM running? (2) IP benar & masih sama (`ip a` di VM)? (3) Host bisa ping IP VM? — `ping 192.168.1.xx` dari PowerShell. Kalau ping saja gagal, ini masalah jaringan (adapter mode salah, beda WiFi, atau firewall) — lanjut step berikutnya." }],
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
      slug: "troubleshooting-ssh",
      title: "Troubleshooting SSH Gagal Connect",
      summary: "Checklist sistematis 5 titik kegagalan — hafal urutannya, jangan tebak-tebakan.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Berpikir seperti dokter, bukan menebak-nebak" },
        {
          t: "p",
          text: "'SSH tidak jalan' itu gejala, bukan diagnosis. Alur paket: **client → jaringan → port → service → auth**. Cek berurutan dari luar ke dalam; berhenti di titik pertama yang gagal.",
        },
        { t: "ol",
          items: [
            "**VM nyala?** — di VirtualBox statusnya harus `Running`. Saved/Powered off = tidak ada program yang menunggu koneksi di port 22.",
            "**IP benar & aktif?** — `ping <ip-vm>` dari host. Tidak dapat balasan → masalah jaringan: `ip a` di VM masih IP itu? Bridged pakai adapter WiFi yang benar? Coba `ip a` di host dan bandingkan segmennya.",
            "**Service hidup?** — di jendela VM (bukan SSH, karena SSH-nya belum jalan): `sudo systemctl status ssh`. Inactive → `sudo systemctl start ssh`.",
            "**Firewall menghalangi?** — `sudo ufw status`. Kalau `Status: active` dan tidak ada rule untuk 22, blokir terjadi. Sementara: `sudo ufw allow ssh` (pembahasan firewall yang lengkap ada di Bagian 4).",
            "**Auth-nya yang salah?** — sudah sampai tahap password berarti koneksi OK; yang gagal kredensial. Perhatikan keyboard (Caps Lock), dan ingat password tidak tampil saat diketik.",
          ],
        },
        { t: "h", text: "Cara tercepat saat bingung: mode verbose" },
        { t: "cmd", text: "ssh -v username@192.168.1.xx", note: "cetak setiap tahap koneksi + di tahap mana ia menyerah" },
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
        "Saya hafal urutan 5 titik cek: VM → IP/ping → service → firewall → auth",
        "Saya pernah menjalankan ssh -v dan bisa menunjuk baris tahap kegagalannya",
        "SSH-ku sekarang sudah bekerja (atau sudah tahu persis di tahap mana macetnya)",
      ],
    },
  ],
};
