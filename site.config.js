/* ==========================================================================
   Kitelish - SITE CONFIG  (the ONE file most buyers need to edit)
   --------------------------------------------------------------------------
   - Everything here is plain JavaScript: no build step needed.
   - Text that must be bilingual is written as { en: "...", vi: "..." }.
   - Leave a contact channel as "" (empty) to hide its button everywhere.
   - ALL values below are PLACEHOLDERS. Replace them before you go live.
   ========================================================================== */
window.SITE_CONFIG = {

  /* ---------- Brand ---------- */
  brand: {
  "name": "Kitelish",
  "logoText": "Kitelish",
  "logoMark": "assets/img/logo-mark.svg",
  "tagline": {
    "en": "STEM + English for ages 6 to 11",
    "vi": "STEM + tiếng Anh cho bé 6–11 tuổi"
  },
  "schemaType": "EducationalOrganization"
},

  /* ---------- Site URL (used for sitemap/OG/schema; no trailing slash) ---------- */
  siteUrl: "https://www.example.com",

  /* ---------- Pages and navigation (managed by the page generator; edit pages.json in the source, or edit here if you edit the HTML by hand) ---------- */
  pages: {
  "home": "index.html",
  "catalog": "programmes.html",
  "schedule": "timetable.html",
  "pricing": "packages.html",
  "booking": "trial.html",
  "contact": "contact.html",
  "notfound": "404.html"
},
  nav: [
  {
    "id": "catalog",
    "href": "programmes.html",
    "key": "nav.catalog"
  },
  {
    "id": "schedule",
    "href": "timetable.html",
    "key": "nav.schedule"
  },
  {
    "id": "pricing",
    "href": "packages.html",
    "key": "nav.pricing"
  },
  {
    "id": "contact",
    "href": "contact.html",
    "key": "nav.contact"
  }
],
  headerCta: {
  "page": "booking",
  "key": "cta.book"
},

  /* ---------- Layout style (header: bar | pill | tabs, footer: dark | light | grid) ---------- */
  style: {
  "pack": "blueprint",
  "header": "tabs",
  "footer": "grid"
},

  /* ---------- Language ---------- */
  language: {
  "default": "en",
  "available": [
    "en",
    "vi"
  ],
  "labels": {
    "en": "EN",
    "vi": "VI"
  },
  "names": {
    "en": "English",
    "vi": "Tiếng Việt"
  },
  "storageKey": "kitelish.lang"
},

  /* ---------- Currency (per language). Prices in assets/data/pricing.js hold several currencies. ---------- */
  currency: {
  "en": "USD",
  "vi": "VND"
},

  /* ---------- Theme (rebrand here or in src/input.css :root). Hex colours. ---------- */
  theme: {
  "colors": {
    "brand": "#0B5C6B",
    "brandDark": "#073F4A",
    "brandSoft": "#DFF1F3",
    "accent": "#FF8A3D",
    "coral": "#C23B3B",
    "mint": "#3FB8A0",
    "sky": "#7CC7E8",
    "violet": "#8E7CC3",
    "ink": "#0E2A33",
    "muted": "#43606A",
    "cream": "#F3F8F7",
    "surface": "#FFFFFF",
    "lvl1": "#3FB8A0",
    "lvl2": "#FF8A3D",
    "lvl3": "#4F8EF7",
    "lvl4": "#F2C14E",
    "lvl5": "#8E7CC3"
  },
  "radius": {
    "card": "0.5rem",
    "button": "0.375rem"
  },
  "fonts": {
    "display": "\"Lexend\", \"Plus Jakarta Sans\", system-ui, sans-serif",
    "body": "\"Plus Jakarta Sans\", system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif"
  }
},

  /* ---------- Contact (leave "" to hide) ---------- */
  contact: {
  "hotline": "+84900000000",
  "hotlineDisplay": "0900 000 000",
  "zalo": "0900000000",
  "messenger": "yourpage",
  "whatsapp": "",
  "email": "hello@example.com",
  "mapEmbedUrl": "",
  "mapLink": "https://maps.google.com/?q=Ho+Chi+Minh+City",
  "address": {
    "en": "123 Sample Street, District 1, Ho Chi Minh City, Vietnam",
    "vi": "123 Đường Mẫu, Quận 1, TP. Hồ Chí Minh"
  },
  "social": {
    "facebook": "",
    "youtube": "",
    "instagram": "",
    "tiktok": ""
  }
},

  /* ---------- Opening hours (24h "HH:MM"; null = closed; [] hides the column) ---------- */
  hours: [
  {
    "day": "mon",
    "open": "15:30",
    "close": "19:30"
  },
  {
    "day": "tue",
    "open": "15:30",
    "close": "19:30"
  },
  {
    "day": "wed",
    "open": "15:30",
    "close": "19:30"
  },
  {
    "day": "thu",
    "open": "15:30",
    "close": "19:30"
  },
  {
    "day": "fri",
    "open": "15:30",
    "close": "19:30"
  },
  {
    "day": "sat",
    "open": "08:30",
    "close": "12:30"
  },
  {
    "day": "sun",
    "open": null,
    "close": null
  }
],

  /* ---------- Floating click-to-chat buttons ---------- */
  chatButtons: {
  "zalo": true,
  "messenger": true,
  "whatsapp": false,
  "call": true,
  "position": "right"
},

  /* ---------- Bank transfer / VietQR block ---------- */
  payment: {
  "show": true,
  "isPlaceholder": true,
  "bankName": "Sample Bank (SMB)",
  "accountName": "SAMPLE ACCOUNT NAME",
  "accountNumber": "0000 0000 0000",
  "transferNote": "KITELISH - Child name - Package",
  "qrImage": "assets/img/vietqr-placeholder.svg"
},

  /* ---------- Booking / contact form ----------
     provider: "none"      -> validates but does NOT send anywhere (demo mode)
               "formspree" -> set endpoint to https://formspree.io/f/xxxxxxx
               "netlify"   -> deploy on Netlify (form name below); no endpoint needed
               "custom"    -> POST JSON to your own endpoint (Make, Zapier, Google Apps Script, API...) */
  form: {
  "provider": "none",
  "endpoint": "",
  "netlifyFormName": "booking",
  "redirectAfterSuccess": "",
  "calendlyUrl": "",
  "fallbackEmail": "hello@example.com"
},

  /* ---------- Misc ---------- */
  showDemoNote: true   // footer note "Template preview with sample content". Set false when live.
};
