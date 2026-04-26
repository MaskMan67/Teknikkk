# Audit Paket 3 - PK Day 2

Scope:
- Source generator: `study_web/data/questions.js`, `study_web/data/answer_keys.js`
- Generator script: `study_web/scripts/extract_pk_samples.py`
- Asset referensi: `study_web/assets/preview/day02_sheet.png`, `study_web/assets/questions/day02_*.png`
- PDF source: `Projek MMA SNBT 2025.pages.txt`
- Render tambahan: `study_web/audit_p15.png` sampai `study_web/audit_p20.png`

Ringkasan:
- Saat audit awal, `questions.js`/`answer_keys.js` belum memuat PK Day 2. Setelah final integration, `questions.js` sudah memuat `PK Day 2` dan `answer_keys.js` sudah memuat `D02Q01` sampai `D02Q20`.
- Asset yang ada untuk day2 hanya cover q1-q5 dan q9-q11; nomor lain belum punya crop `day02_*` khusus.
- PDF source menunjukkan PK Day 2 lengkap di halaman 13-19, jadi kunci di bawah diturunkan dari source asli, bukan dari answer key lama.

## Hasil per nomor

| No | Current key | Proposed key | Evidence / source page | Issue / fix recommendation |
|---|---|---|---|---|
| 1 | kosong | `45` | `Projek MMA SNBT 2025.pages.txt` page 13; `assets/questions/day02_q01.png` | No day2 entry in generator; add PK Day 2 pack if UI should surface it. |
| 2 | kosong | `12` | page 13; `assets/questions/day02_q02.png` | Same as above. |
| 3 | kosong | `4` | page 13; `assets/questions/day02_q03.png` | Same as above. |
| 4 | kosong | `9` | page 13; `assets/questions/day02_q04.png` | Figure is readable; keep crop, but regenerate only if you want a tighter square-count visual. |
| 5 | kosong | `-2` | page 13; `assets/questions/day02_q05.png` | Nested absolute-value notation is legible; no crop issue. |
| 6 | kosong | `0` | `audit_p15.png` / PDF page 14 | No day2 crop asset exists; add `day02_q06.png` if the app needs per-question images. |
| 7 | kosong | `7` | `audit_p15.png` / PDF page 14 | Same gap: missing crop asset. |
| 8 | kosong | `y = 7x + 9` | `audit_p15.png` / PDF page 14 | Same gap: missing crop asset. |
| 9 | kosong | `5` | `assets/questions/day02_q09_q11.png`; `audit_p15.png` page 14 | Composite asset exists and is readable. |
| 10 | kosong | `35` | same as no. 9; PDF page 14 | Composite asset exists and is readable. |
| 11 | kosong | `3` | same as no. 9; `audit_p16.png` / PDF page 15 | Composite asset exists and is readable. |
| 12 | kosong | `"(e) SEMUA PILIHAN"` | `audit_p16.png` / PDF page 15 | No crop asset exists; add if the UI should expose per-question images. |
| 13 | kosong | `"(e) SEMUA PILIHAN"` | `audit_p16.png` / PDF page 15 | Same gap. |
| 14 | kosong | `"(a) (1), (2), dan (3) SAJA"` | `audit_p16.png` / PDF page 15 and `audit_p17.png` / PDF page 16 | Same gap; statement crop spans the page break cleanly in the PDF render. |
| 15 | kosong | `Kuantitas P kurang dari Q` | `audit_p17.png` / PDF page 16 | No day2 crop asset exists; evidence is in PDF render only. |
| 16 | kosong | `Kuantitas P kurang dari Q` | `audit_p17.png` / PDF page 16 and `audit_p18.png` / PDF page 17 | No crop asset exists; custom matrix notation is readable in render. |
| 17 | kosong | `Kuantitas P sama dengan Q` | `audit_p18.png` / PDF page 17 | No crop asset exists. |
| 18 | kosong | `12` | `audit_p19.png` / PDF page 18 | No crop asset exists. |
| 19 | kosong | `"(b) Pernyataan (2) SAJA cukup..."` | `audit_p19.png` / PDF page 18 | No crop asset exists. |
| 20 | kosong | `"(d) Pernyataan (1) SAJA cukup ... dan (2) SAJA cukup"` | `audit_p19.png` + `audit_p20.png` / PDF pages 18-19 | Soal terbelah antar halaman; keep `source_pages: [18, 19]` if pack is generated. |

## Catatan verifikasi

- `study_web/scripts/extract_pk_samples.py` masih menulis `window.PK_DAY1_DATA = window.PK_PACKS['1'];` sehingga PK Day 2 tidak ikut diekspor oleh generator lama.
- `study_web/data/answer_keys.js` tidak punya entri `D02Q*`, jadi current key untuk paket ini benar-benar kosong.
- Final integration sudah membuat Paket 3 tampil di UI lewat `window.PK_PACKS['2']` dan mengisi `answer_keys.js` dengan kunci di atas.
