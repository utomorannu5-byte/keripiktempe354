#!/usr/bin/env node
/*
  Generator website statis Tiga Saudara 354.

  Sumber data : site.config.json
  Template    : src/index.html
  Output      : index.html, robots.txt, sitemap.xml, site.webmanifest

  Jalankan:
    node tools/build.mjs
    node tools/build.mjs --check
    node tools/build.mjs --config ../site.config.json

  Tidak memakai dependency eksternal. Node 18+.
*/

import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const configIndex = args.indexOf("--config");
const configPath =
  configIndex !== -1
    ? path.resolve(ROOT, args[configIndex + 1])
    : path.join(ROOT, "site.config.json");
const templatePath = path.join(ROOT, "src/index.html");

const config = JSON.parse(await readFile(configPath, "utf8"));
const template = await readFile(templatePath, "utf8");

/* --------------------------------------------------------------------------
   Validasi data
   -------------------------------------------------------------------------- */

function assertValid(condition, message) {
  if (!condition) throw new Error(message);
}

function assertText(value, label) {
  assertValid(
    typeof value === "string" && value.trim().length > 0,
    `${label} wajib diisi.`
  );
}

function normalizeWhatsapp(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  assertValid(digits.length >= 10, "Nomor WhatsApp terlalu pendek.");

  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  if (digits.startsWith("62")) return digits;

  throw new Error(
    "Nomor WhatsApp harus diawali 0, 8, atau 62. Contoh: 089519142713."
  );
}

function assertUrl(value, label) {
  if (!value) return;
  try {
    new URL(value);
  } catch {
    throw new Error(`${label} bukan URL yang valid: ${value}`);
  }
}

assertText(config.site?.title, "site.title");
assertText(config.site?.description, "site.description");
assertText(config.site?.keywords, "site.keywords");
assertText(config.site?.author, "site.author");
assertText(config.site?.locale, "site.locale");
assertText(config.site?.ogDescription, "site.ogDescription");
assertText(config.site?.themeColor, "site.themeColor");
assertText(config.site?.backgroundColor, "site.backgroundColor");
assertText(config.brand?.name, "brand.name");
assertText(config.brand?.fullName, "brand.fullName");
assertText(config.brand?.productName, "brand.productName");
assertText(config.brand?.tagline, "brand.tagline");
assertText(config.brand?.description, "brand.description");
assertText(config.contact?.whatsapp?.international, "contact.whatsapp.international");
assertText(config.contact?.whatsapp?.display, "contact.whatsapp.display");
assertText(config.contact?.address?.full, "contact.address.full");
assertText(config.contact?.address?.street, "contact.address.street");
assertText(config.contact?.address?.rt, "contact.address.rt");
assertText(config.contact?.address?.rw, "contact.address.rw");
assertText(config.contact?.address?.district, "contact.address.district");
assertText(config.contact?.address?.city, "contact.address.city");
assertText(config.contact?.address?.province, "contact.address.province");
assertText(config.contact?.address?.postalCode, "contact.address.postalCode");
assertText(config.contact?.address?.country, "contact.address.country");
assertText(config.contact?.hours, "contact.hours");
assertText(config.contact?.hoursShort, "contact.hoursShort");
if (config.contact?.hoursSchema != null) {
  assertText(config.contact.hoursSchema, "contact.hoursSchema");
}
assertText(config.legal?.pirt, "legal.pirt");
assertText(config.legal?.bpom, "legal.bpom");

for (const [key, label] of [
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["tiktok", "TikTok"]
]) {
  const social = config.social?.[key];
  if (!social?.url) continue;

  assertText(social.label, `social.${key}.label`);
  assertText(social.handle, `social.${key}.handle`);
}
assertUrl(config.site?.url, "site.url");
assertUrl(config.social?.instagram?.url, "social.instagram.url");
assertUrl(config.social?.facebook?.url, "social.facebook.url");
assertUrl(config.social?.tiktok?.url, "social.tiktok.url");
assertValid(Array.isArray(config.products) && config.products.length > 0, "products minimal satu.");
assertValid(Array.isArray(config.faq) && config.faq.length > 0, "faq minimal satu.");
assertText(config.whatsapp?.templates?.general, "whatsapp.templates.general");
assertText(config.whatsapp?.templates?.product, "whatsapp.templates.product");
assertText(
  config.whatsapp?.templates?.resellerForm,
  "whatsapp.templates.resellerForm"
);

