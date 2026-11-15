# Keripik Tempe Tiga Saudara 354 — website statis

Website statis (HTML + CSS + JavaScript vanilla) untuk menjual keripik tempe
Tiga Saudara 354 dari Bogor. Semua pesan dan pemesanan diarahkan ke WhatsApp.

Tanpa React, Next.js, Tailwind, framework CSS, library JS, dan tanpa build tool.

## Struktur folder

```
static-site/
  index.html            seluruh halaman (satu halaman)
  css/style.css         semua gaya; warna & ukuran ada di bagian :root
  js/main.js            4 fitur kecil: menu mobile, reveal, form reseller, tahun footer
  assets/
    logo.png / logo.webp        logo brand
    favicon-32/180/192/512.png
    produk/                     foto produk + varian responsif (webp & jpg)
  robots.txt
  sitemap.xml
  site.webmanifest
```

## Menjalankan

Website ini statis, jadi cukup pakai server statis apa saja:

```bash
# dari folder static-site
python3 -m http.server 8080
# atau
npx serve .
```

Untuk produksi: upload seluruh isi folder `static-site/` ke hosting statis
(Netlify, Vercel, GitHub Pages, cPanel/hosting biasa). Tidak perlu Node,
tidak perlu build, tidak perlu install.

## WAJIB diganti sebelum live

1. **Nomor WhatsApp.** Cari `wa.me/628` di `index.html` (semua tombol CTA) dan
   di `js/main.js` (dipakai form reseller). Format internasional tanpa `+`
   dan tanpa spasi, contoh `6281234567890`. Nomor ini juga ada di atribut
   `data-wa` pada elemen `<body>`.
2. **Domain.** `https://keripiktempe354.id` dipakai di canonical, Open Graph,
   JSON-LD, `robots.txt`, dan `sitemap.xml`.

## Isi halaman (urutan)

1. **Hero** — logo + angka 354 besar, nama brand, foto kemasan, tag harga
   "Mulai dari Rp 16.000", CTA WhatsApp
2. **Badge trust** — Halal, P-IRT, BPOM MD, Bogor (baris gelap di bawah hero)
3. **Kenapa enak** — 4 alasan singkat
4. **Produk** — 160 g, 200 g, 100 g. Tiap kartu: nama, berat, harga, tombol WA
5. **Cerita singkat + cara membuat** — 4 langkah produksi
6. **Oleh-oleh Bogor** — section SEO lokal, natürlich: ringan dibawa, tahan disimpan
7. **Foto produk** — 3 foto asli dari rak dan workshop
8. **Testimoni** — disiapkan untuk testimoni asli (lihat catatan di bawah)
9. **Reseller** — yang Anda dapat, MOQ, margin, pengiriman, cara memulai, form
10. **FAQ** — pakai `<details>`, tanpa JavaScript
11. **CTA sebelum footer + footer** (kontak: WhatsApp, alamat, jam, sosmed)

CTA WhatsApp ada di: header, hero, tiap kartu produk, setelah produk, form
reseller, section testimoni, sebelum footer, tombol mengambang (desktop), dan
bar bawah (seluler).

## Menambah testimoni asli

Bagian testimoni sengaja masih kosong supaya tidak ada review palsu. Kalau
sudah ada review asli, ganti `<div class="testimoni-kosong">` di `index.html`
dengan:

```html
<ul class="grid-testimoni">
  <li class="kartu-testimoni">
    <p>"Kutipan review asli pembeli."</p>
    <span>Nama Pembeli · Kota</span>
  </li>
</ul>
```

Class `.grid-testimoni` dan `.kartu-testimoni` sudah ada di `css/style.css`.

## Cara mengubah isi

| Yang diubah | Di mana |
|---|---|
| Warna, radius, font | `css/style.css` bagian `:root` |
| Teks halaman | `index.html` |
| Nomor WhatsApp | `index.html` (cari `wa.me/628`) + `js/main.js` |
| Foto produk | taruh di `assets/produk/`, lalu sesuaikan `src`/`srcset` |
| Varian gambar | `tools/prep-assets.mjs` (butuh `sharp`, dijalankan manual) |

Catatan harga: 100 gram Rp 16.000 dan 200 gram Rp 28.800 diambil dari label rak.
Kemasan 160 gram belum punya angka resmi, jadi kartu itu menulis "Harga ecer &
promo". Kalau harga 160 gram sudah diketahui, cukup ganti baris `.produk-harga`
di kartu tersebut (dan `price` di JSON-LD bila mau).

Fakta produk yang dipakai di halaman (dari kemasan & label rak):
P-IRT 211320101004820, BPOM MD 211320101004820, halal, 100 gram Rp 16.000,
200 gram Rp 28.800, bahan kedelai + tapioka + minyak sjaraf + bumbu,
produksi di Bogor, sudah ada di rak AEON.

## Catatan teknis

- Semua gambar pakai `<picture>` (webp + fallback jpg), `srcset` 480/900/1200/1400,
  `loading="lazy"` kecuali foto hero yang pakai `fetchpriority="high"`.
- Halaman tetap utuh tanpa JavaScript: menu, FAQ, dan semua CTA WhatsApp
  tetap jalan. JavaScript hanya menambah reveal saat scroll dan isi form reseller.
- Reveal pakai IntersectionObserver + pengaman 2 detik, jadi konten tidak
  pernah tersembunyi kalau browser tidak memberi laporan.
- Warna kontras, target sentuh minimal 44px, `aria-label` pada tombol,
  dan `skip link` ke isi utama.
- Nada tulisan: lugas, seperti pemilik usaha ngobrol. Jangan pakai kata seperti
  "premium", "autentik", "solusi terbaik", "menggugah selera", "berkualitas tinggi".
