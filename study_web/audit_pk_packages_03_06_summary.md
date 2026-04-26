# Audit Final Paket 3-6 PK

Scope final:
- Paket 3 = `PK Day 2` (`D02Q01`-`D02Q20`)
- Paket 4 = `PK Day 3` (`D03Q01`-`D03Q20`)
- Paket 5 = `PK Day 4` (`D04Q01`-`D04Q08`)
- Paket 6 = `PK Day 5` (`D05Q01`-`D05Q25`)

## Status data

- `study_web/data/questions.js` sudah memuat paket PK Day 1-5 dari generator PK.
- `study_web/data/answer_keys.js` sudah memuat semua kunci untuk Paket 3-6.
- Validasi runtime:
  - `PK Day 2`: 20 soal, missing key 0
  - `PK Day 3`: 20 soal, missing key 0
  - `PK Day 4`: 8 soal, missing key 0
  - `PK Day 5`: 25 soal, missing key 0

## Validasi Playwright

Script:
- `study_web/scripts/audit_pk_render.py`

Output:
- `study_web/audit_pk_render/render_audit.json`
- Screenshot per soal:
  - `study_web/audit_pk_render/day02/q01.png` sampai `q20.png`
  - `study_web/audit_pk_render/day03/q01.png` sampai `q20.png`
  - `study_web/audit_pk_render/day04/q01.png` sampai `q08.png`
  - `study_web/audit_pk_render/day05/q01.png` sampai `q25.png`

Hasil terakhir:
- 73 soal Paket 3-6 dirender.
- 0 soal dengan opsi hilang.
- 0 image load failure.
- 0 clipping/overflow DOM terdeteksi pada area soal, opsi, dan media.

## Koreksi penting

- `D03Q05` sudah diselesaikan dari crop source: jawaban `(A) -6`.
- `D03Q19` dikoreksi menjadi `(a) Pernyataan (1) SAJA cukup...` setelah hitung ulang jumlah 225 suku.
- `D05Q04` dikoreksi menjadi `(d) 9`; hitungan persegi lengkap pada diagram source menghasilkan 9, bukan 12.
- `D05Q19` dikoreksi menjadi `(a) Pernyataan (1) SAJA cukup...` setelah hitung ulang `a20+a24`.
- `D05Q06`-`D05Q08` diberi status `source-issue`: opsi jawaban konsisten jika konstanta garis dibaca `+12`, sedangkan render PDF terlihat seperti `+2`. Kunci tetap diisi agar latihan berjalan, tetapi answer panel menandai nomor ini sebagai `Cek Sumber`.

## File audit sub-agent

- `study_web/audit_package_03.md`
- `study_web/audit_package_04.md`
- `study_web/audit_package_05.md`
- `study_web/audit_package_06.md`

Catatan: beberapa file sub-agent menyebut runtime masih `day1-only`; itu benar pada saat mereka mulai audit, tetapi sudah tidak berlaku setelah generator PK dijalankan ulang dan UI diarahkan ke paket PK.
