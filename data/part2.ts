import type { Part } from "@/lib/types";

export const part2: Part = {
  id: 2,
  title: "Bagian 2 — Networking VirtualBox",
  desc: "Semua opsi network VirtualBox dijelaskan lengkap, dengan satu rekomendasi jelas untuk tujuan belajar.",
  steps: [
    {
      slug: "konsep-networking-virtualbox",
      title: "Konsep Networking VirtualBox",
      summary: "NAT, Bridged, Host-only — apa bedanya, kapan pakai yang mana.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Masalahnya: VM-mu 'dicolok' ke jaringan mana?" },
        {
          t: "p",
          text: "Secara default, VirtualBox menyembunyikan VM dari jaringan aslimu — VM tidak bisa dijangkau laptopmu sendiri lewat network. Pilihan **attachment type** di Settings → Network menentukan 'kabel virtual' mana yang dihubungkan. Ini keputusan terpenting di setup-mu, jadi kita bahas semua opsi sebelum memilih.",
        },
        { t: "h", text: "Opsi 1 — NAT (default)" },
        { t: "diagram", key: "nat", caption: "NAT: VM 'bersembunyi' di belakang VirtualBox. VM bisa keluar, tapi tidak ada yang bisa masuk tanpa port-forwarding manual" },
        {
          t: "ul",
          items: [
            "VM bisa akses internet (lewat 'sharing' koneksi host). Setup nol — sudah aktif default.",
            "TAPI: host (laptopmu sendiri) TIDAK bisa akses VM lewat IP biasa — harus konfigurasi **port forwarding** VirtualBox dulu, ribet dan membingungkan pemula.",
            "Cocok untuk: kalau kamu cuma butuh VM untuk browsing internet, tanpa perlu koneksi masuk.",
          ],
        },
        { t: "h", text: "Opsi 2 — Bridged Adapter ⭐ REKOMENDASI KAMI" },
        { t: "diagram", key: "bridged", caption: "Bridged: VM 'dicolok langsung' ke WiFi/LAN yang sama — dapat IP 192.168.x.x sendiri, diperlakukan seperti perangkat lain" },
        {
          t: "ul",
          items: [
            "VM meminta IP sendiri ke router-mu (via DHCP), jadi berada di jaringan yang sama dengan laptop: `192.168.1.x`.",
            "Host bisa langsung `ssh` & buka browser ke IP VM. Tanpa konfigurasi tambahan. Konsepnya paling mudah dijelaskan dan dipraktikkan.",
            "Kekurangannya: di beberapa jaringan kampus/kantor, router menolak perangkat 'baru' (MAC filtering) — VM tidak dapat IP. Dan kalau kamu pindah WiFi, IP VM berubah.",
          ],
        },
        { t: "h", text: "Opsi 3 — Host-only Adapter" },
        { t: "diagram", key: "host-only-nat", caption: "Dual adapter: Host-only (jaringan privat host↔VM, IP tetap) + NAT (internet)" },
        {
          t: "ul",
          items: [
            "Membuat jaringan privat antara host & VM saja: bisa saling akses, tapi VM tidak punya internet.",
            "Sendirian tidak cukup — tapi dipasangkan dengan adapter NAT (VM punya 2 adapter), kamu dapat akses stabil + internet. IP jaringan host-only tidak berubah walau kamu pindah WiFi — ini solusinya kalau laptop sering pindah jaringan.",
          ],
        },
        { t: "h", text: "Opsi 4 — NAT Network (jarang dibutuhkan)" },
        {
          t: "p",
          text: "Varian NAT yang bisa diakses host & sesama VM di jaringan NAT yang sama. Tidak kita butuhkan untuk satu VM — disebut di sini supaya daftarnya lengkap.",
        },
        {
          t: "callout",
          kind: "tip",
          text: "Rekomendasi: **Bridged** dulu (paling mudah dipahami & dipraktikkan). Kalau laptopmu sering pindah WiFi atau jaringan kampus memblokir, baru pindah ke dual **Host-only + NAT**. Step berikutnya mempraktikkan Bridged; catatan Host-only disertakan di troubleshooting.",
        },
      ],
      checklist: [
        "Saya paham NAT membuat VM tidak bisa diakses dari host tanpa port forwarding",
        "Saya paham Bridged memberi VM IP sendiri di jaringan LAN yang sama",
        "Saya tahu kenapa Host-only saja tidak cukup (tidak ada internet)",
        "Saya sudah tentukan mau pakai mode mana (default: Bridged)",
      ],
    },
    {
      slug: "setup-network-adapter",
      title: "Setup Network Adapter",
      summary: "Praktek: ubah setting ke Bridged, lalu verifikasi VM dapat IP sendiri.",
      requireChecklist: true,
      content: [
        { t: "h", text: "Langkah 1 — Ubah setting VirtualBox" },
        {
          t: "ol",
          items: [
            "VM harus **mati total** (Powered Off, bukan Saved) — klik kanan VM → Show → Power Off jika perlu.",
            "Klik VM → **Settings → Network**.",
            "Adapter 1: centang *Enable Network Adapter*, pilih **Attached to: Bridged Adapter**.",
            "Name: pilih adapter WiFi/Ethernet laptopmu yang sedang dipakai untuk internet (misal `Intel Wi-Fi 6...`, jangan `VirtualBox Host-Only Ethernet Adapter`).",
            "OK, lalu Start VM.",
          ],
        },
        { t: "h", text: "Langkah 2 — Minta IP baru ke router" },
        {
          t: "p",
          text: "Setelah VM nyala, router DHCP akan memberi IP 'baru' untuk 'perangkat' VM ini. Kadang perlu memicu ulang: restart network agent, atau cukup reboot VM. Cek hasilnya:",
        },
        { t: "cmd", text: "ip a", note: "tampilkan semua interface & IP-nya" },
        {
          t: "p",
          text: "Cari interface utama (umumnya `enp0s3` atau `ens33` — BUKAN `lo`). IP Bridged terlihat seperti `192.168.1.x/24` — satu segment dengan IP laptopmu. Bandingkan: di PowerShell host jalankan `ipconfig`, keduanya harus sama-sama `192.168.1.x`.",
        },
        { t: "cmd", text: "ping -c 3 8.8.8.8", note: " tes konektivitas internet dari VM" },
        { t: "cmd", text: "ping -c 3 google.com", note: "tes juga DNS — kalau IP bisa tapi nama gagal, masalahnya DNS" },
        { t: "h", text: "Langkah 3 — GUI tidak perlu dimatikan" },
        {
          t: "p",
          text: "Kamu mungkin membaca saran 'matikan tampilan grafis server demi performa'. Untuk VM belajar seperti punyamu, biarkan saja desktop Xubuntu tetap menyala — jauh lebih mudah diikuti. Server produksi sungguhan memang tanpa GUI, tapi semua command yang kamu ketik di sini tetap sama persis di sana.",
        },
      ],
      checklist: [
        "Settings → Network sudah Bridged dengan adapter fisik yang benar",
        "ip a menampilkan IP 192.168.1.x di interface utama (catat IP ini!)",
        "ping 8.8.8.8 sukses dari VM",
        "Aku menuliskan IP VM di catatan — akan dipakai terus",
      ],
      troubleshooting: [
        {
          q: "ip a tidak menampilkan IP sama sekali (atau hanya 169.254.x.x)",
          a: [
            { t: "p", text: "DHCP tidak menjawab. Cek: (1) salah pilih Name adapter? harus adapter yang benar-benar online. (2) Jaringan kampus/kantor sering blokir — solusinya mode **Host-only + NAT**: Settings → Adapter 1 = Host-only (Name: VirtualBox Host-Only Ethernet Adapter), Adapter 2 = NAT; di guest jalankan `sudo dhclient enp0s8` untuk interface host-only. (3) Cabut-pasang: `sudo ip link set enp0s3 down && sudo ip link set enp0s3 up`." },
          ],
        },
        {
          q: "Bisa ping IP tapi tidak bisa buka website",
          a: [{ t: "p", text: "Masalah DNS. Cek `cat /etc/resolv.conf` — harus ada nameserver (misal 1.1.1.1). Kalau kosong/rusak: `sudo resolvectl` atau set DNS di Netplan. Cara cepat tes: `ping -c 3 1.1.1.1` (harus bisa) lalu `nslookup google.com`." }],
        },
        {
          q: "IP VM berubah tiap hari, SSH jadi sering gagal",
          a: [{ t: "p", text: "Normal — DHCP memberi IP 'sewa'. Solusi paling benar: di router, kunci IP berdasarkan MAC VM (menu DHCP binding; cek MAC di `ip a` baris link/ether). Cara sederhana yang sah untuk belajar: biasakan cek `ip a` dulu sebelum SSH, atau pakai mode Host-only (IP-nya jarang berubah)." }],
        },
      ],
    },
  ],
};
