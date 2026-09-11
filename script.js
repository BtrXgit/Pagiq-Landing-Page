/**
 * PagiQ Landing Page Interactive Script
 * Simple. Powerful. Private. Intelligent.
 * Optimized for 60fps/120fps lag-free performance across all devices
 */

(function () {
  // Run ASAP (script is deferred) — don't wait for full DOMContentLoaded for above-fold
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    initTheme();
    initHeroPillRotation();
    initToolsCatalogFilter();
    initFaqAccordion();
    initNavbarScroll();
    initMobileDrawer();
    initScrollReveals();
    initAppStoreComingSoon();
    initPauseOffscreenAnimations();
  }
})();

/* ================================================================
   1. THEME TOGGLE & PERSISTENCE
   ================================================================ */
function initTheme() {
  const html = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');

  function updateIcon() {
    if (!icon) return;
    if (html.classList.contains('dark')) {
      // Sun icon for dark mode (click to switch to light)
      icon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
      icon.style.color = '#F59E0B';
    } else {
      // Moon icon for light mode (click to switch to dark)
      icon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
      icon.style.color = '#64748B';
    }
  }

  // Check stored preference or system preference
  try {
    const storedTheme = localStorage.getItem('pagiq_theme');
    if (storedTheme === 'dark') {
      html.classList.add('dark');
    } else if (storedTheme === 'light') {
      html.classList.remove('dark');
    }
  } catch (e) { }

  updateIcon();

  if (btn) {
    btn.addEventListener('click', () => {
      html.classList.toggle('dark');
      const isDark = html.classList.contains('dark');
      try {
        localStorage.setItem('pagiq_theme', isDark ? 'dark' : 'light');
      } catch (e) { }
      updateIcon();
    });
  }
}

/* ================================================================
   2. HERO PILL TEXT ROTATION — smooth background morph (A→B width)
   Pill is width:auto so its background hugs each word. On every swap
   we lock the old width, measure the new word's natural width, then
   let a CSS width transition morph the background while the text
   crossfades. Only ~2 forced layouts per ~3s cycle — negligible cost.
   ================================================================ */
function initHeroPillRotation() {
  const pill = document.getElementById('heroPillContainer');
  const pillText = document.getElementById('heroPillText');
  const heroSection = document.getElementById('hero');
  if (!pill || !pillText) return;

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const words = ['Convert.', 'Chat AI.', 'Resume.', 'Compress.'];
  let index = 0;
  let visible = true;
  let timeoutId = null;
  let releaseTimer = null;

  const OUT_MS = 300;
  const IN_DELAY_MS = 30;
  const HOLD_MS = 2800;
  const MORPH_MS = 420;

  function scheduleNext(delay) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(tick, delay);
  }

  function releaseWidth() {
    clearTimeout(releaseTimer);
    releaseTimer = setTimeout(() => {
      pill.style.width = '';
    }, MORPH_MS + 60);
  }

  function tick() {
    if (!visible || document.hidden) {
      scheduleNext(800);
      return;
    }
    // Lock current width so the background can't snap during the swap
    pill.style.width = pill.offsetWidth + 'px';

    // OUT: slide up + fade (compositor only)
    pillText.classList.remove('is-in', 'is-pre');
    pillText.classList.add('is-out');

    setTimeout(() => {
      if (!visible || document.hidden) {
        // Revert so text never gets stuck invisible
        pillText.classList.remove('is-out', 'is-pre');
        pillText.classList.add('is-in');
        pill.style.width = '';
        scheduleNext(800);
        return;
      }
      index = (index + 1) % words.length;
      pillText.textContent = words[index];

      // Measure the new word's natural width, then morph A → B.
      // All reads/writes batched here; browser paints only after,
      // so the invert step never flashes on screen.
      const fromW = pill.offsetWidth;
      pill.style.width = 'auto';
      const toW = pill.offsetWidth;
      pill.style.width = fromW + 'px';
      void pill.offsetWidth; // commit inverted state
      pill.style.width = toW + 'px'; // CSS transition morphs background
      releaseWidth();

      // Snap text below (no transition), then animate in on next frame
      pillText.classList.remove('is-out', 'is-in');
      pillText.classList.add('is-pre');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          pillText.classList.remove('is-pre');
          pillText.classList.add('is-in');
        });
      });

      scheduleNext(HOLD_MS);
    }, OUT_MS + IN_DELAY_MS);
  }

  scheduleNext(HOLD_MS);

  // Pause when hero is out of view (also pauses CSS shine via .hero-paused)
  if ('IntersectionObserver' in window && heroSection) {
    const heroObs = new IntersectionObserver((entries) => {
      const entry = entries[0];
      visible = entry.isIntersecting;
      heroSection.classList.toggle('hero-paused', !visible);
      if (visible) scheduleNext(400);
    }, { threshold: 0.02 });
    heroObs.observe(heroSection);
  }

  // Pause when tab is in the background
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visible) scheduleNext(400);
  });
}

/* ================================================================
   3. 28+ TOOLS CATALOG CATEGORY FILTER & LIVE SEARCH
   Cached text + rAF batching to avoid layout thrash on every keystroke
   ================================================================ */
