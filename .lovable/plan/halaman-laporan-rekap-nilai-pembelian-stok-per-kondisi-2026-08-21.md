# Halaman Laporan: Rekap Nilai Pembelian & Stok per Kondisi

Halaman baru `/laporan` yang merekap nilai pembelian dan jumlah stok berdasarkan kondisi, untuk inventaris kamar maupun inventaris utama, dengan filter rentang tanggal pembelian.

## Filter

- Rentang tanggal berdasarkan **tanggal pembelian** (`purchase_date`): input Dari dan Sampai.
- Pilihan cepat: Bulan ini, 3 bulan terakhir, Tahun ini, Semua data.
- Lingkup data: Semua / Kamar saja / Fasilitas utama saja; untuk kamar bisa dipersempit per lantai.
- Filter tersimpan di URL (bisa dibagikan/bookmark), jadi refresh tidak menghilangkan pilihan.
- Barang tanpa tanggal pembelian dihitung terpisah dan ditampilkan sebagai baris "Tanpa tanggal pembelian" supaya tidak hilang diam-diam.

## Isi Laporan

1. Kartu ringkasan: total nilai pembelian, jumlah jenis barang, total unit, jumlah barang perlu perhatian (kondisi bukan "Baik"), dan nilai barang rusak/perlu perbaikan.
2. Rekap per kondisi (mengikuti daftar kondisi di database, termasuk kondisi tambahan buatan sendiri): jumlah jenis, total unit, total nilai, dan persentase nilai — dengan bar emas/amber/merah.
3. Rekap per lantai + per kamar (Lantai 1/2/3): jenis barang, total unit, nilai pembelian, jumlah item perlu perhatian; tiap baris kamar bisa diklik ke halaman kamar.
4. Rekap fasilitas utama per kategori: jenis, unit, nilai, item perlu perhatian.
5. Daftar 10 pembelian bernilai tertinggi dalam rentang tanggal (nama, lokasi/kamar, vendor, tanggal, harga).
6. Tombol Unduh CSV untuk seluruh baris terfilter (nama, jenis kamar/fasilitas, kamar/kategori, jumlah, kondisi, vendor, harga, tanggal beli, garansi) agar bisa dibuka di Excel.

## Navigasi

Menu "Laporan" ditambahkan ke navigasi atas (desktop) dan bottom nav (mobile jadi 4 kolom), plus tautan cepat dari dashboard.

## Desain

Mengikuti tema yang sudah ada: latar putih gading, kartu `gold-card` dengan garis emas halus, judul serif, angka `tabular-nums`. Mobile-first: kartu bertumpuk dan tabel yang bisa di-scroll horizontal, area filter menempel di atas saat menggulir.

## Catatan Teknis

- Route baru `src/routes/laporan.tsx` dengan `head()` sendiri (title/description/og).
- Filter memakai `validateSearch` + `fallback` dari `@tanstack/zod-adapter` (`dari`, `sampai`, `lingkup`, `lantai`).
- Data dari query yang sudah ada (`roomsQuery`, `allRoomItemsQuery`, `sharedItemsQuery`, `conditionsQuery`); agregasi dilakukan di klien dengan `useMemo` — tanpa perubahan skema database.
- Helper agregasi + pembuat CSV dipisah ke `src/lib/report.ts` agar mudah diuji dan dipakai ulang.
- `formatRupiah` yang sudah ada dipakai untuk semua nilai uang.
