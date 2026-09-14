import type { Part } from "@/lib/types";

export const part1: Part = {
  id: 1,
  title: "Bagian 1 — Pengenalan & Persiapan Virtualisasi",
  desc: "Sekarang tangan mulai menyentuh keyboard: kenali VM-mu dan siapkan basisnya.",
  steps: [
    {
      slug: "pengantar-virtualisasi",
      title: "Pengantar Virtualisasi",
      summary: "VM = komputer di dalam komputer. Arena latihan yang aman sebelum server sungguhan.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Masalah yang dipecahkan virtualisasi" },
        {
          t: "p",
          text: "Kalau kamu salah konfigurasi di server sungguhan — atau sekadar bereksperimen lalu merusak sistemnya — akibatnya nyata (situs mati, install ulang, biaya). **Virtual machine (VM)** menyelesaikan ini: sebuah komputer yang seluruhnya berjalan sebagai *software* di dalam OS-mu. VirtualBox membaca satu set file disk + RAM virtual, lalu 'menyalakan' komputer Linux lengkap di dalam sebuah window — padahal perangkat fisiknya tetap laptop yang sama.",
        },
        { t: "diagram", key: "vm-dalam-host", caption: "VirtualBox 'berbohong' ke Xubuntu: dia mengira punya CPU, RAM, dan disk sendiri" },
        { t: "h", text: "Kenapa ini cara belajar terbaik" },
        {
          t: "ul",
          items: [
            "**Aman**: rusak? hapus, bikin baru, atau restore snapshot (seperti save-game).",
            "**Realistis**: Xubuntu di VM menjalankan Linux asli — command SSH, nginx, systemctl yang kamu pelajari di sini 100% sama dengan yang dipakai di server produksi.",
            "**Murah**: gratis, jalan di laptop yang sudah kamu punya.",
            "**Bisa di-Snapshot**: sebelum step berisiko (firewall, SSH hardening), klik Machine → Snapshot → Ambil Snapshot. Salah? Restore 30 detik.",
          ],
        },
        {
          t: "callout",
          kind: "info",
          text: "Konsep 'komputer yang berjalan sebagai software' ini akan muncul lagi nanti sebagai **Docker** (Bagian 7) — bedanya container berbagi kernel dengan host sehingga jauh lebih ringan. VirtualBox = satu OS penuh; container = proses yang diisolasi. Fondasinya sama.",
        },
      ],
      checklist: [
        "Saya paham VM adalah komputer lengkap yang berjalan sebagai software",
        "Saya tahu kenapa eksperimen di VM aman (bisa snapshot/delete)",
        "Saya tahu command yang dipelajari di VM berlaku sama di server asli",
      ],
    },
    {
      slug: "cek-xubuntu-dan-update",
      title: "Cek Instalasi Xubuntu & Update Dasar",
      summary: "Pastikan VM jalan normal, lalu biasakan update sebelum ngapa-ngapain.",
      requireChecklist: true,
      content: [
        { t: "h", text: "1. Nyalakan & kenali lingkungannya" },
        {
          t: "p",
          text: "Buka VirtualBox → klik **Start** pada VM Xubuntu-mu → login. Buka Terminal Emulator, jalankan:",
        },
        { t: "cmd", text: "hostnamectl", note: "tampilkan info sistem — pastikan OS-nya Ubuntu/Xubuntu dan arsitekturnya" },
        { t: "cmd", text: "df -h", note: "cek ruang disk — jangan sampai penuh, update bisa gagal" },
        { t: "cmd", text: "free -h", note: "cek RAM — kalau VM diberi <2GB, kerja terasa lambat" },
        {
          t: "p",
          text: "Catat username-mu dari output `whoami` — akan dipakai terus di command SSH nanti.",
        },
        { t: "cmd", text: "whoami", note: "siapa user-ku di sistem ini?" },
        { t: "h", text: "2. Update sistem (command paling dasar di dunia Linux server)" },
        { t: "cmd", text: "sudo apt update && sudo apt upgrade -y", note: "refresh katalog lalu pasang semua update; -y biar tidak tanya-tanya" },
        {
          t: "p",
          text: "Sama seperti yang dibahas di Bagian 0: `update` = sinkronkan daftar, `upgrade` = benar-benar pasang versi baru. Pada sistem baru, ini bisa memakan beberapa menit dan ratusan MB — normal. Kalau kernel ikut ter-update, **reboot** dulu: `sudo reboot`.",
        },
        { t: "cmd", text: "sudo reboot", note: "restart VM (hanya perlu kalau ada update kernel)" },
        {
          t: "callout",
          kind: "tip",
          text: "Kebiasaan baik yang dibangun dari sekarang: update minimal sebulan sekali, dan selalu `sudo apt update` sebelum install apa pun. Security patch (tambalan keamanan) adalah alasan utama update tidak boleh ditunda-tunda.",
        },
        { t: "h", text: "3. Ambil snapshot pertama" },
        {
          t: "p",
          text: "Sekarang VM-mu dalam kondisi bersih & ter-update. Di menu VirtualBox: **Machine → Take Snapshot** → beri nama `bersih-update`. Semua step berisiko ke depannya bisa di-restore ke titik ini.",
        },
      ],
      checklist: [
        "VM menyala normal dan bisa masuk desktop",
        "Aku tahu username-ku (hasil whoami)",
        "sudo apt update && upgrade selesai tanpa error",
        "Snapshot pertama sudah diambil",
      ],
      troubleshooting: [
        {
          q: "VM sangat lambat / sering freeze",
          a: [
            { t: "p", text: "Matikan VM (guest → shutdown, jangan cuma close window), lalu Settings → System: naikkan RAM ke 4096 MB jika laptop kuat (maksimum ~50% RAM fisik), dan Settings → Display: aktifkan 3D acceleration kalau perlu. Cek juga CPU count: Settings → System → Processor, beri 2 core." },
          ],
        },
        {
          q: "apt upgrade minta restart tapi saya tidak yakin service apa",
          a: [
            { t: "p", text: "Ubuntu menampilkan daftar service yang perlu di-restart; tekan Enter saja untuk pilihan default, lalu `sudo reboot` saat sempat. Untuk VM belajar: langsung reboot saja." },
          ],
        },
      ],
    },
  ],
};
