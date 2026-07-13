// ----- Inline theme (no FOUC) -----
(function() {
  var html = document.documentElement;
  try {
    var theme = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && prefersDark)) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  } catch(e) {}
})();

// ----- Theme Toggle -----
(function() {
  var html = document.documentElement;
  var btn = document.getElementById('themeToggle');
  var icon = document.getElementById('themeIcon');
  function updateIcon() {
    if (html.classList.contains('dark')) {
      icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
      icon.style.color = '#f59e0b';
    } else {
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
      icon.style.color = '#6b7280';
    }
  }
  updateIcon();
  btn.addEventListener('click', function() {
    html.classList.toggle('dark');
    try { localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light'); } catch(e) {}
    updateIcon();
  });
})();

// ----- Navbar scroll -----
(function() {
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
})();

// ----- Mobile drawer -----
(function() {
  var hamburger = document.getElementById('hamburger');
  var drawer = document.getElementById('drawer');
  var overlay = document.getElementById('drawerOverlay');
  var drawerClose = document.getElementById('drawerClose');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
  if (drawer) {
    drawer.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', closeDrawer);
    });
  }
})();

// ----- Fade-up animations (IntersectionObserver) -----
(function() {
  var faders = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    faders.forEach(function(el) { observer.observe(el); });
  } else {
    faders.forEach(function(el) { el.classList.add('visible'); });
  }
})();
