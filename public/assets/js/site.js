// Site-wide behaviour added on top of Elementor. Loaded on every page.

// Carousel images are lazy-loaded so they don't slow down the top of the page. Hidden slides,
// though, would only start loading when swiped into view (a blank flash on slow connections).
// So once a carousel is within ~1.5 screens of view, load all of its slides.
(() => {
  const carousels = document.querySelectorAll('.swiper, .elementor-image-carousel-wrapper');
  if (!carousels.length) return;
  const loadAll = (el) => el.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
  if (!('IntersectionObserver' in window)) { carousels.forEach(loadAll); return; }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      loadAll(entry.target);
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '150% 0px' });
  carousels.forEach((el) => observer.observe(el));
})();