for (const key of [
  "header",
  "hero",
  "variantHelp",
  "reseller",
  "review",
  "gift",
  "visit",
  "closing",
  "footer",
  "floating",
  "bar"
]) {
  if (config.whatsapp?.templates?.[key] != null) {
    assertText(config.whatsapp.templates[key], `whatsapp.templates.${key}`);
  }
}

const productIds = new Set();

for (const [index, product] of config.products.entries()) {
  const label = `products[${index}]`;
  assertText(product.id, `${label}.id`);
  assertValid(!productIds.has(product.id), `${label}.id duplikat: ${product.id}`);
  productIds.add(product.id);

  assertText(product.name, `${label}.name`);
  assertText(product.meta, `${label}.meta`);
  assertText(product.description, `${label}.description`);

  const weight = Number(product.weight);
  assertValid(
    Number.isFinite(weight) && weight > 0,
    `${label}.weight harus angka positif.`
  );

  assertText(product.image?.base, `${label}.image.base`);

  const imageWidth = Number(product.image?.width);
  const imageHeight = Number(product.image?.height);
  assertValid(
    Number.isFinite(imageWidth) && imageWidth > 0,
    `${label}.image.width harus angka positif.`
  );
  assertValid(
    Number.isFinite(imageHeight) && imageHeight > 0,
    `${label}.image.height harus angka positif.`
  );

  if (product.image?.widths != null) {
    assertValid(
      Array.isArray(product.image.widths) && product.image.widths.length > 0,
      `${label}.image.widths minimal satu.`
    );

    for (const itemWidth of product.image.widths) {
      assertValid(
        Number.isFinite(Number(itemWidth)) && Number(itemWidth) > 0,
        `${label}.image.widths harus angka positif.`
      );
    }
  }

  assertText(product.image?.alt, `${label}.image.alt`);
  assertText(product.image?.sizes, `${label}.image.sizes`);

  const hasPrice =
    product.price !== null && product.price !== undefined && product.price !== "";

  if (hasPrice) {
    assertValid(
      (typeof product.price === "number" && Number.isFinite(product.price)) ||
        /^\d+(?:\.\d+)?$/.test(String(product.price).trim()),
      `${label}.price harus angka.`
    );
    assertText(product.priceLabel, `${label}.priceLabel`);
  } else {
    assertValid(
      !product.priceLabel,
      `${label}.priceLabel diisi tetapi ${label}.price kosong.`
    );
  }
}

for (const [index, item] of config.faq.entries()) {
  assertText(item.q, `faq[${index}].q`);
  assertText(item.a, `faq[${index}].a`);
}

/* --------------------------------------------------------------------------
   Data turunan
   -------------------------------------------------------------------------- */

const whatsappNumber = normalizeWhatsapp(config.contact.whatsapp.international);
const siteUrl = String(config.site?.url ?? "").replace(/\/+$/, "");
const address = config.contact.address;
const templates = config.whatsapp.templates;

const logoPath = "assets/logo.png";
const ogImagePath = "assets/produk/rak-kemasan-1200.jpg";
const canonical = siteUrl ? `${siteUrl}/` : null;
const ogImage = siteUrl ? `${siteUrl}/${ogImagePath}` : null;
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  address.full
)}`;
const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  address.full
)}&z=16&hl=id&output=embed`;

function makeWhatsappUrl(templateText, values = {}) {
  const text = Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replaceAll(`{${key}}`, value === null || value === undefined ? "" : String(value)),
    templateText
  );

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function assertAssetExists(relativePath, label) {
  const clean = String(relativePath).split(/[?#]/)[0];
  assertValid(clean.length > 0, `${label} kosong.`);

  try {
    await access(path.join(ROOT, clean));
  } catch {
    throw new Error(`${label} tidak ditemukan: ${clean}`);
  }
}

function collectLocalAssets(html) {
  const paths = new Set();

  const addPath = (value) => {
    const raw = String(value).trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("//")) return;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return;

    const clean = raw.split(/[?#]/)[0];
    if (clean) paths.add(clean);
  };

  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    addPath(match[1]);
  }

  for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(",")) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url) addPath(url);
    }
  }

  return paths;
}

