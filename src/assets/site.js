// Rivers Industrial Racks: all site behaviour (plain JavaScript, no libraries).
document.documentElement.classList.add('js');

// Open every new page at the top. (Back/forward keeps the browser's remembered position,
// and links to a section such as #Contact still jump there.) scrollIntoView also scrolls an
// embedding frame, such as a preview viewer, back to the top. It runs again once the page has
// loaded, because a viewer may resize its frame after the new page appears.
const navEntry = performance.getEntriesByType?.('navigation')[0];
if (!location.hash && navEntry?.type !== 'back_forward') {
  const toTop = () => {
    window.scrollTo(0, 0);
    try { document.documentElement.scrollIntoView({ block: 'start', behavior: 'instant' }); } catch { document.documentElement.scrollIntoView(true); }
  };
  toTop();
  requestAnimationFrame(toTop);
  window.addEventListener('load', () => { toTop(); setTimeout(toTop, 300); }, { once: true });
}

// ---- Mobile menu: hamburger opens the panel; arrows open each section ----
const toggle = document.querySelector('.menu-toggle');
const panel = document.getElementById('nav-panel');
if (toggle && panel) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
  });
  panel.addEventListener('click', (e) => {
    const sub = e.target.closest('.menu__sub-toggle');
    if (sub) {
      const open = sub.getAttribute('aria-expanded') !== 'true';
      sub.setAttribute('aria-expanded', String(open));
      document.getElementById(sub.getAttribute('aria-controls')).classList.toggle('is-open', open);
      return;
    }
    // Following an in-page link (e.g. #Contact) closes the menu.
    if (e.target.closest('a') && toggle.getAttribute('aria-expanded') === 'true') toggle.click();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { toggle.click(); toggle.focus(); } });
}

// ---- Desktop mega menus: load their photos the first time someone uses the menu ----
const menu = document.querySelector('.header .menu');
const loadMegaPhotos = () => document.querySelectorAll('.mega__media[data-bg]').forEach((el) => {
  el.style.backgroundImage = `url(${el.dataset.bg})`;
  el.removeAttribute('data-bg');
});
menu?.addEventListener('pointerenter', loadMegaPhotos, { once: true });
menu?.addEventListener('focusin', loadMegaPhotos, { once: true });

// ---- Hero background slideshow: fade between photos every 5 seconds ----
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.hero__slides').forEach((slides) => {
  const imgs = [...slides.querySelectorAll('img')];
  if (imgs.length < 2 || reduceMotion) return;
  let i = 0;
  setInterval(() => {
    imgs[i].classList.remove('is-active');
    i = (i + 1) % imgs.length;
    imgs[i].classList.add('is-active');
  }, 5000);
});

// ---- Image carousels: arrows, swipe (native scrolling) and autoplay ----
document.querySelectorAll('.carousel').forEach((carousel) => {
  const track = carousel.querySelector('.carousel__track');
  const count = track.children.length;
  const current = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = (n) => track.scrollTo({ left: ((n + count) % count) * track.clientWidth });
  carousel.querySelector('.carousel__btn--prev')?.addEventListener('click', () => go(current() - 1));
  carousel.querySelector('.carousel__btn--next')?.addEventListener('click', () => go(current() + 1));
  if (count > 1 && !reduceMotion) {
    let timer = setInterval(() => go(current() + 1), 5000);
    const pause = () => clearInterval(timer);
    carousel.addEventListener('pointerenter', pause);
    carousel.addEventListener('focusin', pause);
    track.addEventListener('touchstart', pause, { passive: true });
  }
});

// ---- Sections fade in as they scroll into view ----
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
  }, { rootMargin: '0px 0px -10% 0px' });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-visible'));
}

// ---- Contact / quote forms: send to /api/quote (functions/api/quote.js), which emails them ----
const PHONE = '1-989-600-9030';
const MAX_FILES = 10;
const MAX_BYTES = 15 * 1024 * 1024;
document.querySelectorAll('form[data-form]').forEach((form) => {
  const button = form.querySelector('[type="submit"]');
  const say = (text, ok) => {
    form.querySelector('.form__message')?.remove();
    const msg = document.createElement('p');
    msg.className = `form__message${ok ? ' form__message--ok' : ''}`;
    msg.setAttribute('role', ok ? 'status' : 'alert');
    msg.textContent = text;
    form.append(msg);
    msg.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const files = [...form.querySelectorAll('input[type="file"]')].flatMap((input) => [...input.files]);
    if (files.length > MAX_FILES) return say(`Please attach no more than ${MAX_FILES} files.`);
    if (files.reduce((n, f) => n + f.size, 0) > MAX_BYTES) return say('Attachments are limited to 15 MB in total. Please send fewer or smaller files.');
    const data = new FormData(form);
    data.set('page', location.pathname);
    button.disabled = true;
    button.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { accept: 'application/json' } });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.ok) {
        const first = data.get('first_name');
        form.reset();
        say(`Thanks${first ? `, ${first}` : ''}! Your request was sent. We’ll review it and get back to you soon. For anything urgent, call ${PHONE}.`, true);
      } else {
        say(result.error || `Your request couldn’t be sent. Please call us at ${PHONE}.`);
      }
    } catch {
      say(`Your request couldn’t be sent. Please check your connection, or call us at ${PHONE}.`);
    } finally {
      button.disabled = false;
      button.textContent = 'Send';
      window.turnstile?.reset();
    }
  });
});
