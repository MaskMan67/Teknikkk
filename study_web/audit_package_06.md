# Audit Paket 6 - PK Day 5

## Koreksi mapping
- Paket 6 = `PK Day 5` sesuai urutan halaman asli.
- Anchor sumber:
  - `E:\Teknikkk\Projek MMA SNBT 2025.pages.txt` menampilkan `PK Day 5` pada `===== PAGE 30 =====` sampai `===== PAGE 36 =====`.
  - `E:\Teknikkk\study_web\data\questions.js` punya pack `"5"` dengan `day: 5` dan `title: "PK Day 5"`.
  - `E:\Teknikkk\study_web\app.js` membaca `window.PK_PACKS`, jadi pack day 5 memang bisa dipilih dari runtime data.

## Artefak yang dibaca
- `E:\Teknikkk\study_web\data\questions.js`
- `E:\Teknikkk\study_web\data\answer_keys.js`
- `E:\Teknikkk\study_web\scripts\audit_pk_render.py`
- `E:\Teknikkk\Projek MMA SNBT 2025.pages.txt`
- `E:\Teknikkk\Projek MMA SNBT 2025.pdf`
- `E:\Teknikkk\reconstruction_output\SNBT_REKONSTRUKSI.html`
- `E:\Teknikkk\reconstruction_output\snbt_reconstruction_bundle.json`
- `E:\Teknikkk\study_web\debug_page_30.png`
- `E:\Teknikkk\study_web\debug_page_31_hi.png`
- `E:\Teknikkk\study_web\debug_page_33_hi.png`
- `E:\Teknikkk\study_web\debug_page_34.png`
- `E:\Teknikkk\study_web\debug_page_36.png`
- `E:\Teknikkk\study_web\origin_pdf_page30.png`
- `E:\Teknikkk\study_web\origin_pdf_page31.png`
- `E:\Teknikkk\study_web\origin_pdf_page32.png`
- `E:\Teknikkk\study_web\origin_pdf_page33.png`
- `E:\Teknikkk\study_web\origin_pdf_page34.png`
- `E:\Teknikkk\study_web\origin_pdf_page35.png`
- `E:\Teknikkk\study_web\origin_pdf_page36.png`
- `E:\Teknikkk\study_web\assets\preview\day05_sheet.png`

## Screenshot yang dibuat
- `E:\Teknikkk\study_web\origin_pdf_page30.png`
- `E:\Teknikkk\study_web\origin_pdf_page31.png`
- `E:\Teknikkk\study_web\origin_pdf_page32.png`
- `E:\Teknikkk\study_web\origin_pdf_page33.png`
- `E:\Teknikkk\study_web\origin_pdf_page34.png`
- `E:\Teknikkk\study_web\origin_pdf_page35.png`
- `E:\Teknikkk\study_web\origin_pdf_page36.png`

## Hasil review visual
- Page 30, 31, 33, 34, 35, dan 36 terbaca jelas; tidak ada pemotongan teks yang mengganggu penurunan key.
- Day 5 q4 punya diagram bangun datar utuh.
- Day 5 q9-q11 memakai figure trapesium yang sama dan semua label koordinat terbaca.
- Day 5 q20 tetap terbaca sebagai satu soal lanjutan walau terbelah antar halaman.

## Temuan per nomor

