/* Shared Shopify-backed category template for the 12 Products-page HPLC families. */
(() => {
  "use strict";

  const page = document.querySelector("[data-category-template]");
  if (!page) return;

  const CATEGORY_CONFIG = Object.freeze({
    c18a: {
      title: "C18A Columns",
      shortTitle: "C18A",
      heroImage: "images/category-columns/c18a.jpg",
      heroImageAlt: "HPLCONE C18A HPLC column packages with visible C18A product labels",
      description: "General-purpose reversed-phase columns for routine analytical and method-development work.",
      collectionHandle: "c18a-columns",
      match: /(?:^|[^a-z0-9])(?:\d+(?:\.\d+)?)?c18a(?:[^a-z0-9]|$)/i,
      feature: ["General-purpose reversed-phase", "Versatile for a wide range of analytes"],
      formatFeature: ["Analytical and preparative formats", "8 analytical · 13 preparative configurations"],
      detailPages: {},
    },
    c18c: {
      title: "HPLCONE® C18C HPLC Columns",
      shortTitle: "C18C",
      heroImage: "images/category-columns/c18c.jpg",
      heroImageAlt: "HPLCONE C18C HPLC column packages with visible C18C product labels",
      description: "High-density bonded and fully endcapped C18 columns designed for robust reversed-phase separations across a wide pH range.",
      collectionHandle: "c18c-columns",
      match: /(?:^|[^a-z0-9])(?:\d+(?:\.\d+)?)?c18c(?:[^a-z0-9]|$)/i,
      feature: ["High-density bonded C18", "Fully endcapped for robust reversed-phase separations"],
      detailPages: {},
    },
    c18d: {
      title: "HPLCONE® C18D HPLC Columns",
      shortTitle: "C18D",
      heroImage: "images/category-columns/c18d.jpg",
      heroImageAlt: "HPLCONE C18D HPLC column packages with visible C18D product labels",
      description: "Aqueous-compatible C18 stationary phase designed for enhanced retention and selectivity of hydrophilic and polar compounds.",
      collectionHandle: "c18d-columns",
      match: /(?:^|[^a-z0-9])(?:\d+(?:\.\d+)?)?c18d(?:[^a-z0-9]|$)/i,
      feature: ["Aqueous-compatible C18", "Enhanced retention and selectivity for hydrophilic and polar compounds"],
      detailPages: {},
    },
    c4c: {
      title: "HPLCONE® C4C HPLC Columns",
      shortTitle: "C4C",
      heroImage: "images/category-columns/c4c.jpg",
      heroImageAlt: "HPLCONE C4C HPLC column packages in laboratory storage",
      description: "Butyl-bonded reversed-phase column with enhanced acid and base resistance compared with conventional C4 phases.",
      collectionHandle: "c4c-columns",
      match: /(?:^|[^a-z0-9])(?:\d+(?:\.\d+)?)?c4c(?:[^a-z0-9]|$)/i,
      feature: ["Butyl-bonded reversed phase", "Enhanced acid and base resistance compared with conventional C4 phases"],
      detailPages: {},
    },
    pfp: {
      title: "HPLCONE® PFP HPLC Columns",
      shortTitle: "PFP",
      heroImage: "images/category-columns/pfp.jpg",
      heroImageAlt: "HPLCONE PFP HPLC column packages with visible PFP product labels",
      description: "Pentafluorophenyl stationary phase providing hydrophobic, dipole and π-interaction selectivity for compounds requiring an alternative to conventional C18 or phenyl phases.",
      collectionHandle: "pfp-columns",
      match: /(?:^|[^a-z0-9])(?:\d+(?:\.\d+)?)?pfp(?:[^a-z0-9]|$)|pentafluorophenyl/i,
      feature: ["Pentafluorophenyl selectivity", "Hydrophobic, dipole and π-interaction selectivity"],
      detailPages: {},
    },
    pe: {
      title: "HPLCONE® PE HPLC Columns",
      shortTitle: "PE",
      heroImage: "images/category-columns/pe.jpg",
      heroImageAlt: "HPLCONE PE HPLC column packages with visible PE product labels",
      description: "Phenethyl-bonded stationary phase providing hydrophobic and π–π interaction selectivity for aromatic compounds and alternative reversed-phase separations.",
      collectionHandle: "pe-columns",
      match: /(?:^|[^a-z0-9])(?:\d+(?:\.\d+)?)?pe(?:[^a-z0-9]|$)|phenyl[ -]?embedded/i,
      feature: ["Phenethyl-bonded selectivity", "Hydrophobic and π–π interactions for aromatic compounds"],
      detailPages: {},
    },
    nh: {
      title: "HPLCONE® NH HPLC Columns",
      shortTitle: "NH",
      heroImage: "images/category-columns/nh.jpg",
      heroImageAlt: "HPLCONE NH HPLC column package with a visible NH product label",
      description: "Aminopropyl-bonded column for polar compound separations and applications using HILIC or normal-phase conditions.",
      collectionHandle: "nh-columns",
      match: /(?:^|[^a-z0-9])(?:\d+(?:\.\d+)?)?nh2?(?:[^a-z0-9]|$)|amino/i,
      feature: ["Aminopropyl-bonded selectivity", "For polar compounds under HILIC or normal-phase conditions"],
      detailPages: {},
    },
    amide: {
      title: "HPLCONE® Amide HPLC Columns",
      shortTitle: "Amide",
      heroImage: "images/category-columns/amide.jpg",
      heroImageAlt: "HPLCONE Amide HPLC column packages with visible Amide product labels",
      description: "Amide-bonded HILIC stationary phase designed for separation of highly polar compounds.",
      collectionHandle: "amide-columns",
      match: /(?:^|[^a-z0-9])(?:\d+(?:\.\d+)?)?amide(?:[^a-z0-9]|$)/i,
      feature: ["Amide-bonded HILIC selectivity", "Designed for separation of highly polar compounds"],
      detailPages: {},
    },
    cn: {
      title: "HPLCONE® CN HPLC Columns",
      shortTitle: "CN",
      heroImage: "images/category-columns/cn.jpg",
      heroImageAlt: "HPLCONE CN HPLC column package with a visible CN product label",
      description: "Cyanopropyl-bonded silica column providing versatile selectivity for polar, non-polar and aromatic compounds in normal- or reversed-phase applications.",
      collectionHandle: "cn-columns",
      match: /(?:^|[^a-z0-9])(?:\d+(?:\.\d+)?)?cn(?:[^a-z0-9]|$)|cyano/i,
      feature: ["Cyanopropyl selectivity", "Normal- or reversed-phase flexibility for varied analytes"],
      detailPages: {},
    },
    sil: {
      title: "HPLCONE® SIL HPLC Columns",
      shortTitle: "SIL",
      description: "High-purity unbonded silica column for normal-phase chromatography and adsorption-based separations.",
      collectionHandle: "sil-columns",
      match: /(?:^|[^a-z0-9])(?:\d+(?:\.\d+)?)?sil(?:ica)?(?:[^a-z0-9]|$)/i,
      feature: ["High-purity unbonded silica", "Normal-phase and adsorption-based separations"],
      detailPages: {},
    },
    "hilic-diol": {
      title: "HPLCONE® Diol HPLC Columns",
      shortTitle: "Diol",
      heroImage: "images/category-columns/hilic-a.jpg",
      heroImageAlt: "HPLCONE HILIC-A HPLC column package representing the HILIC and Diol category",
      description: "Diol-bonded stationary phase for polar compound separations, including peptides, proteins and polar pharmaceutical compounds.",
      collectionHandle: "hilic-diol-columns",
      match: /(?:^|[^a-z0-9])(?:\d+(?:\.\d+)?)?(?:hilic|diol)(?:[^a-z0-9]|$)/i,
      feature: ["Diol-bonded polar selectivity", "For peptides, proteins and polar pharmaceutical compounds"],
      detailPages: {},
    },
  });

  /*
   * Confirmed website-catalogue products that are not yet Shopify products go here.
   * Every array is intentionally empty until a real title/specification record is supplied.
   * Such records are always rendered as Request Quote and never receive a fabricated price.
   */
  const QUOTE_CATALOG = Object.freeze({
    c18a: [], c18c: [], c18d: [], c4c: [], pfp: [], pe: [],
    nh: [], amide: [], cn: [], sil: [], "hilic-diol": [],
  });

  const DEFAULT_FILTERS = Object.freeze([
    { key: "particleSize", label: "Particle Size" },
    { key: "columnSize", label: "Column Size" },
    { key: "poreSize", label: "Pore Size" },
    { key: "usp", label: "USP Classification" },
    { key: "availability", label: "Availability" },
  ]);

  const CONFIGURATION_FILTERS = Object.freeze([
    { key: "columnType", label: "Column Type" },
    { key: "particleSize", label: "Particle Size" },
    { key: "columnId", label: "Column I.D." },
    { key: "columnLength", label: "Column Length" },
  ]);

  const PRODUCT_QUERY = `
    query ChromValeCategoryProducts($collectionHandle: String!) {
      collection(handle: $collectionHandle) {
        id
        handle
        products(first: 100) { nodes { ...ChromValeCategoryProduct } }
      }
      products(first: 100, sortKey: TITLE) { nodes { ...ChromValeCategoryProduct } }
    }
    fragment ChromValeCategoryProduct on Product {
      id
      handle
      title
      description
      vendor
      productType
      tags
      onlineStoreUrl
      variants(first: 100) {
        nodes {
          id
          title
          sku
          availableForSale
          price { amount currencyCode }
          selectedOptions { name value }
        }
      }
      metafields(identifiers: [
        { namespace: "specs", key: "particle_size" }
        { namespace: "specs", key: "column_size" }
        { namespace: "specs", key: "pore_size" }
        { namespace: "specs", key: "surface_area" }
        { namespace: "specs", key: "carbon_load" }
        { namespace: "specs", key: "stationary_phase" }
        { namespace: "specs", key: "endcapped" }
        { namespace: "specs", key: "usp" }
        { namespace: "specs", key: "ph_range" }
        { namespace: "specs", key: "coa_available" }
        { namespace: "specs", key: "aqueous_compatibility" }
      ]) { namespace key type value }
    }`;

  const elements = {
    title: document.getElementById("categoryTitle"),
    description: document.getElementById("categoryDescription"),
    breadcrumb: document.getElementById("categoryBreadcrumbCurrent"),
    chemistryMark: document.getElementById("categoryChemistryMark"),
    heroVisual: document.getElementById("categoryHeroVisual"),
    heroImage: document.getElementById("categoryHeroImage"),
    scienceArt: document.getElementById("categoryScienceArt"),
    features: document.getElementById("categoryFeatures"),
    fixedSpecifications: document.getElementById("categoryFixedSpecifications"),
    filterGroups: document.getElementById("categoryFilterGroups"),
    clearFilters: document.getElementById("categoryClearFilters"),
    productCount: document.getElementById("categoryProductCount"),
    productList: document.getElementById("categoryProductList"),
    productsStatus: document.getElementById("categoryProductsStatus"),
    empty: document.getElementById("categoryProductsEmpty"),
    sort: document.getElementById("categorySort"),
    filterToggle: document.getElementById("categoryFilterToggle"),
    filterPanel: document.getElementById("categoryFilters"),
    filterScrim: document.getElementById("categoryFilterScrim"),
  };

  const requestedSlug = String(new URLSearchParams(window.location.search).get("category") || "c18a").trim().toLowerCase();
  if (requestedSlug === "specialty") {
    const legacyScriptUrl = new URL(document.currentScript?.src || "category-template.js", window.location.href);
    window.location.replace(new URL("specialty/index.html", legacyScriptUrl).href);
    return;
  }
  const slug = Object.hasOwn(CATEGORY_CONFIG, requestedSlug) ? requestedSlug : "c18a";
  const config = CATEGORY_CONFIG[slug];
  const familyCatalog = window.CHROMVALE_COLUMN_FAMILIES?.[slug] || null;
  const isConfigurationPage = Boolean(familyCatalog);
  const activeFilters = isConfigurationPage ? CONFIGURATION_FILTERS : DEFAULT_FILTERS;
  const scriptUrl = new URL(document.currentScript?.src || "category-template.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);
  let shopifyCartStore = null;
  let pendingVariantId = "";
  const state = {
    products: [],
    filters: Object.fromEntries(activeFilters.map(({ key }) => [key, new Set()])),
    collapsed: new Set(),
    sort: "relevant",
  };

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  const plainText = (value) => {
    const holder = document.createElement("div");
    holder.innerHTML = String(value || "");
    return holder.textContent.trim();
  };

  const parseValues = (raw) => {
    const text = String(raw ?? "").trim();
    if (!text) return [];
    if (text.startsWith("[") && text.endsWith("]")) {
      try {
        const values = JSON.parse(text);
        if (Array.isArray(values)) return values.map((value) => String(value).trim()).filter(Boolean);
      } catch { /* Keep a valid plain-text metafield visible. */ }
    }
    return [text];
  };

  const unique = (values) => [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
  const asValues = (value) => unique(Array.isArray(value) ? value : [value]);
  const validPhRange = (value) => /\d(?:\.\d+)?\s*(?:[–—-]|to)\s*\d(?:\.\d+)?/i.test(String(value || ""));
  const positiveValue = (value) => /^(?:yes|true|1|available|confirmed)$/i.test(String(value || "").trim());
  const validPrice = (variant) => Number.isFinite(Number(variant?.price?.amount)) && Number(variant.price.amount) > 0;
  const isQuoteOnly = (product) => (product.tags || []).some((tag) => /^(?:quote[- ]?only|request[- ]?quote)$/i.test(String(tag).trim()));

  const metafieldsByKey = (product) => {
    const result = {};
    for (const field of product.metafields || []) {
      if (!field?.key) continue;
      const values = parseValues(field.value);
      if (values.length) result[field.key] = values;
    }
    return result;
  };

  const valuesFromOptions = (variants, kind) => unique(variants.flatMap((variant) => (variant.selectedOptions || []).flatMap((option) => {
    const name = String(option.name || "");
    const value = String(option.value || "").trim();
    if (!value || /^default title$/i.test(value)) return [];
    if (kind === "particle" && (/particle/i.test(name) || /\d+(?:\.\d+)?\s*(?:µm|μm|um)\b/i.test(value))) return [value];
    if (kind === "column" && (/column|dimension|length/i.test(name) || (/\bmm\b/i.test(value) && /[×x]/i.test(value)))) return [value];
    if (kind === "pore" && (/pore/i.test(name) || /\d+(?:\.\d+)?\s*(?:Å|angstrom)/i.test(value))) return [value];
    return [];
  })));

  const firstSentence = (value) => {
    const text = plainText(value).replace(/\s+/g, " ").trim();
    if (!text) return "";
    const sentence = text.match(/^.*?(?:[.!?](?:\s|$)|$)/)?.[0]?.trim() || text;
    return sentence.length > 180 ? `${sentence.slice(0, 177).trim()}…` : sentence;
  };

  const productSignature = (product, specs) => [
    product.title, product.handle, product.productType, ...(product.tags || []), ...(specs.stationary_phase || []),
  ].filter(Boolean).join(" ");

  const normalizeShopifyProduct = (product, index) => {
    const variants = Array.isArray(product.variants?.nodes) ? product.variants.nodes : [];
    const specs = metafieldsByKey(product);
    const pricedVariants = variants.filter((variant) => variant.availableForSale && validPrice(variant));
    const purchasable = pricedVariants.length > 0 && !isQuoteOnly(product);
    const primaryVariant = pricedVariants[0] || variants.find((variant) => variant.sku) || variants[0] || null;
    const phValues = (specs.ph_range || []).filter(validPhRange);
    const aqueousConfirmed = (specs.aqueous_compatibility || []).length > 0 || /(?:aqueous compatible|highly aqueous|100% water)/i.test(product.description || "");
    const taggedFeatured = (product.tags || []).some((tag) => /^featured(?: product)?$/i.test(String(tag).trim()));
    const detailPath = config.detailPages[product.handle];
    const detailUrl = detailPath ? new URL(detailPath, scriptUrl).href : (product.onlineStoreUrl || "");

    return {
      id: product.id || `shopify-${index}`,
      source: "shopify",
      relevantIndex: index,
      handle: product.handle || "",
      title: product.title || "HPLC Column",
      productType: product.productType || "HPLC Column",
      vendor: product.vendor || "",
      description: firstSentence(product.description) || config.description,
      sku: primaryVariant?.sku || "",
      available: purchasable,
      price: purchasable ? Math.min(...pricedVariants.map((variant) => Number(variant.price.amount))) : null,
      currency: primaryVariant?.price?.currencyCode || "CAD",
      detailUrl,
      featured: taggedFeatured,
      aqueousConfirmed,
      coaConfirmed: (specs.coa_available || []).some(positiveValue),
      particleSize: unique([...(specs.particle_size || []), ...valuesFromOptions(variants, "particle")]),
      columnSize: unique([...(specs.column_size || []), ...valuesFromOptions(variants, "column")]),
      poreSize: unique([...(specs.pore_size || []), ...valuesFromOptions(variants, "pore")]),
      usp: unique(specs.usp || []),
      phRange: unique(phValues),
      signature: productSignature(product, specs),
    };
  };

  const normalizeQuoteProduct = (record, index) => ({
    id: record.id || `catalog-${slug}-${index}`,
    source: "catalog",
    relevantIndex: 1000 + index,
    handle: String(record.shopifyHandle || "").trim(),
    title: String(record.title || "").trim(),
    productType: String(record.productType || "HPLC Column").trim(),
    vendor: String(record.vendor || "").trim(),
    description: String(record.description || config.description).trim(),
    sku: String(record.sku || "").trim(),
    available: false,
    price: null,
    currency: "CAD",
    detailUrl: "",
    featured: Boolean(record.featured),
    aqueousConfirmed: Boolean(record.aqueousCompatible),
    coaConfirmed: false,
    particleSize: asValues(record.specs?.particleSize || []),
    columnSize: asValues(record.specs?.columnSize || []),
    poreSize: asValues(record.specs?.poreSize || []),
    usp: asValues(record.specs?.usp || []),
    phRange: asValues(record.specs?.phRange || []).filter(validPhRange),
    signature: String(record.title || ""),
  });

  const formatMoney = (amount, currency = "CAD") => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return "";
    const formatted = new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(numericAmount);
    return currency === "CAD" ? formatted.replace(/^\$/, "C$") : formatted;
  };

  const normalizeFamilyConfigurations = (shopifyProducts) => {
    const fixed = familyCatalog.fixedSpecifications;
    const variantsBySku = new Map();

    for (const product of shopifyProducts) {
      const productQuoteOnly = isQuoteOnly(product);
      for (const variant of product.variants?.nodes || []) {
        const sku = String(variant.sku || "").trim().toUpperCase();
        if (!sku) continue;
        const candidate = { product, variant, purchasable: variant.availableForSale && validPrice(variant) && !productQuoteOnly };
        const current = variantsBySku.get(sku);
        if (!current || (!current.purchasable && candidate.purchasable)) variantsBySku.set(sku, candidate);
      }
    }

    return familyCatalog.configurations.map((record, index) => {
      const shopifyMatch = variantsBySku.get(record.partNo.toUpperCase()) || null;
      const purchasable = Boolean(shopifyMatch?.purchasable) && !record.needsConfirmation;
      const variant = shopifyMatch?.variant || null;
      return {
        id: `${slug}-${record.partNo}${record.needsConfirmation ? `-${index}` : ""}`,
        source: "family-catalog",
        relevantIndex: index,
        title: familyCatalog.productName,
        productType: `${record.columnType} Column`,
        description: `${record.particleSize} · ${record.columnId} I.D. × ${record.columnLength}`,
        sku: record.partNo,
        available: purchasable,
        price: purchasable ? Number(variant.price.amount) : null,
        currency: variant?.price?.currencyCode || "CAD",
        variantId: purchasable ? variant.id : "",
        needsConfirmation: Boolean(record.needsConfirmation),
        columnType: [record.columnType],
        particleSize: [record.particleSize],
        columnId: [record.columnId],
        columnLength: [record.columnLength],
        columnSize: [`${record.columnId} I.D. × ${record.columnLength}`],
        poreSize: [fixed.poreSize],
        usp: [fixed.usp],
        phRange: [fixed.phRange],
        featured: false,
        aqueousConfirmed: false,
      };
    });
  };

  const featureIcons = [
    '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M17 5h6M18 5v8l-5 5v14h14V18l-5-5V5M13 24h14M10 32h20"/></svg>',
    '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M11 4h13l7 7v25H11zM24 4v8h8M16 19h10M16 25h10M16 31h7"/></svg>',
    '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="m8 27 19-19 6 6-19 19zM22 13l5 5M18 17l3 3M14 21l3 3M10 25l3 3"/></svg>',
  ];

  const renderPageIdentity = () => {
    elements.title.textContent = config.title;
    elements.description.textContent = config.description;
    elements.breadcrumb.textContent = config.title;
    elements.chemistryMark.textContent = config.shortTitle;
    if (config.heroImage && elements.heroImage && elements.heroVisual) {
      const restoreScienceArt = () => {
        elements.heroImage.hidden = true;
        elements.heroVisual.classList.remove("has-photo");
        elements.scienceArt?.removeAttribute("hidden");
      };
      elements.heroImage.addEventListener("error", restoreScienceArt, { once: true });
      elements.heroImage.src = new URL(config.heroImage, siteRoot).href;
      elements.heroImage.alt = config.heroImageAlt || `${config.title} product packaging`;
      elements.heroImage.hidden = false;
      elements.heroVisual.classList.add("has-photo");
      elements.scienceArt?.setAttribute("hidden", "");
    }
    document.title = `${config.title} | ChromVale Scientific`;
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.content = config.description;
    const canonicalUrl = new URL(`products/category.html?category=${encodeURIComponent(slug)}`, siteRoot).href;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = canonicalUrl;
    const openGraphTitle = document.querySelector('meta[property="og:title"]');
    const openGraphDescription = document.querySelector('meta[property="og:description"]');
    const openGraphUrl = document.querySelector('meta[property="og:url"]');
    if (openGraphTitle) openGraphTitle.content = `${config.title} | ChromVale Scientific`;
    if (openGraphDescription) openGraphDescription.content = config.description;
    if (openGraphUrl) openGraphUrl.content = canonicalUrl;
    let structuredData = document.getElementById("categoryStructuredData");
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = "categoryStructuredData";
      structuredData.type = "application/ld+json";
      document.head.append(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: new URL("index.html", siteRoot).href },
            { "@type": "ListItem", position: 2, name: "HPLC Columns", item: new URL("products.html", siteRoot).href },
            { "@type": "ListItem", position: 3, name: config.title, item: canonicalUrl },
          ],
        },
        {
          "@type": "ProductGroup",
          name: familyCatalog?.productName || config.title,
          description: config.description,
          url: canonicalUrl,
          brand: { "@type": "Brand", name: "HPLCONE" },
          category: "HPLC Columns",
          hasVariant: (familyCatalog?.configurations || []).map((configuration) => ({
            "@type": "Product",
            name: `${familyCatalog.productName} ${configuration.particleSize} ${configuration.columnId} I.D. × ${configuration.columnLength}`,
            sku: configuration.partNo,
          })),
        },
      ],
    });

    const catalogFormatFeature = familyCatalog
      ? [
        "Analytical and preparative formats",
        `${familyCatalog.configurations.filter(({ columnType }) => columnType === "Analytical").length} analytical · ${familyCatalog.configurations.filter(({ columnType }) => columnType === "Preparative").length} preparative configurations`,
      ]
      : null;
    const features = [
      config.feature,
      ["Documented QC where available", "Manufacturer QC documentation"],
      catalogFormatFeature || config.formatFeature || ["Common analytical sizes", "4.6 × 150 mm / 4.6 × 250 mm"],
    ];
    elements.features.innerHTML = features.map(([title, description], index) => `<article class="category-collection-feature">${featureIcons[index]}<div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></div></article>`).join("");

    if (familyCatalog) {
      const specifications = familyCatalog.specificationRows.flatMap(([label, key]) => {
        const value = familyCatalog.fixedSpecifications[key];
        return value ? [[label, value]] : [];
      });
      const count = familyCatalog.configurations.length;
      elements.fixedSpecifications.innerHTML = `<div class="category-fixed-heading"><div><p class="eyebrow">Shared Technical Profile</p><h2 id="categoryFixedSpecificationsTitle">${escapeHtml(config.shortTitle)} Fixed Specifications</h2></div><p>These specifications apply to all ${count} catalogue configurations below.</p></div><dl>${specifications.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
      elements.fixedSpecifications.hidden = false;
    }
  };

  const matchesCategory = (product) => config.match.test(product.signature);
  const valuesForFilter = (product, key) => key === "availability"
    ? [product.available ? "Available to Order" : "Request Quote"]
    : product[key] || [];

  const productMatchesSelections = (product, ignoredKey = "") => activeFilters.every(({ key }) => {
    if (key === ignoredKey || !state.filters[key].size) return true;
    const values = valuesForFilter(product, key);
    return [...state.filters[key]].some((selected) => values.includes(selected));
  });

  const sortProducts = (products) => [...products].sort((left, right) => {
    if (state.sort === "name") return left.title.localeCompare(right.title, "en", { sensitivity: "base" });
    if (state.sort === "price-asc" || state.sort === "price-desc") {
      const leftMissing = left.price === null;
      const rightMissing = right.price === null;
      if (leftMissing !== rightMissing) return leftMissing ? 1 : -1;
      if (!leftMissing && left.price !== right.price) return state.sort === "price-asc" ? left.price - right.price : right.price - left.price;
      return left.title.localeCompare(right.title, "en", { sensitivity: "base" });
    }
    if (left.featured !== right.featured) return left.featured ? -1 : 1;
    return left.relevantIndex - right.relevantIndex;
  });

  const availableFilterValues = (key) => unique(state.products.flatMap((product) => valuesForFilter(product, key))).sort((left, right) => {
    if (key === "availability") return left === "Available to Order" ? -1 : 1;
    return left.localeCompare(right, "en", { numeric: true, sensitivity: "base" });
  });

  const renderFilters = () => {
    const groups = activeFilters.flatMap(({ key, label }) => {
      const values = availableFilterValues(key);
      if (!values.length) return [];
      const collapsed = state.collapsed.has(key);
      const options = values.map((value, index) => {
        const count = state.products.filter((product) => productMatchesSelections(product, key) && valuesForFilter(product, key).includes(value)).length;
        const id = `category-filter-${key}-${index}`;
        const checked = state.filters[key].has(value);
        return `<label class="category-filter-option" for="${id}"><input id="${id}" type="checkbox" data-filter-key="${escapeHtml(key)}" value="${escapeHtml(value)}"${checked ? " checked" : ""}/><span>${escapeHtml(value)}</span><span class="category-filter-count">(${count})</span></label>`;
      }).join("");
      return `<section class="category-filter-group"><button class="category-filter-group-toggle" type="button" data-filter-group="${escapeHtml(key)}" aria-expanded="${String(!collapsed)}" aria-controls="category-filter-options-${escapeHtml(key)}">${escapeHtml(label)}</button><div class="category-filter-options" id="category-filter-options-${escapeHtml(key)}"${collapsed ? " hidden" : ""}>${options}</div></section>`;
    });
    elements.filterGroups.innerHTML = groups.join("");
    elements.clearFilters.disabled = !activeFilters.some(({ key }) => state.filters[key].size);
  };

  const specBlock = (label, values) => values.length ? `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(values.join(" · "))}</dd></div>` : "";

  const quoteHref = (product) => {
    const url = new URL("quote.html", siteRoot);
    if (product.source === "family-catalog") {
      const type = product.columnType[0];
      const particleSize = product.particleSize[0];
      const columnSize = product.columnSize[0];
      url.searchParams.set("product", `${product.title} — ${type} Column — ${particleSize} — ${columnSize} — Part No. ${product.sku}`);
      url.searchParams.set("type", type);
      url.searchParams.set("particleSize", particleSize);
      url.searchParams.set("columnSize", columnSize);
      url.searchParams.set("partNo", product.sku);
      return url.href;
    }
    url.searchParams.set("product", [product.title, product.sku].filter(Boolean).join(" — "));
    return url.href;
  };

  const familyConfigurationRow = (product) => {
    const specs = familyCatalog.configurationSpecificationRows
      .map(([label, key]) => specBlock(label, product[key] || []))
      .join("");
    const action = product.available && product.variantId
      ? `<p class="category-configuration-price">${escapeHtml(formatMoney(product.price, product.currency))}</p><button class="category-row-button category-row-button-solid" type="button" data-family-add-to-cart="${escapeHtml(product.variantId)}">Add to Cart</button>`
      : `<p class="category-configuration-pricing">Contact for pricing</p><a class="category-row-button category-row-button-outline" href="${escapeHtml(quoteHref(product))}">Request a Quotation →</a>`;
    return `<article class="category-product-row category-configuration-row" data-product-id="${escapeHtml(product.id)}">
      <div class="category-product-copy">
        <div class="category-product-heading-line"><h2>${escapeHtml(product.title)}</h2></div>
        <p class="category-product-summary"><span>${escapeHtml(product.productType)}</span></p>
        <dl class="category-product-specs">${specs}</dl>
      </div>
      <div class="category-product-actions category-configuration-actions">
        <p class="category-configuration-sku">Part No. <strong>${escapeHtml(product.sku)}</strong></p>
        ${action}
      </div>
    </article>`;
  };

  const productRow = (product) => {
    const badges = [
      ...(product.featured ? ['<span class="category-product-badge">★ Featured Product</span>'] : []),
      ...(product.aqueousConfirmed ? ['<span class="category-product-badge is-aqueous">● Aqueous Compatible</span>'] : []),
    ];
    const specs = [
      specBlock("Particle Size", product.particleSize),
      specBlock("Column Size", product.columnSize),
      specBlock("Pore Size", product.poreSize),
      specBlock("USP", product.usp),
      specBlock("pH Range", product.phRange),
    ].filter(Boolean).join("");
    const summaryBits = [product.productType || "HPLC Column", product.description].filter(Boolean).map((value) => `<span>${escapeHtml(value)}</span>`).join("");
    const canViewSpecifications = product.available && product.detailUrl;
    const actionHref = canViewSpecifications ? product.detailUrl : quoteHref(product);
    const actionLabel = canViewSpecifications ? "View Specifications →" : "Request Quote →";
    const actionClass = canViewSpecifications ? "category-row-button-solid" : "category-row-button-outline";
    return `<article class="category-product-row" data-product-id="${escapeHtml(product.id)}">
      <div class="category-product-copy">
        <div class="category-product-heading-line">${badges.join("")}<h2>${escapeHtml(product.title)}</h2></div>
        <p class="category-product-summary">${summaryBits}</p>
        ${specs ? `<dl class="category-product-specs">${specs}</dl>` : ""}
      </div>
      <div class="category-product-actions">
        <p class="category-product-state${product.available ? "" : " is-quote"}">${product.available ? "Available" : "Request Quote"}</p>
        <p class="category-product-sku">${product.sku ? `Part No. ${escapeHtml(product.sku)}` : ""}</p>
        <a class="category-row-button ${actionClass}" href="${escapeHtml(actionHref)}">${actionLabel}</a>
      </div>
    </article>`;
  };

  const renderProducts = () => {
    renderFilters();
    const visibleProducts = sortProducts(state.products.filter((product) => productMatchesSelections(product)));
    elements.productCount.textContent = `${visibleProducts.length} ${isConfigurationPage ? (visibleProducts.length === 1 ? "configuration" : "configurations") : (visibleProducts.length === 1 ? "product" : "products")}`;
    if (isConfigurationPage) {
      elements.productList.innerHTML = ["Analytical", "Preparative"].flatMap((columnType) => {
        const configurations = visibleProducts.filter((product) => product.columnType.includes(columnType));
        if (!configurations.length) return [];
        return `<section class="category-configuration-group" aria-labelledby="category-${columnType.toLowerCase()}-title"><div class="category-configuration-group-heading"><h2 id="category-${columnType.toLowerCase()}-title">${columnType} Columns</h2><span>${configurations.length} ${configurations.length === 1 ? "configuration" : "configurations"}</span></div><div class="category-configuration-rows">${configurations.map(familyConfigurationRow).join("")}</div></section>`;
      }).join("");
    } else {
      elements.productList.innerHTML = visibleProducts.map(productRow).join("");
    }
    elements.productList.setAttribute("aria-busy", "false");
    elements.productList.hidden = !visibleProducts.length;
    elements.empty.hidden = Boolean(visibleProducts.length);
  };

  const setActionFeedback = (message, isError = false) => {
    elements.productsStatus.textContent = message;
    elements.productsStatus.classList.remove("is-ready");
    elements.productsStatus.classList.toggle("is-error", isError);
  };

  const setFilterDrawer = (open) => {
    const shouldOpen = Boolean(open) && window.matchMedia("(max-width: 700px)").matches;
    document.body.classList.toggle("is-filter-open", shouldOpen);
    elements.filterToggle.setAttribute("aria-expanded", String(shouldOpen));
    elements.filterScrim.hidden = !shouldOpen;
    if (shouldOpen) elements.filterPanel.querySelector("button")?.focus();
  };

  elements.productList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-family-add-to-cart]");
    if (!button || pendingVariantId || !shopifyCartStore) return;
    const variantId = button.dataset.familyAddToCart;
    const configuration = state.products.find((product) => product.variantId === variantId);
    if (!configuration?.available) return;

    pendingVariantId = variantId;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.textContent = "Adding…";
    setActionFeedback(`Adding Part No. ${configuration.sku} to your Shopify Cart…`);
    try {
      await shopifyCartStore.addLines([{ merchandiseId: variantId, quantity: 1 }]);
      setActionFeedback(`Part No. ${configuration.sku} was added to your Shopify Cart.`);
    } catch (error) {
      setActionFeedback(error instanceof Error ? error.message : "Unable to update the Shopify Cart. Please try again.", true);
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
      button.textContent = "Add to Cart";
      pendingVariantId = "";
    }
  });

  elements.filterGroups.addEventListener("change", (event) => {
    const input = event.target.closest("[data-filter-key]");
    if (!input) return;
    const filter = state.filters[input.dataset.filterKey];
    if (!filter) return;
    if (input.checked) filter.add(input.value); else filter.delete(input.value);
    renderProducts();
  });

  elements.filterGroups.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-filter-group]");
    if (!toggle) return;
    const key = toggle.dataset.filterGroup;
    if (state.collapsed.has(key)) state.collapsed.delete(key); else state.collapsed.add(key);
    renderFilters();
  });

  elements.clearFilters.addEventListener("click", () => {
    activeFilters.forEach(({ key }) => state.filters[key].clear());
    renderProducts();
  });

  elements.sort.addEventListener("change", () => {
    state.sort = elements.sort.value;
    renderProducts();
  });

  elements.filterToggle.addEventListener("click", () => setFilterDrawer(!document.body.classList.contains("is-filter-open")));
  elements.filterScrim.addEventListener("click", () => setFilterDrawer(false));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") setFilterDrawer(false); });
  window.addEventListener("resize", () => { if (!window.matchMedia("(max-width: 700px)").matches) setFilterDrawer(false); });

  const initialize = async () => {
    renderPageIdentity();
    if (requestedSlug !== slug) {
      elements.productsStatus.textContent = `Unknown category “${requestedSlug}”. Showing ${config.title}.`;
      elements.productsStatus.classList.add("is-error");
    }
    try {
      const { client, cartStore } = await window.ChromValeShopifyReady;
      shopifyCartStore = cartStore;
      const data = await client.request(PRODUCT_QUERY, { collectionHandle: config.collectionHandle });
      const collectionProducts = Array.isArray(data.collection?.products?.nodes) ? data.collection.products.nodes : null;
      const fallbackProducts = Array.isArray(data.products?.nodes) ? data.products.nodes : [];
      const sourceProducts = collectionProducts === null ? fallbackProducts : collectionProducts;
      if (isConfigurationPage) {
        const rawById = new Map([...sourceProducts, ...fallbackProducts].map((product) => [product.id || product.handle, product]));
        const familyShopifyProducts = [...rawById.values()].filter((product) => config.match.test(productSignature(product, metafieldsByKey(product))));
        state.products = normalizeFamilyConfigurations(familyShopifyProducts);
      } else {
        const normalizedShopify = sourceProducts.map(normalizeShopifyProduct).filter((product) => collectionProducts !== null || matchesCategory(product));
        const shopifyHandles = new Set(normalizedShopify.map((product) => product.handle).filter(Boolean));
        const quoteProducts = (QUOTE_CATALOG[slug] || []).map(normalizeQuoteProduct).filter((product) => product.title && !shopifyHandles.has(product.handle));
        state.products = [...normalizedShopify, ...quoteProducts];
      }
      renderProducts();
      if (requestedSlug === slug) {
        elements.productsStatus.textContent = isConfigurationPage
          ? `${familyCatalog.configurations.length} confirmed catalogue configurations loaded; purchasable SKUs matched to Shopify by Part No.`
          : (data.collection
            ? `Products loaded from Shopify collection “${config.collectionHandle}”.`
            : `Shopify collection “${config.collectionHandle}” is not published; matching published Shopify products are shown.`);
        elements.productsStatus.classList.add("is-ready");
      }
    } catch (error) {
      state.products = isConfigurationPage
        ? normalizeFamilyConfigurations([])
        : (QUOTE_CATALOG[slug] || []).map(normalizeQuoteProduct).filter((product) => product.title);
      renderProducts();
      elements.productsStatus.textContent = isConfigurationPage
        ? `The ${familyCatalog.configurations.length} confirmed catalogue configurations are shown. Live Shopify purchasing is temporarily unavailable.`
        : (error instanceof Error ? error.message : "Unable to load current Shopify products.");
      elements.productsStatus.classList.remove("is-ready");
      elements.productsStatus.classList.add("is-error");
      if (!state.products.length) {
        elements.empty.querySelector("h2").textContent = "Current product data could not be loaded.";
        elements.empty.querySelector("p").textContent = "Please try again or contact ChromVale for product specifications.";
      }
    }
  };

  window.ChromValeCategoryConfig = CATEGORY_CONFIG;
  window.ChromValeQuoteCatalog = QUOTE_CATALOG;
  initialize();
})();
