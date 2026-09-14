import type { Part } from "@/lib/types";

export const part4: Part = {
  id: 4,
  title: "Bagian 4 — Hardening Dasar",
  desc: "Sebelum mengekspos apa pun ke jaringan lebih luas: firewall dulu, lalu kunci pintu SSH dengan benar.",
  steps: [
    {
      slug: "ufw-firewall",
      title: "Firewall Dasar dengan UFW",
      summary: "Pagar depan server: tutup semua pintu, buka hanya yang perlu.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Kenapa firewall bukan opsional" },
        {
          t: "p",
          text: "Bayangkan server-mu gedung dengan ratusan pintu (port 0–65535). Setiap service yang berjalan membuka satu pintu. Tanpa firewall, kalau suatu hari ada service yang tak sengaja membuka port aneh (database tanpa password, misalnya), seluruh dunia bisa masuk. **Firewall** menolak koneksi masuk di level jaringan berdasarkan aturan — termasuk untuk service yang lupa kamu sadari sedang jalan.",
        },
        { t: "diagram", key: "firewall", caption: "UFW sebagai satpam: default deny incoming, hanya port yang di-allow yang lewat" },
        {
          t: "p",
          text: "`ufw` = **U**ncomplicated **F**irewall — frontend ramah dari firewall sungguhan Linux (`nftables`/`iptables`). Filosofia desainnya persis untuk pemula: default-nya **tolak semua koneksi masuk, izinkan semua koneksi keluar**.",
        },
        { t: "h", text: "Urutan aman — jangan sampai mengunci diri sendiri" },
        {
          t: "callout",
          kind: "warn",
          text: "PENTING: izinkan SSH SEBELUM enable. Kalau kamu enable firewall dalam keadaan deny-all dari sesi SSH, sesi berikutnya (dan mungkin kamu) terkunci keluar. Kebiasaan: rule dulu, baru gerbang.",
        },
        { t: "cmd", text: "sudo ufw allow ssh", note: "buka port 22 (layanan bernama 'ssh' sudah terdaftar di /etc/services)" },
        { t: "cmd", text: "sudo ufw enable", note: "nyalakan — konfirmasi 'Proceed with yes?' ketik y" },
        { t: "cmd", text: "sudo ufw status verbose", note: "lihat aturan aktif" },
        {
          t: "p",
          text: "Setelah enable, tutup sesi SSH-mu (`exit`) lalu **koneksi ulang dari PowerShell** — kalau masih bisa masuk, konfigurasi firewall-mu sehat. Uji juga sisi deny: dari host, `Test-NetConnection 192.168.1.xx -Port 80` → seharusnya `TcpTestSucceeded : False` (belum ada yang listen pun, firewall menolak lebih dulu).",
        },
        {
          t: "p",
          text: "Rule lain yang akan kamu pakai nanti: `sudo ufw allow 80` dan `sudo ufw allow 443` saat web server siap. `sudo ufw delete allow 80` untuk menghapus. `sudo ufw reset` kalau ingin mulai dari nol.",
        },
      ],
      checklist: [
        "sudo ufw allow ssh dijalankan SEBELUM enable",
        "ufw status verbose: Status: active, Default: deny (incoming), allow (outgoing)",
        "Saya bisa tetap SSH setelah firewall aktif",
      ],
      troubleshooting: [
        {
          q: "Terlanjur enable sebelum allow ssh, sekarang terkunci!",
          a: [
            { t: "p", text: "Tenang — ini VM, kamu punya akses fisik. Buka jendela VirtualBox (yang memang tidak lewat jaringan), login, lalu: `sudo ufw allow ssh`. Sesi SSH akan hidup lagi. Sisa pelajaran: inilah alasan urutan rule-then-enable ditekankan." },
          ],
        },
      ],
    },
    {
      slug: "ssh-hardening",
      title: "SSH Key Auth ( & Ganti Port, Opsional)",
      summary: "Login dengan kunci kriptografis, bukan password yang bisa ditebak.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Kenapa password lemah berbahaya" },
        {
          t: "p",
          text: "Server yang terhubung internet akan **selalu** menemukan bot yang menabrak port 22 mencoba kombinasi username/password (brute force) — hitungan menit, bukan hari. **SSH key** menggantinya dengan pasangan kunci kriptografis: kamu pegang *private key* (rahasia, tidak pernah dikirim), server simpan *public key*-nya. Login = server menantang: 'buktikan kamu pegang private key yang cocok' — tanpa password yang bisa ditebak.",
        },
        { t: "diagram", key: "ssh-key", caption: "Challenge–response: public key mengunci, private key membuka — kunci privat tidak pernah lewat jaringan" },
        { t: "h", text: "Langkah 1 — Generate key (di HOST / PowerShell)" },
        { t: "cmd", text: "ssh-keygen -t ed25519 -C \"laptop-ke-vm\"", note: "tekan Enter 3x: lokasi default, passphrase kosong boleh untuk belajar" },
        {
          t: "p",
          text: "Hasil: `~/.ssh/id_ed25519` (private — JANGAN dibagikan, pernah pun) dan `id_ed25519.pub` (public — aman dipasang di server mana pun).",
        },
        { t: "h", text: "Langkah 2 — Salin public key ke VM" },
        { t: "cmd", text: "type $env:USERPROFILE\\.ssh\\id_ed25519.pub | ssh username@192.168.1.xx \"mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys\"", note: "cara PowerShell (ssh-copy-id tidak ada di Windows bawaan)" },
        {
          t: "p",
          text: "Di Linux/macOS cukup `ssh-copy-id username@ip-vm`. Hasilnya sama: public key-mu ditambahkan ke `~/.ssh/authorized_keys` di VM — 'daftar tamu VIP' yang kalau cocok membuat sshd membuka pintu tanpa password.",
        },
        { t: "cmd", text: "ssh username@192.168.1.xx", note: "tes: harus masuk TANPA minta password VM (mungkin minta passphrase kunci jika kamu set)" },
        { t: "h", text: "Langkah 3 — (Opsional, paham risikonya dulu) Matikan login password" },
        {
          t: "callout",
          kind: "warn",
          text: "RISIKO LOCKOUT: setelah password login mati, satu-satunya jalan masuk = sesi SSH yang masih terbuka atau jendela konsol VirtualBox. JANGAN lakukan ini sebelum Langkah 2 terbukti bekerja, dan selalu tes koneksi baru SEBELUM menutup sesi lama & sebelum reboot VM.",
        },
        { t: "cmd", text: "sudo nano /etc/ssh/sshd_config", note: "cari & ubah: PasswordAuthentication no" },
        { t: "p", text: "Sektor lain file itu mungkin sudah menyetel via `sshd_config.d/*.include` — cek juga `sudo grep -r PasswordAuthentication /etc/ssh/` dan ubah yang nilainya yes. Setelah edit:" },
        { t: "cmd", text: "sudo systemctl restart ssh", note: "reload konfigurasi sshd (sesi SSH yang sedang aktif tidak putus)" },
        {
          t: "p",
          text: "Ingat kebiasaan config-file server: **restart service setelah ubah config**. Ini pola yang sama persis untuk nginx & service lain nanti.",
        },
        { t: "h", text: "Opsional: ganti port SSH default" },
        {
          t: "p",
          text: "Ubah `#Port 22` → `Port 2222` di `sshd_config`, lalu `sudo ufw allow 2222/tcp` SEBELUM restart, baru `sudo systemctl restart ssh`, dan koneksimu jadi `ssh -p 2222 user@ip`. Efeknya kecil (mengurangi noise log dari bot, bukan menambah keamanan nyata — bot pemindai tetap menabrak semua port). Boleh dilewati. Nilainya sebagai latihan urutan aman rule→restart: satu-satunya jebakan di sini adalah lupa allow port baru di firewall sebelum restart sshd.",
        },
      ],
      checklist: [
        "Key pair tergenerate di laptop (id_ed25519 + .pub)",
        "SSH ke VM sekarang masuk TANPA password",
        "(Jika dilakukan) PasswordAuthentication no + sesi baru tetap bisa masuk",
        "Aku paham kenapa private key tidak boleh dikirim/dibagikan",
      ],
      troubleshooting: [
        {
          q: "Sudah copy key tapi masih minta password",
          a: [
            { t: "p", text: "Dua penyebab klasik: (1) permission salah — sshd menolak `authorized_keys` yang bisa diubah orang lain. Di VM: `chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`. (2) Baris key rusak/terpotong saat paste (PowerShell `type` kadang menggabungkan baris) — cek `cat ~/.ssh/authorized_keys` harus diawali `ssh-ed25519 AAAA...` satu baris utuh." },
          ],
        },
        {
          q: "Kunci privat laptop hilang / mau ganti laptop",
          a: [{ t: "p", text: "Tidak ada fitur 'reset password' untuk key — cukup hapus barisnya dari authorized_keys VM (lewat konsol VirtualBox), generate ulang di laptop baru, salin lagi. Ini sekaligus contoh kenapa akses konsol fisik/lokal selalu harus tersedia sebagai jalan terakhir." }],
        },
      ],
    },
  ],
};
