/* ============================================================
   SAND AND ROSE CONSTRUCTION — main.js
   Features: nav scroll, mobile menu, fade-up, lightbox,
             portfolio filter, stat counter, before/after slider
   No jQuery. Pure vanilla JS.
   ============================================================ */

(function () {
  'use strict';

  /* ── JS detection (fixes fade-up crawlability bug) ───────── */
  document.documentElement.classList.add('js');

  /* ── NAV SCROLL ──────────────────────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── MOBILE MENU ─────────────────────────────────────────── */
  const toggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.nav__mobile');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      const isOpen = mobileMenu.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
      });
    });
  }

  /* ── ACTIVE NAV LINK ─────────────────────────────────────── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── FADE-UP ON SCROLL ───────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-up').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-up').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ── STAT COUNTERS ───────────────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const start = performance.now();
        countObserver.unobserve(el);

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ── LIGHTBOX ────────────────────────────────────────────── */
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox && lightbox.querySelector('img');
  const lightboxCaption = lightbox && lightbox.querySelector('.lightbox__caption');
  let lightboxItems = [];
  let lightboxIndex = 0;

  function openLightbox(items, index) {
    if (!lightbox) return;
    lightboxItems = items;
    lightboxIndex = index;
    showLightboxItem();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function showLightboxItem() {
    const item = lightboxItems[lightboxIndex];
    if (!item || !lightboxImg) return;
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt || '';
    if (lightboxCaption) lightboxCaption.textContent = item.caption || '';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    if (lightboxImg) lightboxImg.src = '';
  }

  if (lightbox) {
    lightbox.querySelector('.lightbox__close') &&
      lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__nav--prev') &&
      lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', function () {
        lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
        showLightboxItem();
      });
    lightbox.querySelector('.lightbox__nav--next') &&
      lightbox.querySelector('.lightbox__nav--next').addEventListener('click', function () {
        lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
        showLightboxItem();
      });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') {
        lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
        showLightboxItem();
      }
      if (e.key === 'ArrowRight') {
        lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
        showLightboxItem();
      }
    });
  }

  /* ── PORTFOLIO FILTER + LIGHTBOX INIT ───────────────────── */
  const filterBtns = document.querySelectorAll('.portfolio-filter__btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        portfolioItems.forEach(function (item) {
          const category = item.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
        buildLightboxItems();
      });
    });
  }

  function buildLightboxItems() {
    const visible = Array.from(document.querySelectorAll('.portfolio-item:not([style*="none"])'));
    const items = visible.map(function (item) {
      const img = item.querySelector('img');
      const title = item.querySelector('.portfolio-item__title');
      const label = item.querySelector('.portfolio-item__label');
      return {
        src: img ? img.getAttribute('data-full') || img.src : '',
        alt: img ? img.alt : '',
        caption: [label && label.textContent, title && title.textContent].filter(Boolean).join(' — ')
      };
    });

    visible.forEach(function (item, i) {
      item.addEventListener('click', function () {
        openLightbox(items, i);
      });
    });
    return items;
  }

  if (portfolioItems.length) {
    buildLightboxItems();
  }

  /* ── BEFORE/AFTER SLIDER ─────────────────────────────────── */
  document.querySelectorAll('.before-after').forEach(function (slider) {
    const handle = slider.querySelector('.ba-handle');
    const afterEl = slider.querySelector('.ba-after');
    let dragging = false;

    function setPosition(x) {
      const rect = slider.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      if (afterEl) afterEl.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      if (handle) handle.style.left = pct + '%';
    }

    if (handle) {
      handle.addEventListener('mousedown', function () { dragging = true; });
      handle.addEventListener('touchstart', function () { dragging = true; }, { passive: true });
    }
    window.addEventListener('mouseup', function () { dragging = false; });
    window.addEventListener('touchend', function () { dragging = false; });
    slider.addEventListener('mousemove', function (e) {
      if (dragging) setPosition(e.clientX);
    });
    slider.addEventListener('touchmove', function (e) {
      if (dragging && e.touches[0]) setPosition(e.touches[0].clientX);
    }, { passive: true });
    setPosition(slider.getBoundingClientRect().left + slider.offsetWidth / 2);
  });

  /* ── FORM VALIDATION ─────────────────────────────────────── */
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      let valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          field.style.borderColor = '#c0392b';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      if (!valid) {
        e.preventDefault();
        const first = form.querySelector('[required]:placeholder-shown, [required][value=""]');
        if (first) first.focus();
      }
    });
  });

  /* ── SMOOTH ANCHOR SCROLL ────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

}());