| No | Source page | Current key sebelum patch | Proposed key | Evidence | Status |
|---|---:|---|---|---|---|
| 1 | 30 | missing | `36` | `sqrt(C) = 3 / (1/2) = 6` | applied |
| 2 | 30 | missing | `6` | Substitusi `x=4` ke `f(x) = (2x+4)/(6-x)` | applied |
| 3 | 30 | missing | `(b) 18` | Urutan naik `2,2,3,4,4,6,6,8,9,9` | applied |
| 4 | 30 | missing | `(d) 9` | Recheck final: hitungan semua persegi lengkap pada diagram adalah 9 | corrected in final integration |
| 5 | 30 | missing | `(e) 20` | `[1] = -4`, lalu `[-2 x [1]] = [8] = 20` | applied |
| 6 | 31 | missing | `(c) 4` | Opsi konsisten jika konstanta garis dibaca `+12`; render PDF terlihat seperti `+2` | source-issue |
| 7 | 31 | missing | `(d) 10` | Mengikuti bacaan `+12`, garis `k = y = 10x - 6` | source-issue |
| 8 | 31 | missing | `(d) 4` | Mengikuti garis `k = y = 10x - 6`, gradien tegak lurus memberi `c+d=4` | source-issue |
| 9 | 31 | missing | `(a) 4` | Jarak garis vertikal `x=2` dan `x=6` | applied |
| 10 | 31 | missing | `(b) 26` | Luas trapesium `1/2 x (8+5) x 4` | applied |
| 11 | 31-32 | missing | `(c) 78` | Volume `26 x 3` | applied |
| 12 | 32 | missing | `(b) (1) dan (3) SAJA` | `11^2-1=120`, `10^2-20=80` | applied |
| 13 | 32 | missing | `(b) (1) dan (3) SAJA` | `8/(x-1) < p(x) < 3^x`, jadi untuk `x=3` hanya 30 dan 3 yang mustahil | applied |
| 14 | 33 | missing | `(c) (2) dan (4) SAJA` | `sin(beta)=6/7` => `cos(beta)=sqrt(13)/7` | applied |
| 15 | 33 | missing | `(a) Kuantitas P lebih dari Q.` | `P = L1/L2 > 1`, `Q = 1/2` | applied |
| 16 | 33-34 | missing | `(b) Kuantitas P kurang dari Q.` | `P = 7 + 3u` dengan `u < 0`, sedangkan `Q = 7` | applied |
| 17 | 34 | missing | `(b) Kuantitas P kurang dari Q.` | Dari sistem, `12p + 4t - 3u = -1` dan `Q = 0` | applied |
| 18 | 34 | missing | `9` | Median 6,5 memaksa `p=6`, lalu `(range - median) = 1/2 = 9/18` | applied |
| 19 | 35 | missing | `(a) Pernyataan (1) SAJA cukup...` | `a20 + a24 = a10(3^10 + 3^14)`; `a10 < -1` cukup menjawab tidak, `a10 > -5` belum cukup | corrected in final integration |
| 20 | 35-36 | missing | `(a) Pernyataan (1) SAJA cukup...` | `2x^2 + (t-r)x + 3 = 0`; statement (1) memaksa diskriminan negatif | applied |
| 21 | 36 | missing | `2` | `(2/5) x 10 = 4`, jadi `6 - t = 4` | applied |
| 22 | 36 | missing | `5` | `f(-5) = -5`, jadi `p = 5` | applied |
| 23 | 36 | missing | `-3` | Titik potong `x = 3` dan `x = -1` memberi `b+d = -3` | applied |
| 24 | 36 | missing | `9/4` | Gradien melalui `(3,3)` dan `(-1,-6)` | applied |
| 25 | 36 | missing | `-1/4` | Garis sejajar bergradien `9/4`, lalu `n = 2 - 9/4` | applied |

## Status fix
- Final integration mengisi `D05Q01..D05Q25` di `E:\Teknikkk\study_web\data\answer_keys.js`.
- Final integration mengoreksi `D05Q04` menjadi `(d) 9` dan `D05Q19` menjadi `(a)`.
- `D05Q06`-`D05Q08` diberi status `source-issue` karena render PDF terlihat seperti `+2`, tetapi opsi dan kunci konsisten dengan bacaan `+12`.
- Tidak ada perubahan pada `questions.js`; `PK Day 5` sudah ada di `window.PK_PACKS['5']` dan runtime membaca `window.PK_PACKS` langsung.
- Satu-satunya area yang sempat ambigu adalah q6-q8, tapi setelah cek render asli dan corroboration lokal, kuncinya konsisten: `4`, `10`, `4`.