function enrichImage(image) {
  const base = String(image.base).replace(/\/+$/, "");
  const widths = Array.from(
    new Set([...(image.widths ?? []), image.width].filter(Boolean))
  ).sort((a, b) => a - b);

  return {
    ...image,
    widths,
    src: `${base}-${image.width}.jpg`,
    srcsetWebp: widths.map((width) => `${base}-${width}.webp ${width}w`).join(", "),
    srcsetJpg: widths.map((width) => `${base}-${width}.jpg ${width}w`).join(", ")
  };
}

const products = config.products.map((product) => ({
  ...product,
  image: enrichImage(product.image),
  waUrl: makeWhatsappUrl(templates.product, {
    product: product.name,
    weight: product.weight
  })
}));

const socialLinks = Object.values(config.social ?? {}).filter((item) => item?.url);

const wa = {
  general: makeWhatsappUrl(templates.general),
  header: makeWhatsappUrl(templates.header ?? templates.general),
  hero: makeWhatsappUrl(templates.hero ?? templates.general),
  variantHelp: makeWhatsappUrl(templates.variantHelp ?? templates.general),
  reseller: makeWhatsappUrl(templates.reseller ?? templates.general),
  review: makeWhatsappUrl(templates.review ?? templates.general),
  gift: makeWhatsappUrl(templates.gift ?? templates.general),
  visit: makeWhatsappUrl(templates.visit ?? templates.general),
  closing: makeWhatsappUrl(templates.closing ?? templates.general),
  footer: makeWhatsappUrl(templates.footer ?? templates.general),
  floating: makeWhatsappUrl(templates.floating ?? templates.general),
  bar: makeWhatsappUrl(templates.bar ?? templates.general)
};

const sameAs = socialLinks.map((item) => item.url);

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: config.brand.fullName,
  description: config.brand.description,
  slogan: config.brand.tagline,
  telephone: `+${whatsappNumber}`,
  hasMap: mapsUrl,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${address.street}, RT ${address.rt}/RW ${address.rw}, ${address.district}`,
    addressLocality: address.city,
    addressRegion: address.province,
    postalCode: address.postalCode,
    addressCountry: address.country
  },
  openingHours: config.contact.hoursSchema ?? "Mo-Sa 08:00-17:00",
  areaServed: [
    { "@type": "City", name: "Bogor" },
    { "@type": "AdministrativeArea", name: "Jawa Barat" },
    { "@type": "Country", name: "Indonesia" }
  ],
  sameAs
};

if (siteUrl) {
  localBusiness.url = canonical;
  localBusiness.logo = `${siteUrl}/${logoPath}`;
  localBusiness.image = `${siteUrl}/${ogImagePath}`;
}

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `Varian ${config.brand.fullName}`,
  itemListElement: products.map((product, index) => {
    const item = {
      "@type": "Product",
      name: product.name,
      description: product.description,
      category: "Makanan Ringan",
      brand: {
        "@type": "Brand",
        name: config.brand.name
      }
    };

    if (siteUrl) {
      item.image = `${siteUrl}/${product.image.src}`;
      item.url = `${siteUrl}/#produk`;
    }

    if (product.price !== null && product.price !== undefined && product.price !== "") {
      item.offers = {
        "@type": "Offer",
        price: String(product.price),
        priceCurrency: "IDR",
        availability: "https://schema.org/InStock"
      };
      if (siteUrl) item.offers.url = `${siteUrl}/#produk`;
    }

    return {
      "@type": "ListItem",
      position: index + 1,
      item
    };
  })
};

const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: config.faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a
    }
  }))
};

