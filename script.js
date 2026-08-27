/**
 * PagiQ Landing Page Interactive Script
 * Simple. Powerful. Private. Intelligent.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeroPillRotation();
  initToolsCatalogFilter();
  initFaqAccordion();
  initNavbarScroll();
  initMobileDrawer();
  initScrollReveals();
  initAppStoreComingSoon();
});

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
  } catch (e) {}

  updateIcon();

  if (btn) {
    btn.addEventListener('click', () => {
      html.classList.toggle('dark');
      const isDark = html.classList.contains('dark');
      try {
        localStorage.setItem('pagiq_theme', isDark ? 'dark' : 'light');
      } catch (e) {}
      updateIcon();
    });
  }
}

/* ================================================================
   2. HERO PILL DYNAMIC TEXT ROTATION
   Rotating between: Convert., Chat AI., Resume., Compress.
   ================================================================ */
function initHeroPillRotation() {
  const pill = document.getElementById('heroPillContainer');
  const pillText = document.getElementById('heroPillText');
  if (!pill || !pillText) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const words = ['Convert.', 'Chat AI.', 'Resume.', 'Compress.'];
  let index = 0;
  let isAnimating = false;

  // Accurate pill width for any word — clone in same parent so clamp() em sizes are exact
  function getPillWidthFor(text) {
    const parent = pill.parentElement;
    if (!parent) return pill.offsetWidth;
    const clone = pill.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.pointerEvents = 'none';
    clone.style.width = 'auto';
    clone.style.maxWidth = 'none';
    clone.style.transition = 'none';
    clone.style.transform = 'none';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.removeAttribute('id');
    const inner = clone.querySelector('#heroPillText');
    if (inner) {
      inner.removeAttribute('id');
      inner.textContent = text;
      inner.style.transition = 'none';
      inner.style.transform = 'none';
      inner.style.opacity = '1';
      inner.style.filter = 'none';
    }
    parent.appendChild(clone);
    const w = clone.getBoundingClientRect().width;
    parent.removeChild(clone);
    return Math.ceil(w);
  }

  // Lock pill to its current width so width-morph can animate smoothly (no auto→px jump)
  function lockPillWidth() {
    const w = getPillWidthFor(pillText.textContent.trim());
    pill.style.width = w + 'px';
  }

  // Initial lock — wait for fonts so clamp() sizes are final
  const init = () => lockPillWidth();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    requestAnimationFrame(init);
  }
  window.addEventListener('load', () => setTimeout(lockPillWidth, 80));

  // Keep pill width correct on resize (responsive clamp) — no animation during resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const curWord = words[index];
      const w = getPillWidthFor(curWord);
      pill.style.transition = 'none';
      pill.style.width = w + 'px';
      void pill.offsetWidth;
      pill.style.transition = '';
    }, 120);
  });

  setInterval(() => {
    if (isAnimating) return;
    isAnimating = true;

    const nextIndex = (index + 1) % words.length;
    const nextWord = words[nextIndex];
    const nextW = getPillWidthFor(nextWord);

    // ——— OUT: whole pill + word disappear ———
    pill.style.transition = 'width 0.32s cubic-bezier(0.4, 0, 1, 1), opacity 0.28s ease, transform 0.32s cubic-bezier(0.4, 0, 1, 1), filter 0.28s ease';
    pill.style.width = '0px';
    pill.style.opacity = '0';
    pill.style.transform = 'scale(0.96)';
    pill.style.filter = 'blur(6px)';
    pillText.style.transition = 'transform 0.30s cubic-bezier(0.4, 0, 1, 1), opacity 0.26s ease, filter 0.26s ease';
    pillText.style.transform = 'translateY(-8px) scale(0.98)';
    pillText.style.opacity = '0';
    pillText.style.filter = 'blur(5px)';

    setTimeout(() => {
      // swap while collapsed & invisible
      pillText.textContent = nextWord;
      pillText.style.transition = 'none';
      pillText.style.transform = 'translateY(8px) scale(0.98)';
      pillText.style.filter = 'blur(5px)';
      pillText.style.opacity = '0';
      // keep pill collapsed with no transition for the snap
      pill.style.transition = 'none';
      void pill.offsetWidth;

      // ——— IN: expand to the right from 0 ———
      pill.style.transition = 'width 0.54s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.36s ease, transform 0.54s cubic-bezier(0.16, 1, 0.3, 1), filter 0.36s ease';
      pillText.style.transition = 'transform 0.54s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.36s ease, filter 0.36s ease';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          pill.style.width = nextW + 'px';
          pill.style.opacity = '1';
          pill.style.transform = 'scale(1)';
          pill.style.filter = 'blur(0px)';
          pillText.style.transform = 'translateY(0) scale(1)';
          pillText.style.opacity = '1';
          pillText.style.filter = 'blur(0px)';
        });
      });
      index = nextIndex;
      setTimeout(() => { isAnimating = false; }, 620);
    }, 340);
  }, 2800);
}

/* ================================================================
   3. 28+ TOOLS CATALOG CATEGORY FILTER & LIVE SEARCH
   ================================================================ */
function initToolsCatalogFilter() {
  const tabs = document.querySelectorAll('.tool-tab');
  const searchInput = document.getElementById('toolSearchInput');
  const cards = document.querySelectorAll('.tool-catalog-card');

  if (!cards.length) return;

  let currentCategory = 'all';
  let searchQuery = '';

  function filterCards() {
    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      const title = card.querySelector('.tool-card-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.tool-card-desc')?.textContent.toLowerCase() || '';

      const matchesCategory = (currentCategory === 'all' || category === currentCategory);
      const matchesSearch = (!searchQuery || title.includes(searchQuery) || desc.includes(searchQuery));

      if (matchesCategory && matchesSearch) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  // Category Tab Click
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentCategory = tab.getAttribute('data-category') || 'all';
      filterCards();
    });
  });

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterCards();
    });
  }
}

/* ================================================================
   4. FAQ ACCORDION
   ================================================================ */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other FAQ items
        items.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            const otherTrigger = otherItem.querySelector('.faq-trigger');
            const otherContent = otherItem.querySelector('.faq-content');
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
            if (otherContent) otherContent.style.maxHeight = '0px';
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          trigger.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = '0px';
        } else {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });
}

/* ================================================================
   5. NAVBAR SCROLL EFFECT
   ================================================================ */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ================================================================
   6. MOBILE NAVIGATION DRAWER
   ================================================================ */
function initMobileDrawer() {
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');

  function openDrawer() {
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  if (drawer) {
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }
}

/* ================================================================
   7. SCROLL REVEAL (IntersectionObserver)
   ================================================================ */
function initScrollReveals() {
  const faders = document.querySelectorAll('.fade-up');
  if (!faders.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    faders.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver is unsupported
    faders.forEach(el => el.classList.add('visible'));
  }
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
  appStoreBtns.forEach(btn => {
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

