# Keripik Tempe Tiga Saudara 354 — website statis

Website satu halaman untuk **Keripik Tempe Tiga Saudara 354**, produsen keripik
tempe khas Bogor. Semua pemesanan diarahkan ke WhatsApp.

HTML + CSS + JavaScript vanilla. Tidak ada framework, tidak ada dependency,
dan tidak ada proses build yang rumit. Satu file konfigurasi menjadi sumber
data bisnis, lalu generator kecil menulis file HTML/SEO yang siap di-upload.

## Arsitektur

```
site.config.json     sumber data bisnis (satu-satunya tempat ubah data)
src/index.html       template halaman
tools/build.mjs      generator tanpa dependency (Node 18+)

index.html           HASIL GENERATE — jangan diedit manual
robots.txt           HASIL GENERATE
sitemap.xml          HASIL GENERATE
site.webmanifest     HASIL GENERATE
```

File lain tetap diedit manual:

```
css/style.css        gaya halaman
js/main.js           menu mobile, reveal, marquee, form reseller
assets/              logo, favicon, foto produk
```

Alur kerjanya:

```
site.config.json + src/index.html
              │
              ▼
      node tools/build.mjs
              │
              ▼
index.html · robots.txt · sitemap.xml · site.webmanifest
```

Kalau data bisnis berubah (nomor WhatsApp, alamat, sosial media, varian,
FAQ, harga), cukup edit `site.config.json`, lalu jalankan build ulang.
Jangan mengedit `index.html` karena perubahan itu akan tertimpa.

## Menjalankan

Butuh Node.js 18 atau lebih baru.

```bash
# dari folder static-site
node tools/build.mjs
```

Perintah lain:

```bash
# cek apakah file generated masih sinkron dengan config/template
node tools/build.mjs --check

# memakai file config lain (misalnya config produksi terpisah)
node tools/build.mjs --config ../site.config.json
```

Build akan gagal kalau ada data wajib yang kosong, URL tidak valid, atau token
template yang tidak dikenal. Ini sengaja, supaya salah konfigurasi tidak lolos
ke produksi.

## Preview lokal

```bash
# dari folder static-site
python3 -m http.server 8080
# buka http://localhost:8080
```

Atau pakai server statis apa pun. Tidak perlu install apa pun.

Buka lewat `http://localhost:8080`, bukan dengan klik dua kali `index.html`.
Google Maps embed tidak tampil kalau halaman dibuka langsung sebagai `file://`.

## Deploy

Target deploy: **Firebase Hosting**. Seluruh isi folder `static-site/` adalah
file statis, jadi tidak perlu server Node.

```bash
node tools/build.mjs
firebase deploy
```

Saat inisialisasi Firebase Hosting, arahkan `public` ke folder ini
(`static-site`) atau salin file hasil generate ke folder public Firebase.

### URL produksi

Domain Firebase Hosting sudah aktif dan diisi di `site.config.json`:

```json
"site": {
  "url": "https://keripiktigasaudara354.web.app"
}
```

Karena `site.url` terisi, build menulis `canonical`, `og:url`, `og:image`,
`twitter:image`, URL absolut di JSON-LD, isi `sitemap.xml`, dan baris `Sitemap:`
di `robots.txt`.

Kalau nanti pindah domain (misalnya domain sendiri), cukup ubah satu nilai itu
lalu jalankan `node tools/build.mjs` lagi. Kalau `site.url` dikosongkan, build
akan menulis peringatan dan mematikan semua URL absolut, sitemap, serta baris
sitemap di `robots.txt`.

## Cara mengubah data

| Yang diubah                                | Di mana                                                  |
| ------------------------------------------ | -------------------------------------------------------- |
| Nama brand, tagline, deskripsi             | `site.config.json` → `brand`                             |
| Nomor WhatsApp, alamat, jam buka, peta     | `site.config.json` → `contact`                           |
| Instagram, Facebook, TikTok (link + ikon)  | `site.config.json` → `social`                            |
| Varian produk, berat, foto, badge          | `site.config.json` → `products`                          |
| Harga produk                               | `site.config.json` → `products[].price` dan `priceLabel` |
| FAQ (tampilan + schema)                    | `site.config.json` → `faq`                               |
| Pesan otomatis WhatsApp                    | `site.config.json` → `whatsapp.templates`                |
| Judul, deskripsi SEO, keywords, warna tema | `site.config.json` → `site`                              |
| Legalitas (P-IRT, BPOM, halal)             | `site.config.json` → `legal`                             |
| Teks dan struktur halaman                  | `src/index.html`                                         |
| Warna, radius, font, layout                | `css/style.css` bagian `:root`                           |
| Perilaku menu, reveal, form reseller       | `js/main.js`                                             |

