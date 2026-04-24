# PK Multi-Day Cropping Workflow

## Tujuan

- Menjaga crop soal tetap satu tujuan: prompt utuh, ilustrasi utuh, dan tidak mengambil soal sebelah.
- Menyimpan output sebagai pack Day 1-5 dalam satu website sprint 60 detik.
- Mendukung `images[]` per soal supaya crop terpisah tetap bisa dirender dalam satu kartu soal.

## Yang Harus Dicek

- PDF sumber masih ada di `E:\Teknikkk\Projek MMA SNBT 2025.pdf`.
- Pack day yang dihasilkan benar: Day 1, Day 2, Day 3, Day 4, Day 5.
- Jumlah soal mengikuti PDF, bukan dipaksa 20 untuk semua day.
- Soal yang punya ilustrasi terpisah sudah punya `images[]` lebih dari satu jika memang perlu.
- Soal yang terbelah antar halaman sudah punya `source_pages` lebih dari satu.
- `data/questions.js` selalu sinkron dengan PNG terbaru di `assets/questions/`.
- Web lokal bisa memuat PNG tanpa 404.

## Yang Harus Dijalankan

1. Compile generator dulu.
2. Jalankan generator untuk membangun ulang PNG dan metadata.
3. Jalankan server lokal.
4. Buka website dan cek pemilih Day 1-5.
5. Cek pack count, progress counter, dan ring waktu.
6. Cek soal dengan figure terpisah dan soal split halaman.
7. Perbaiki crop yang masih terlalu sempit atau masih ikut soal lain.
8. Ulangi sampai preview visual aman.

## Perintah Utama

```powershell
python -m py_compile E:\Teknikkk\study_web\scripts\extract_pk_samples.py
python E:\Teknikkk\study_web\scripts\extract_pk_samples.py
python -m http.server 8765 --directory E:\Teknikkk\study_web
```

## Prosedur Cropping

1. Identifikasi semua day dan halaman sumbernya.
2. Tentukan `prompt` soal dari teks PDF yang benar-benar milik soal itu.
3. Buang garis watermark, footer nomor halaman, dan label koordinat yang hanya milik diagram.
4. Untuk soal dengan ilustrasi yang berdiri sendiri, crop ilustrasinya sebagai image terpisah.
5. Untuk soal yang memakai ilustrasi sama di beberapa nomor, pakai file crop yang sama di beberapa soal.
6. Untuk soal terbelah antar halaman, simpan bagian atas dan bawah sebagai crop terpisah jika diperlukan.
7. Simpan hasil image ke `assets/questions/` dengan nama yang konsisten.
8. Tulis metadata ke `data/questions.js` dengan schema `images[]`.

## Aturan Kualitas Crop

- Prompt harus tetap masuk akal dibaca tanpa harus menebak konteks di luar soal.
- Ilustrasi tidak boleh memotong label penting, koordinat, atau sisi diagram.
- Crop tidak boleh mengambil soal setelahnya.
- Untuk soal pilihan ganda, crop dan prompt harus berhenti di pilihan jawaban terakhir; section berikutnya tidak boleh ikut masuk.
- Kalau soal punya beberapa image, urutannya harus benar: prompt dulu, lalu image sesuai urutan baca.
- Kalau crop terlalu sempit, longgarkan dengan margin kecil; jangan langsung komposit dulu.

## Checklist Audit Visual

- Day 1 tetap tampil.
- Day 2 tampil 20 soal.
- Day 3 tampil 20 soal.
- Day 4 tampil 8 soal.
- Day 5 tampil 25 soal.
- Day 2 q4 punya diagram bangun datar yang utuh.
- Day 2 q9-q11 pakai figure trapesium yang sama.
- Day 3 q4 punya diagram segitiga yang utuh.
- Day 3 q9-q11 pakai figure segitiga yang sama.
- Day 4 q4 punya diagram segitiga yang utuh.
- Day 5 q4 punya diagram bangun datar yang utuh.
- Day 5 q9-q11 pakai figure trapesium yang sama.
- Day 5 q23-q25 tetap terbaca sebagai satu teks lanjutan.

## Kasus Khusus Yang Wajib Dicek Manual

- Day 2 q14 dan q20 terbelah antar halaman.
- Day 3 q20 terbelah antar halaman.
- Day 5 q20 terbelah antar halaman.
- Soal dengan prefix Teks 1 / Teks 2 / Teks 3 harus tetap punya konteks penuh di prompt.
- Soal dengan figure bersama harus tetap punya image yang sama di beberapa nomor.

## Output Yang Harus Ada Setelah Selesai

- `assets/questions/day01_*.png` sampai `day05_*.png` sesuai kebutuhan crop.
- `data/questions.js` dengan `window.PK_PACKS` dan `window.PK_DAY1_DATA`.
- Web lokal yang bisa memilih Day 1-5 dan menampilkan soal dengan benar.

## Definisi Selesai

- Semua day tampil di UI dan bisa dipilih.
- Prompt per soal terbaca.
- Ilustrasi per soal tampil sesuai nomor dan tidak tercampur.
- Split halaman tidak memutus soal.
- Tidak ada 404 untuk aset PNG.
- Layout tetap cepat dipakai untuk latihan kurang dari 1 menit per soal.