function jsonForScript(value) {
  return JSON.stringify(value, null, 2)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

const data = {
  ...config,
  site: {
    ...config.site,
    url: siteUrl
  },
  contact: {
    ...config.contact,
    whatsapp: {
      ...config.contact.whatsapp,
      international: whatsappNumber,
      tel: `+${whatsappNumber}`
    },
    mapsUrl,
    mapsEmbedUrl
  },
  products,
  faq: config.faq,
  socialLinks,
  wa,
  canonical,
  ogImage,
  twitterCard: ogImage ? "summary_large_image" : "summary",
  jsonLd: {
    localBusiness: jsonForScript(localBusiness),
    itemList: jsonForScript(itemList),
    faq: jsonForScript(faqPage)
  },
  year: new Date().getFullYear()
};

/* --------------------------------------------------------------------------
   Template engine kecil
   -------------------------------------------------------------------------- */

function parseTemplate(source) {
  const root = { type: "root", children: [] };
  const stack = [{ node: root, target: root.children }];
  const tokenPattern = /\{\{\{([\s\S]+?)\}\}\}|\{\{([#\/]?)([\s\S]+?)\}\}/g;
  let lastIndex = 0;
  let match;

  while ((match = tokenPattern.exec(source))) {
    if (match.index > lastIndex) {
      stack[stack.length - 1].target.push({
        type: "text",
        value: source.slice(lastIndex, match.index)
      });
    }

    if (match[1] !== undefined) {
      stack[stack.length - 1].target.push({
        type: "variable",
        path: match[1].trim(),
        raw: true
      });
    } else {
      const sigil = match[2];
      const expression = match[3].trim();

      if (sigil === "#") {
        const [kind, ...rest] = expression.split(/\s+/);
        if (!["if", "unless", "each"].includes(kind)) {
          throw new Error(`Blok template tidak dikenal: {{#${expression}}}`);
        }

        const node = {
          type: kind,
          path: rest.join(" "),
          children: [],
          elseChildren: null
        };
        stack[stack.length - 1].target.push(node);
        stack.push({ node, target: node.children });
      } else if (sigil === "/") {
        const current = stack.pop();
        if (!current || current.node.type !== expression) {
          throw new Error(`Penutup template tidak cocok: {{/${expression}}}`);
        }
      } else if (expression === "else") {
        const current = stack[stack.length - 1];
        if (!current || !["if", "unless"].includes(current.node.type)) {
          throw new Error("{{else}} hanya boleh di dalam {{#if}} atau {{#unless}}.");
        }
        current.node.elseChildren = [];
        current.target = current.node.elseChildren;
      } else {
        stack[stack.length - 1].target.push({
          type: "variable",
          path: expression,
          raw: false
        });
      }
    }

    lastIndex = tokenPattern.lastIndex;
  }

  if (lastIndex < source.length) {
    stack[stack.length - 1].target.push({
      type: "text",
      value: source.slice(lastIndex)
    });
  }

  if (stack.length !== 1) {
    throw new Error(`Blok template belum ditutup: {{#${stack[stack.length - 1].node.type}}}`);
  }

  return root.children;
}

function resolveValue(pathExpression, context, root) {
  if (pathExpression === "." || pathExpression === "this") return context;

  let expression = pathExpression.trim();
  if (expression.startsWith("@root.")) {
    return resolveValue(expression.slice(6), root, root);
  }
  if (expression.startsWith("this.")) {
    expression = expression.slice(5);
  }

  return expression.split(".").reduce((value, key) => {
    if (value === null || value === undefined) return undefined;
    return value[key];
  }, context);
}

function renderNodes(nodes, context, root) {
  let output = "";

  for (const node of nodes) {
    if (node.type === "text") {
      output += node.value;
      continue;
    }

    if (node.type === "variable") {
      const value = resolveValue(node.path, context, root);
      if (value === undefined) {
        throw new Error(`Data template tidak ditemukan: ${node.path}`);
      }
      if (value === null) continue;
      output += node.raw ? String(value) : escapeHtml(value);
      continue;
    }

    if (node.type === "if" || node.type === "unless") {
      const value = Boolean(resolveValue(node.path, context, root));
      const useMainBranch = node.type === "if" ? value : !value;
      if (useMainBranch) {
        output += renderNodes(node.children, context, root);
      } else if (node.elseChildren) {
        output += renderNodes(node.elseChildren, context, root);
      }
      continue;
    }

    if (node.type === "each") {
      const value = resolveValue(node.path, context, root);
      if (Array.isArray(value)) {
        for (const item of value) {
          output += renderNodes(node.children, item, root);
        }
      } else if (value && typeof value === "object") {
        for (const item of Object.values(value)) {
          output += renderNodes(node.children, item, root);
        }
      }
    }
  }

  return output;
}

const parsedTemplate = parseTemplate(template);
const html = renderNodes(parsedTemplate, data, data).replace(/[ \t]+$/gm, "");

if (html.includes("{{")) {
  const index = html.indexOf("{{");
  throw new Error(`Masih ada token template yang belum diganti: ${html.slice(index, index + 80)}`);
}

/* --------------------------------------------------------------------------
   File generated
   -------------------------------------------------------------------------- */

const robots = siteUrl
  ? [
      "User-agent: *",
      "Allow: /",
      "",
      `Sitemap: ${siteUrl}/sitemap.xml`,
      ""
    ].join("\n")
  : [
      "User-agent: *",
      "Allow: /",
      "",
      "# Sitemap akan aktif setelah site.url diisi di site.config.json.",
      ""
    ].join("\n");

const sitemap = siteUrl
  ? [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      "  <url>",
      `    <loc>${siteUrl}/</loc>`,
      "    <changefreq>monthly</changefreq>",
      "    <priority>1.0</priority>",
      "  </url>",
      "</urlset>",
      ""
    ].join("\n")
  : [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<!-- Sitemap aktif setelah site.url diisi di site.config.json. -->",
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      ""
    ].join("\n");

const manifest = {
  name: config.brand.fullName,
  short_name: config.brand.name,
  description: config.site.ogDescription ?? config.brand.tagline,
  lang: "id-ID",
  start_url: "./",
  display: "standalone",
  background_color: config.site.backgroundColor,
  theme_color: config.site.themeColor,
  icons: [
    { src: "assets/favicon-192.png", sizes: "192x192", type: "image/png" },
    { src: "assets/favicon-512.png", sizes: "512x512", type: "image/png" }
  ]
};

const generatedFiles = new Set([
  "index.html",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest"
]);

const assetsToCheck = collectLocalAssets(html);
if (ogImage) assetsToCheck.add(ogImagePath);
if (siteUrl) assetsToCheck.add(logoPath);
for (const icon of manifest.icons) assetsToCheck.add(icon.src);

for (const asset of assetsToCheck) {
  if (generatedFiles.has(asset)) continue;
  await assertAssetExists(asset, `Aset ${asset}`);
}

const outputs = [
  ["index.html", html],
  ["robots.txt", robots],
  ["sitemap.xml", sitemap],
  ["site.webmanifest", `${JSON.stringify(manifest, null, 2)}\n`]
];

if (!siteUrl) {
  console.warn(
    "⚠ site.url masih kosong. canonical, og:url, og:image, JSON-LD URL, dan sitemap belum aktif."
  );
  console.warn(
    "  Setelah project Firebase siap, isi site.url di site.config.json lalu jalankan build ulang."
  );
}

if (config.products.every((product) => product.price === null || product.price === undefined)) {
  console.log("ℹ Harga produk kosong: tidak ada price/offers yang ditulis.");
}

if (checkOnly) {
  let upToDate = true;

  for (const [file, content] of outputs) {
    const current = await readFile(path.join(ROOT, file), "utf8").catch(() => null);
    if (current !== content) {
      console.error(`✖ ${file} belum sinkron dengan site.config.json / src/index.html.`);
      upToDate = false;
    }
  }

  if (!upToDate) {
    console.error("Jalankan: node tools/build.mjs");
    process.exit(1);
  }

  console.log("✓ Semua file generated sudah sinkron.");
  process.exit(0);
}

for (const [file, content] of outputs) {
  await writeFile(path.join(ROOT, file), content, "utf8");
  console.log(`✓ ${file}`);
}

console.log("✓ Build selesai.");