Nomor WhatsApp ditulis dalam format lokal (`089519142713`) atau internasional
(`6289519142713`). Generator menormalkannya ke `62...` untuk semua tautan
`wa.me`, dan membuat versi `tel:+62...` untuk tautan telepon.

## Kebijakan harga

Harga produk **sengaja kosong** untuk saat ini:

```json
"price": null,
"priceLabel": null
```

Selama bernilai `null`:

- kartu produk tidak menampilkan baris harga sama sekali;
- JSON-LD produk tidak menulis `offers`/`price`;
- tidak ada angka harga di meta description maupun pesan WhatsApp.

Kalau nanti harga sudah ditetapkan, cukup isi dua field itu:

```json
"price": 16000,
"priceLabel": "Rp 16.000"
```

Build berikutnya akan menampilkan harga dan menulis schema `Offer` secara
otomatis. Tidak perlu mengedit HTML.

## Isi halaman

1. Hero — logo, nama brand, foto kemasan, CTA WhatsApp
2. Badge trust — Halal, P-IRT, BPOM MD, Bogor
3. Kenapa enak — alasan singkat
4. Produk — 160 g, 200 g, 100 g (harga mengikuti config)
5. Cerita + cara membuat
6. Lokasi & jam buka — alamat, jam, tombol Google Maps/WhatsApp, peta embed
7. Oleh-oleh Bogor
8. Foto produk
9. Testimoni — kosong sampai ada ulasan asli
10. Reseller + form yang mengirim pesan ke WhatsApp
11. FAQ — memakai `<details>`, tetap jalan tanpa JavaScript
12. CTA penutup + footer (WhatsApp, telepon, alamat + Google Maps, jam, sosial media dengan ikon)
13. Tombol sosial mengambang di atas tombol WhatsApp — membuka dropdown Instagram, Facebook, TikTok

Semua tombol WhatsApp memakai nomor dan template dari `site.config.json`.
Tidak ada nomor atau pesan yang di-hardcode di HTML/JS.

## Testimoni

Bagian testimoni sengaja kosong supaya tidak ada review palsu. Kalau sudah ada
ulasan asli, ganti `<div class="testimoni-kosong">` di `src/index.html` dengan:

```html
<ul class="grid-testimoni">
  <li class="kartu-testimoni">
    <p>"Kutipan review asli pembeli."</p>
    <span>Nama Pembeli · Kota</span>
  </li>
</ul>
```

Class `.grid-testimoni` dan `.kartu-testimoni` sudah tersedia di
`css/style.css`. Jangan lupa jalankan build ulang.

## Catatan teknis

- HTML, CSS, dan JS tanpa dependency. Generator hanya memakai modul bawaan Node.
- Semua gambar memakai `<picture>` (WebP + fallback JPG), `srcset` responsif,
  `loading="lazy"` kecuali foto hero yang memakai `fetchpriority="high"`.
- Peta memakai Google Maps embed tanpa API key, dibuat dari alamat di
  `site.config.json`, dengan `loading="lazy"` dan tautan fallback ke Google Maps.
- Ikon Instagram, Facebook, dan TikTok berupa inline SVG, jadi tidak ada
  permintaan tambahan ke library ikon eksternal. Ikon yang sama dipakai di
  footer dan dropdown tombol sosial mengambang.
- Tombol sosial mengambang ada di kanan bawah, tepat di atas tombol WhatsApp.
  Di mobile tombolnya berbentuk ikon bulat di atas bar WhatsApp. Dropdown
  membuka ke atas, bisa ditutup dengan klik di luar, Escape, atau setelah
  memilih tautan.
- Tanpa JavaScript, isi halaman, FAQ, dan semua CTA WhatsApp tetap jalan.
  Menu mobile, form reseller, dan dropdown tombol sosial membutuhkan
  JavaScript; tautan sosial tetap tersedia di footer.
- Reveal memakai IntersectionObserver dengan pengaman 2 detik, jadi konten tidak
  pernah tersembunyi kalau browser tidak memberi laporan.
- `--check` cocok dipakai di CI atau sebelum deploy untuk memastikan file
  generated tidak ketinggalan.
- Aksesibilitas: skip link, `aria-label`, target sentuh minimal 44px, kontras
  warna, dan `prefers-reduced-motion`.

## QA sebelum deploy

```bash
node tools/build.mjs --check
grep -n '6281234567890\|0812-3456-7890\|Rp ' index.html
grep -n 'nama-354\|{{' index.html
```

Hasil yang diharapkan:

- `--check` menulis "Semua file generated sudah sinkron".
- Tidak ada nomor lama, harga, atau token `{{...}}` yang tersisa.
- Semua tautan `wa.me` memakai `6289519142713`.
- `index.html` bisa dibuka langsung dan tetap berfungsi tanpa JavaScript.
