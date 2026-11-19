/* ==========================================================================
   Tiga Saudara 354 — JavaScript minimal (tanpa library)

   Isi:
   1. Menu mobile
   2. Efek muncul saat scroll
   3. Running text (marquee)
   4. Form reseller -> WhatsApp
   5. Tombol sosial mengambang
   6. Tahun di footer

   Semua data bisnis (nomor WhatsApp, template pesan) berasal dari HTML
   hasil generate site.config.json. Tidak ada nomor atau pesan hardcode.
   Tanpa JavaScript, isi halaman, FAQ, dan CTA WhatsApp tetap jalan; yang
   membutuhkan JavaScript hanya menu mobile dan form reseller.
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
    " .oleh-oleh-grid > *, .lokasi-grid > *, .testimoni-kosong, .reseller-grid > *," +
    " .reseller-manfaat > li, .faq-item," +
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

    // Tanpa animasi, satu salinan sudah cukup dan tetap bisa digeser.
    if (kurangiGerak) return;

    var salinan = grup.cloneNode(true);
    salinan.setAttribute("aria-hidden", "true");
    track.appendChild(salinan);

    var wadah = track.closest(".marquee");
    if (wadah) wadah.classList.add("siap");

    track.classList.add("siap");
  });

  /* ---------- 4. FORM RESELLER -> WHATSAPP ---------- */
  var formReseller = document.getElementById("form-reseller");
  var templateReseller = document.getElementById("wa-reseller-template");

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

      var nomor = document.body.getAttribute("data-wa");
      var template = templateReseller ? templateReseller.textContent.trim() : "";

      if (!nomor || !template) {
        alert("Maaf, nomor WhatsApp belum siap. Coba lagi sebentar.");
        return;
      }

      var nilai = {
        nama: nama,
        kota: kota,
        target: target,
        pesan: pesan
      };

      var baris = template
        .split("\n")
        .filter(function (baris) {
          if (baris.indexOf("{target}") !== -1 && !target) return false;
          if (baris.indexOf("{pesan}") !== -1 && !pesan) return false;
          return true;
        })
        .map(function (baris) {
          return baris.replace(/\{(nama|kota|target|pesan)\}/g, function (_, key) {
            return nilai[key] || "";
          });
        });

      var tautan = "https://wa.me/" + nomor + "?text=" + encodeURIComponent(baris.join("\n"));
      window.open(tautan, "_blank", "noopener");
    });
  }

  /* ---------- 5. TOMBOL SOSIAL MENGAMBANG ---------- */
  var sosmed = document.querySelector("[data-sosmed]");

  if (sosmed) {
    var tombolSosmed = sosmed.querySelector(".sosmed-toggle");
    var panelSosmed = sosmed.querySelector(".sosmed-panel");

    var tutupSosmed = function () {
      sosmed.classList.remove("is-terbuka");
      tombolSosmed.setAttribute("aria-expanded", "false");
    };

    tombolSosmed.addEventListener("click", function (event) {
      event.stopPropagation();
      var terbuka = sosmed.classList.toggle("is-terbuka");
      tombolSosmed.setAttribute("aria-expanded", terbuka ? "true" : "false");
    });

    // Tutup setelah salah satu tautan dipilih
    panelSosmed.addEventListener("click", function (event) {
      if (event.target.closest("a")) tutupSosmed();
    });

    // Tutup saat klik di luar atau tekan Escape
    document.addEventListener("click", function (event) {
      if (!sosmed.contains(event.target)) tutupSosmed();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") tutupSosmed();
    });
  }

  /* ---------- 6. TAHUN DI FOOTER ---------- */
  var tahun = document.getElementById("tahun");
  if (tahun) tahun.textContent = String(new Date().getFullYear());
})();
