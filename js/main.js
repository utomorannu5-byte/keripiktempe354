/* ==========================================================================
   Keripik Tempe Tiga Saudara 354 — JavaScript minimal (tanpa library)
   Isi:
   1. Menu mobile
   2. Efek muncul saat scroll
   3. Running text (marquee)
   4. Form reseller -> WhatsApp
   5. Tahun di footer
   Semua opsional: halaman tetap berfungsi penuh tanpa JavaScript.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- 1. MENU MOBILE ---------- */
  var tombolMenu = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");

  if (tombolMenu && nav) {
    var tutupMenu = function () {
      nav.classList.remove("is-terbuka");
      tombolMenu.setAttribute("aria-expanded", "false");
    };

    tombolMenu.addEventListener("click", function () {
      var terbuka = nav.classList.toggle("is-terbuka");
      tombolMenu.setAttribute("aria-expanded", terbuka ? "true" : "false");
    });

    // Tutup menu setelah link di dalam diklik
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) tutupMenu();
    });

    // Tutup menu saat tekan Escape
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") tutupMenu();
    });

    // Tutup menu kalau layar jadi lebar (menu versi desktop)
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1000) tutupMenu();
    });
  }

  /* ---------- 2. EFEK MUNCUL SAAT SCROLL ---------- */
  var kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var elemenReveal = document.querySelectorAll(
    ".grid-4 > li, .produk, .cerita-grid > *, .trust-list > li, .foto-strip > li," +
    " .oleh-oleh-grid > *, .testimoni-kosong, .reseller-grid > *," +
    " .reseller-manfaat > li, .nama-354-kartu, .faq-item," +
    " .cta-blok, .closing-inner"
  );

  if (!kurangiGerak && "IntersectionObserver" in window) {
    var pemantau = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("tampil");
            pemantau.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    elemenReveal.forEach(function (elemen) {
      elemen.classList.add("reveal");
      pemantau.observe(elemen);
    });

    // Pengaman: kalau browser tidak pernah memberi laporan,
    // semua konten tetap ditampilkan (tidak ada konten yang tersembunyi).
    setTimeout(function () {
      elemenReveal.forEach(function (elemen) {
        elemen.classList.add("tampil");
      });
    }, 2000);
  }

  /* ---------- 3. RUNNING TEXT (MARQUEE) ---------- */
  /*
    Isi baris disalin dua kali, lalu seluruh track digeser -50%.
    Karena panjang kedua salinan sama persis, saat salinan pertama keluar
    layar, salinan kedua sudah tepat di posisi yang pas.
    Hasilnya: loop mulus, tidak ada loncatan dan tidak ada jeda kosong.
  */
  var trackMarquee = document.querySelectorAll("[data-marquee]");

  Array.prototype.forEach.call(trackMarquee, function (track) {
    var grup = track.querySelector(".marquee-grup");
    if (!grup) return;

    var salinan = grup.cloneNode(true);
    salinan.setAttribute("aria-hidden", "true");
    track.appendChild(salinan);
    track.classList.add("siap");
  });

  /* ---------- 4. FORM RESELLER -> WHATSAPP ---------- */
  var formReseller = document.getElementById("form-reseller");

  if (formReseller) {
    formReseller.addEventListener("submit", function (event) {
      event.preventDefault();

      var ambil = function (id) {
        var el = document.getElementById(id);
        return el && el.value.trim() ? el.value.trim() : "";
      };

      var nama = ambil("rs-nama");
      var kota = ambil("rs-kota");
      var target = ambil("rs-target");
      var pesan = ambil("rs-pesan");

      if (!nama || !kota) {
        alert("Isi nama dan kota dulu ya, biar pricelist-nya bisa kami kirim.");
        return;
      }

      var baris = [
        "Halo, saya tertarik jadi reseller Keripik Tempe Tiga Saudara 354.",
        "Nama: " + nama,
        "Kota: " + kota
      ];
      if (target) baris.push("Target order per bulan: " + target);
      if (pesan) baris.push("Catatan: " + pesan);
      baris.push("", "Mohon info harga reseller, minimum order, dan daftar region yang dilayani ya. Terima kasih!");

      var nomor = document.body.getAttribute("data-wa") || "6281234567890";
      var tautan = "https://wa.me/" + nomor + "?text=" + encodeURIComponent(baris.join("\n"));
      window.open(tautan, "_blank", "noopener");
    });
  }

  /* ---------- 5. TAHUN DI FOOTER ---------- */
  var tahun = document.getElementById("tahun");
  if (tahun) tahun.textContent = String(new Date().getFullYear());
})();
