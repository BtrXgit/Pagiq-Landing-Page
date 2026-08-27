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
  const pillText = document.getElementById('heroPillText');
  if (!pillText) return;

  const words = ['Convert.', 'Chat AI.', 'Resume.', 'Compress.'];
  let index = 0;

  setInterval(() => {
    // Fade out and shift up slightly
    pillText.style.opacity = '0';
    pillText.style.transform = 'translateY(-6px)';

    setTimeout(() => {
      index = (index + 1) % words.length;
      pillText.textContent = words[index];
      pillText.style.transform = 'translateY(6px)';

      // Fade in and return to baseline
      setTimeout(() => {
        pillText.style.opacity = '1';
        pillText.style.transform = 'translateY(0)';
      }, 50);
    }, 250);
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
