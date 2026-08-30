// Shared Services navigation; the same data drives every sidebar and active row.
export const services = [
  { page: 'warranty.html', name: 'Warranty & Post-Purchase Support', legacyAnchor: 'warranty-support' },
  { page: 'sourcing.html', name: 'Procurement & Sourcing', legacyAnchor: 'product-sourcing-support' },
  { page: 'product-support.html', name: 'Product & Technical Support', legacyAnchor: 'technical-support' },
  { page: 'documentation-support.html', name: 'Documentation & Compliance Support', legacyAnchor: 'documentation-support' },
  { page: 'shipping.html', name: 'Shipping & Delivery Support', legacyAnchor: 'shipping-support' },
  { page: 'suppliers.html', name: 'Suppliers' },
];

const escapeHtml = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

export function serviceSidebar(currentPage) {
  const rows = services.map(service => {
    // Keep inbound links to the old Services cards working as directory entries.
    const anchor = currentPage === 'services.html' && service.legacyAnchor ? ` id="${service.legacyAnchor}"` : '';
    const active = currentPage === service.page ? ' aria-current="page"' : '';
    return `<li><a href="${service.page}"${anchor}${active}><span>${escapeHtml(service.name)}</span><svg viewBox="0 0 8 12" aria-hidden="true" focusable="false"><path d="m2 2 4 4-4 4"/></svg></a></li>`;
  }).join('\n          ');
  return `<nav class="services-sidebar" aria-labelledby="services-sidebar-title">
        <h2 id="services-sidebar-title">SERVICES</h2>
        <ul>
          ${rows}
        </ul>
      </nav>`;
}

function serviceMain(page, content) {
  const directory = page === 'services.html';
  const name = directory ? 'Services' : services.find(service => service.page === page).name;
  const trail = directory
    ? '<li><span aria-current="page">Services</span></li>'
    : `<li><a href="services.html">Services</a></li><li><span aria-hidden="true">/</span></li><li><span aria-current="page">${escapeHtml(name)}</span></li>`;
  return `<main id="main" class="services-section-page">
  <div class="services-container">
    ${directory ? '<h1 class="nav-sr-only">Services</h1>\n    ' : ''}<nav class="services-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li><li><span aria-hidden="true">/</span></li>${trail}</ol></nav>
    <div class="services-layout">
      ${serviceSidebar(page)}
      <div class="services-content">${content}</div>
    </div>
  </div>
</main>`;
}

// Called by both navigation updates and customer-care generation. Once wrapped,
// update only the sidebar so future page content can be edited independently.
export function applyServiceLayout(html, page) {
  if (page !== 'services.html' && !services.some(service => service.page === page)) return html;
  if (!html.includes('href="services.css"')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="services.css" />\n</head>');
  }
  if (html.includes('class="services-section-page"')) {
    return html.replace(/<nav class="services-sidebar"[\s\S]*?<\/nav>/, serviceSidebar(page));
  }
  return html.replace(/<main\b[^>]*>([\s\S]*?)<\/main>/, (_, body) => {
    const content = page === 'services.html' ? '' : body.replace(/<nav class="content-nav"[\s\S]*?<\/nav>/, '').trim();
    return serviceMain(page, content);
  });
}
