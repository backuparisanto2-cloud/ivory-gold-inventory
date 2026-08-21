# Aplikasi Inventaris Lavin Kost Purwokerto

Web app responsif + bisa dipasang di home screen (PWA), tema putih gading dengan garis emas halus. Data disimpan di Lovable Cloud, tanpa login dulu.

## Struktur Data

Tiga tabel:

1. `rooms` — 32 kamar, dibuat otomatis lewat migrasi:
   - Lantai 1: 001-010 (10 kamar)
   - Lantai 2: 011-021 (11 kamar)
   - Lantai 3: 022-032 (11 kamar)
2. `room_items` — inventaris per kamar: nama barang, jumlah, kondisi (Baik / Rusak / Perlu Perbaikan), catatan.
   Setiap kamar diisi awal dengan item standar: TV, AC, Dipan, Meja Belajar, Kursi Pendek, Kursi Panjang, MCB Listrik, Kasur, Bantal Guling.
3. `shared_items` — fasilitas utama (dipakai bersama): nama, kategori, jumlah, kondisi, lokasi, catatan.
   Diisi awal: Pompa Air, Torent Air, Pagar, Trafo Listrik Utama, Kompor Gas, Dapur 1-3, Lampu Halaman 1-2, Access Point 1, IP Camera 1-2.

Semua tabel bisa dibaca dan diubah tanpa login (akses publik), sesuai permintaan. Bisa dikunci dengan login nanti.

## Halaman

```text
/                 Dashboard: ringkasan total kamar, total item,
                  item rusak/perlu perbaikan, akses cepat
/kamar            Daftar kamar per lantai (tab Lantai 1/2/3)
/kamar/$nomor     Detail kamar: tabel item + tambah/edit/hapus,
                  tombol +/- cepat untuk jumlah
/fasilitas        Fasilitas utama kost: tambah/edit/hapus,
                  filter kategori, tombol +/- jumlah
```

## Fungsi CRUD

- Tambah item baru (nama bebas, jadi bisa di luar daftar standar)
- Edit nama, jumlah, kondisi, catatan
- Tambah/kurang jumlah cepat (+ / -)
- Hapus item dengan konfirmasi
- Salin daftar item standar ke kamar yang masih kosong (sekali klik)
- Pencarian item per nama

## Desain

- Latar putih gading (ivory), kartu putih, garis tipis emas (hairline) sebagai pembatas
- Aksen emas untuk tombol utama dan angka penting; teks abu tua kecoklatan
- Tipografi: judul serif elegan + body sans-serif bersih
- Mobile-first: kartu kamar grid, tabel item jadi kartu di layar kecil, bottom nav di HP
- Badge kondisi: Baik (emas/hijau lembut), Perlu Perbaikan (amber), Rusak (merah lembut)

## PWA

Manifest + ikon + tema warna supaya bisa "Add to Home Screen" dan tampil layar penuh. Tanpa mode offline (bisa ditambah nanti kalau diperlukan).

## Catatan Teknis

- Lovable Cloud (Postgres) diaktifkan; tabel dibuat via migrasi lengkap dengan GRANT + RLS policy publik
- Data awal (32 kamar, item standar per kamar, fasilitas utama) di-insert langsung di migrasi
- Baca/tulis lewat server function TanStack Start + TanStack Query untuk update instan
- Token warna emas/ivory didefinisikan di `src/styles.css` (oklch), bukan warna hardcode
