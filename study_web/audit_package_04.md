# Audit Paket 4 - PK Day 3

## Ringkasan
- Paket 4 yang benar adalah `PK Day 3`.
- Source page yang relevan: PDF halaman 21-27.
- Asset yang terkait: `study_web/assets/questions/day03_q01.png` sampai `day03_q05.png` dan `day03_q09_q11.png`.
- Runtime data saat ini belum memuat `D03Q01..D03Q20` di `study_web/data/questions.js` dan `study_web/data/answer_keys.js`; yang ada hanya `D01Q01..D01Q20`.
- Jadi status paket ini saat audit adalah: **belum terpasang di website**, dan perlu append data Day 3 ke generator/data runtime.

## Mapping sumber
- Halaman 21: soal 1-5
- Halaman 22: soal 6-8 dan awal teks soal 9-11
- Halaman 23: soal 9-13
- Halaman 24: soal 14-15
- Halaman 25: soal 16-17
- Halaman 26: soal 18-20
- Halaman 27: lanjutan opsi soal 20

## Temuan per nomor

| No | Current key di runtime | Proposed key | Evidence sumber | Status |
|---|---|---|---|---|
| 1 | missing | `36` | Page 21, crop `day03_q01.png` | OK |
| 2 | missing | `3` | Page 21, crop `day03_q01.png` | OK |
| 3 | missing | `(E) 10` | Page 21, crop `day03_q03.png` | OK |
| 4 | missing | `10` | Page 21, crop `day03_q04.png` | OK |
| 5 | missing | `(A) -6` | Page 21, crop `day03_q05.png` | Resolved in final integration |
| 6 | missing | `(c) 4` | Page 22 | OK |
| 7 | missing | `(e) 2` | Page 22 | OK |
| 8 | missing | `(b) 2y + x - 3 = 0` | Page 22 | OK |
| 9 | missing | `(a) 8` | Page 23, `day03_q09_q11.png` | OK |
| 10 | missing | `(e) 24` | Page 23, `day03_q09_q11.png` | OK |
| 11 | missing | `(c) 2` | Page 23, `day03_q09_q11.png` | OK |
| 12 | missing | `(e) SEMUA PILIHAN` | Page 23 | OK |
| 13 | missing | `(e) SEMUA PILIHAN` | Page 23 | OK |
| 14 | missing | `(a) (1), (2), dan (3) SAJA` | Page 24 | OK |
| 15 | missing | `(a) Kuantitas P lebih dari Q` | Page 24 | OK |
| 16 | missing | `(d) Tidak dapat ditentukan hubungan antara kuantitas P dan Q` | Page 25 | OK |
| 17 | missing | `(a) Kuantitas P lebih dari Q` | Page 25 | OK |
| 18 | missing | `32` | Page 26 | OK |
| 19 | missing | `(a) Pernyataan (1) SAJA cukup ...` | Page 26 | Corrected in final integration |
| 20 | missing | `(e) Pernyataan (1) dan pernyataan (2) tidak cukup ...` | Page 26-27 | OK |

## Catatan masalah
- `study_web/data/questions.js` tidak memuat paket Day 3 sama sekali, jadi Paket 4 tidak bisa dirender dari website saat ini.
- `study_web/data/answer_keys.js` juga belum punya `D03Q...`.
- Soal nomor 5 sudah diverifikasi ulang dari crop: inner `|-4| = -4`, outer `|5| = -6`, sehingga kunci final `(A) -6`.

## Rekomendasi patch
1. Append blok `PK Day 3` ke `study_web/data/questions.js` dengan `D03Q01..D03Q20`.
2. Append kunci `D03Q01..D03Q20` ke `study_web/data/answer_keys.js`.
3. Untuk nomor 19, gunakan hasil hitung ulang final: pernyataan (1) saja cukup.
4. Setelah data ditambahkan, render `index.html?day=3` dan ambil screenshot browser penuh untuk verifikasi visual.

## Screenshot / render yang dibuat
- `study_web/audit_package_04_pages/page21.png`
- `study_web/audit_package_04_pages/page22.png`
- `study_web/audit_package_04_pages/page23.png`
- `study_web/audit_package_04_pages/page24.png`
- `study_web/audit_package_04_pages/page25.png`
- `study_web/audit_package_04_pages/page26.png`
- `study_web/audit_package_04_pages/page27.png`
