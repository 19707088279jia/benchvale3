/* Runs before shared catalogue behavior so category pages never show result grids. */
(() => {
  const params = new URLSearchParams(window.location.search);
  const templates = [...document.querySelectorAll('template[data-category-title]')];
  const template = templates.find(item => item.id === `category-page-${params.get('category')}`);
  const main = document.getElementById('main');
  if (params.has('category') && main) {
    document.body.classList.add('category-page');
    if (template) {
      main.replaceChildren(template.content.cloneNode(true));
      document.title = `${template.dataset.categoryTitle} | ChromVale Scientific`;
      document.querySelector('meta[name="description"]')?.setAttribute('content', template.dataset.categoryDescription);
      const pageUrl = `https://chromvale.com/products.html?category=${encodeURIComponent(params.get('category'))}`;
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', pageUrl);
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', pageUrl);
    } else {
      // Unknown/empty category parameters must not expose the generic category-mode body.
      const message = document.createElement('div');
      message.className = 'category-page-container category-not-found';
      const heading = document.createElement('h1'); heading.textContent = 'Category not found';
      const link = document.createElement('a'); link.href = 'products.html'; link.textContent = 'Browse the product catalogue →';
      message.append(heading, link); main.replaceChildren(message);
      document.title = 'Category not found | ChromVale Scientific';
    }
  }
  templates.forEach(item => item.remove());
  document.documentElement.classList.remove('category-pending');
})();