function initToolsCatalogFilter() {
  const tabs = document.querySelectorAll('.tool-tab');
  const searchInput = document.getElementById('toolSearchInput');
  const cards = Array.from(document.querySelectorAll('.tool-catalog-card'));

  if (!cards.length) return;

  // Pre-cache lowercase searchable text once (no per-filter DOM reads)
  const cache = cards.map((card) => ({
    el: card,
    category: card.getAttribute('data-category') || '',
    text: (
      (card.querySelector('.tool-card-title')?.textContent || '') +
      ' ' +
      (card.querySelector('.tool-card-desc')?.textContent || '')
    ).toLowerCase(),
  }));

  let currentCategory = 'all';
  let searchQuery = '';
  let rafId = 0;

  function applyFilter() {
    rafId = 0;
    for (let i = 0; i < cache.length; i++) {
      const c = cache[i];
      const matchesCategory = currentCategory === 'all' || c.category === currentCategory;
      const matchesSearch = !searchQuery || c.text.includes(searchQuery);
      c.el.classList.toggle('hidden', !(matchesCategory && matchesSearch));
    }
  }

  function requestFilter() {
    if (rafId) return;
    rafId = requestAnimationFrame(applyFilter);
  }

  // Category Tab Click
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentCategory = tab.getAttribute('data-category') || 'all';
      requestFilter();
    });
  });

  // Search Input Event (debounced + rAF)
  if (searchInput) {
    let searchDebounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        searchQuery = e.target.value.trim().toLowerCase();
        requestFilter();
      }, 90);
    });
  }
}

/* ================================================================
   4. FAQ ACCORDION — class-only, no scrollHeight layout reads
   (animation handled by CSS grid-template-rows)
   ================================================================ */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close others (class toggle only — no forced reflow)
      document.querySelectorAll('.faq-item.active').forEach((other) => {
        if (other !== item) {
          other.classList.remove('active');
          other.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('active', !isActive);
      trigger.setAttribute('aria-expanded', String(!isActive));
    });
  });
}

/* ================================================================
   5. NAVBAR SCROLL EFFECT (RAF Throttled for 60/120fps)
   ================================================================ */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let isScrolled = false;
  let ticking = false;

  const updateNavbar = () => {
    const shouldBeScrolled = window.scrollY > 20;
    if (shouldBeScrolled !== isScrolled) {
      isScrolled = shouldBeScrolled;
      if (isScrolled) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  updateNavbar();
}

/* ================================================================
   6. MOBILE NAVIGATION DRAWER — no scroll jump
   ================================================================ */
function initMobileDrawer() {
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');
  let scrollY = 0;

  function openDrawer() {
    scrollY = window.scrollY || 0;
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    // Lock scroll without jumping to top
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, scrollY);
  }

  if (hamburger) hamburger.addEventListener('click', openDrawer, { passive: true });
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  if (drawer) {
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });
  }
}

/* ================================================================
   7. SCROLL REVEAL — hero shows instantly, rest batched via rAF
   ================================================================ */
function initScrollReveals() {
  const faders = Array.from(document.querySelectorAll('.fade-up'));
  if (!faders.length) return;

  // Above-fold hero content: reveal on next frame, don't wait for IO
  const heroFaders = faders.filter((el) => el.closest('#hero'));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroFaders.forEach((el) => el.classList.add('visible'));
    });
  });

  const rest = faders.filter((el) => !el.closest('#hero'));
  if (!rest.length) return;

  if (!('IntersectionObserver' in window)) {
    rest.forEach((el) => el.classList.add('visible'));
    return;
  }

  let pending = [];
  let rafQueued = false;

  const flush = () => {
    rafQueued = false;
    const toShow = pending;
    pending = [];
    toShow.forEach((el) => el.classList.add('visible'));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          pending.push(entry.target);
          observer.unobserve(entry.target);
        }
      });
      if (pending.length && !rafQueued) {
        rafQueued = true;
        requestAnimationFrame(flush);
      }
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  rest.forEach((el) => observer.observe(el));
}

/* ================================================================
   8. APP STORE "COMING SOON..." TOAST NOTIFICATION
   ================================================================ */
function initAppStoreComingSoon() {
  const appStoreBtns = document.querySelectorAll('.app-store-btn');
  if (!appStoreBtns.length) return;

  // Create toast container if not already in DOM
  let toast = document.getElementById('comingSoonToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'comingSoonToast';
    toast.className = 'toast-notification';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <div class="toast-icon">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      </div>
      <div class="toast-content">
        <div class="toast-title-row">
          <span class="toast-title">iOS App Coming Soon...</span>
          <span class="toast-badge">In Review</span>
        </div>
        <p class="toast-sub">We're finalizing PagiQ for iPhone. Stay tuned!</p>
      </div>
      <button class="toast-close" id="toastCloseBtn" aria-label="Close notification">&times;</button>
    `;
    document.body.appendChild(toast);

    const closeBtn = toast.querySelector('#toastCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
      });
    }
  }

  let toastTimeout;
  appStoreBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      clearTimeout(toastTimeout);
      toast.classList.add('show');

      // Auto dismiss after 3.5 seconds
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    });
  });
}

/* ================================================================
   9. PAUSE OFFSCREEN INFINITE ANIMATIONS (laser, floats)
   Saves GPU/battery while scrolling past heavy mockups
   ================================================================ */
function initPauseOffscreenAnimations() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = document.querySelectorAll(
    '.mobile-showcase-frame, .scanner-viewfinder-target, .hero-mockup-wrapper'
  );
  if (!targets.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // `contain: paint` on child + paused animation = zero repaint cost
        entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
        const animated = entry.target.querySelectorAll(
          '.scan-laser-bar, .floating-card'
        );
        animated.forEach((el) => {
          el.style.animationPlayState = entry.isIntersecting ? '' : 'paused';
        });
      });
    },
    { threshold: 0.02, rootMargin: '80px 0px 80px 0px' }
  );

  targets.forEach((t) => obs.observe(t));
}
