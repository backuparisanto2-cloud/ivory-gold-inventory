# Inventaris Lavin Kost — Detail Barang, Foto & Nota

Menambahkan data pembelian (vendor, harga, garansi), foto barang, foto nota/invoice/kuitansi, kondisi yang bisa ditambah sendiri, plus tampilan mobile yang lebih rapi.

## 1. Dashboard — ringkasan kondisi

Tambah panel "Kondisi Barang" berisi jumlah unit per kondisi (Baik / Perlu Perbaikan / Rusak / kondisi buatan sendiri), digabung dari inventaris kamar + fasilitas utama, dengan bar proporsi tipis dan link ke daftar terkait. Tambah juga total nilai pembelian dan jumlah barang yang garansinya akan/sudah habis.

## 2 & 3. Field baru untuk inventaris kamar dan fasilitas utama

Field yang ditambahkan di kedua jenis inventaris:

- Vendor / toko pembelian
- Harga pembelian (Rupiah) + tanggal pembelian
- Garansi: tanggal berakhir garansi (badge otomatis "Garansi aktif / habis")
- Foto barang (bisa beberapa)
- Foto nota/invoice dan kuitansi (bisa beberapa, terpisah dari foto barang)
- Kondisi: dropdown yang bisa diisi kondisi baru langsung dari form; kondisi baru tersimpan dan muncul di seluruh app

Form item diperbarui (dipakai kamar + fasilitas): input rapi bertingkat, upload dengan preview thumbnail, hapus foto per gambar, dan tampilan detail barang menampilkan galeri foto yang bisa diperbesar.

## 4. Mobile friendly

- Kartu barang dirapikan: nama + badge kondisi di baris atas, info harga/vendor/garansi jadi baris kecil, tombol +/- lebih besar (target sentuh min. 44px)
- Aksi edit/hapus dipindah ke menu tiga titik agar kartu tidak sempit
- Filter/pencarian jadi baris sticky di atas; tab lantai bisa digeser horizontal
- Dialog tampil sebagai sheet dari bawah di layar kecil, dengan tombol simpan menempel di bawah

## 5. Kompresi foto otomatis

Semua foto (barang maupun nota/kuitansi) dikompres di browser sebelum diunggah: konversi ke WebP, sisi terpanjang dibatasi (± 1600px), lalu kualitas diturunkan bertahap sampai ukuran file di bawah 300KB. Nama file disimpan berekstensi `.webp`. Kalau sebuah foto tetap tidak bisa turun di bawah 300KB, dimensi dikecilkan lagi otomatis.

## Catatan Teknis

- Migrasi menambah kolom pada `room_items` dan `shared_items`: `vendor text`, `purchase_price numeric`, `purchase_date date`, `warranty_until date`, `photos jsonb default '[]'`, `receipts jsonb default '[]'` (array path file). Kondisi disimpan sebagai `text` (sudah begitu) plus tabel baru `conditions(name text primary key, sort_order int)` diisi 3 kondisi awal, lengkap dengan GRANT + RLS publik seperti tabel lain.
- Storage: bucket publik `inventory-photos`, path `kamar/<room>/...` dan `fasilitas/...`, dengan policy `storage.objects` untuk baca/tulis/hapus publik (konsisten dengan app tanpa login saat ini).
- Kompresi pakai `canvas.toBlob('image/webp', q)` murni di browser, tanpa dependensi baru; helper baru `src/lib/image-compress.ts` dan `src/components/PhotoUploader.tsx`.
- `src/lib/inventory.ts` diperluas: query kondisi, tambah kondisi, upload/hapus foto, dan tipe item diperbarui.

## Keamanan

Karena app masih tanpa login, upload dan hapus foto terbuka untuk siapa pun yang punya URL app. Kalau nanti mau dibatasi, tinggal aktifkan login dan kunci policy-nya.
