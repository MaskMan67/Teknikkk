# Audit Paket 5 - PK Day 4

## Koreksi mapping
- Paket 5 yang benar adalah `PK Day 4`, bukan `PK Day 5`.
- Anchor sumber:
  - `E:\Teknikkk\Projek MMA SNBT 2025.pages.txt` menampilkan `PK Day 4` pada `===== PAGE 28 =====`.
  - `E:\Teknikkk\reconstruction_output\SNBT_REKONSTRUKSI.html` memiliki section `Day 4` dengan 8 soal.

## Artefak yang dibaca
- `E:\Teknikkk\study_web\data\questions.js`
- `E:\Teknikkk\study_web\data\answer_keys.js`
- `E:\Teknikkk\study_web\scripts\extract_pk_samples.py`
- `E:\Teknikkk\Projek MMA SNBT 2025.pages.txt`
- `E:\Teknikkk\build\pk_projek_source.txt`
- `E:\Teknikkk\reconstruction_output\snbt_reconstruction_bundle.json`
- `E:\Teknikkk\reconstruction_output\SNBT_REKONSTRUKSI.html`
- `E:\Teknikkk\study_web\assets\preview\day04_sheet.png`
- `E:\Teknikkk\study_web\assets\questions\day04_q04.png`
- `E:\Teknikkk\study_web\assets\questions\day04_q05.png`

## Screenshot yang dibuat
- `E:\Teknikkk\study_web\audit_package_05_page28.png`
- `E:\Teknikkk\study_web\audit_package_05_day04_sheet.png`
- `E:\Teknikkk\study_web\audit_package_05_day4_section.png`

## Hasil review visual
- Page 28-29 PDF render bersih; semua soal PK Day 4 tampil lengkap.
- `day04_q04.png` jelas dan cukup untuk hitung jumlah segitiga.
- `day04_q05.png` jelas; struktur pecahan bertingkat terbaca dan cocok dengan source.
- Tidak ada teks terpotong pada Q1-Q5 di source render.

## Temuan per nomor

| No | Source page | Current key | Proposed key | Evidence | Status |
|---|---:|---|---|---|---|
| 1 | 28 | missing in active study_web data | `2` | `b + 1/4 = 9/4`, jadi `b = 2` | fix not applied |
| 2 | 28 | missing in active study_web data | `17` | `4 - 6 + c = 15` | fix not applied |
| 3 | 28 | missing in active study_web data | `(d) 14` | Urutan: `1, 1, 2, 3, 4, 5, 5, 6, 7, 9`, jadi `2 + 2*6 = 14` | fix not applied |
| 4 | 28 | missing in active study_web data | `8` | Diagram menghasilkan 8 segitiga total | fix not applied |
| 5 | 28 | missing in active study_web data | `(B) 2` | `f(2)=3`, lalu `f(3-3)=f(0)=2` | fix not applied |
| 6 | 29 | missing in active study_web data | `A. 1` | Titik potong f dan g terjadi pada x=1 dan x=2; karena b<q, a=1 | applied in final integration |
| 7 | 29 | missing in active study_web data | `D. 5` | Gradien melalui (1,2) dan (2,7) adalah 5 | applied in final integration |
| 8 | 29 | missing in active study_web data | `D. 17` | Garis sejajar l melalui (5,3): c=22, c-k=17 | applied in final integration |

## Status fix
- Tidak ada patch langsung pada shared data file.
- Alasan: `questions.js` dan `answer_keys.js` dipakai lintas paket; risiko konflik dengan sub-agent Paket 3, 4, dan 6 tinggi.
- Rekomendasi patch terarah:
  - append blok `day: 4` / `PK Day 4` ke `E:\Teknikkk\study_web\data\questions.js`
  - append key `D04Q01` s.d. `D04Q05` ke `E:\Teknikkk\study_web\data\answer_keys.js`
  - gunakan source page 28 dan render `day04_sheet.png` / `day04_q04.png` / `day04_q05.png` sebagai evidence review

## Catatan
- Final integration sudah mengaktifkan data PK di website utama dan mengisi kunci `D04Q01` sampai `D04Q08`.
