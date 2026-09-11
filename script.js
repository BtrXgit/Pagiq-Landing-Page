(function() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, {
            once: true
        });
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

function initTheme() {
    const html = document.documentElement;
    const btn = document.getElementById("themeToggle");
    const icon = document.getElementById("themeIcon");
    function updateIcon() {
        if (!icon) return;
        if (html.classList.contains("dark")) {
            icon.innerHTML = `\n        <circle cx="12" cy="12" r="5"></circle>\n        <line x1="12" y1="1" x2="12" y2="3"></line>\n        <line x1="12" y1="21" x2="12" y2="23"></line>\n        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>\n        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>\n        <line x1="1" y1="12" x2="3" y2="12"></line>\n        <line x1="21" y1="12" x2="23" y2="12"></line>\n        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>\n        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>\n      `;
            icon.style.color = "#F59E0B";
        } else {
            icon.innerHTML = `\n        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>\n      `;
            icon.style.color = "#64748B";
        }
    }
    try {
        const storedTheme = localStorage.getItem("pagiq_theme");
        if (storedTheme === "dark") {
            html.classList.add("dark");
        } else if (storedTheme === "light") {
            html.classList.remove("dark");
        }
    } catch (e) {}
    updateIcon();
    if (btn) {
        btn.addEventListener("click", () => {
            html.classList.toggle("dark");
            const isDark = html.classList.contains("dark");
            try {
                localStorage.setItem("pagiq_theme", isDark ? "dark" : "light");
            } catch (e) {}
            updateIcon();
        });
    }
}

function initHeroPillRotation() {
    const pill = document.getElementById("heroPillContainer");
    const pillText = document.getElementById("heroPillText");
    const heroSection = document.getElementById("hero");
    if (!pill || !pillText) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const words = [ "Convert.", "Chat AI.", "Resume.", "Compress." ];
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
            pill.style.width = "";
        }, MORPH_MS + 60);
    }
    function tick() {
        if (!visible || document.hidden) {
            scheduleNext(800);
            return;
        }
        pill.style.width = pill.offsetWidth + "px";
        pillText.classList.remove("is-in", "is-pre");
        pillText.classList.add("is-out");
        setTimeout(() => {
            if (!visible || document.hidden) {
                pillText.classList.remove("is-out", "is-pre");
                pillText.classList.add("is-in");
                pill.style.width = "";
                scheduleNext(800);
                return;
            }
            index = (index + 1) % words.length;
            pillText.textContent = words[index];
            const fromW = pill.offsetWidth;
            pill.style.width = "auto";
            const toW = pill.offsetWidth;
            pill.style.width = fromW + "px";
            void pill.offsetWidth;
            pill.style.width = toW + "px";
            releaseWidth();
            pillText.classList.remove("is-out", "is-in");
            pillText.classList.add("is-pre");
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    pillText.classList.remove("is-pre");
                    pillText.classList.add("is-in");
                });
            });
            scheduleNext(HOLD_MS);
        }, OUT_MS + IN_DELAY_MS);
    }
    scheduleNext(HOLD_MS);
    if ("IntersectionObserver" in window && heroSection) {
        const heroObs = new IntersectionObserver(entries => {
            const entry = entries[0];
            visible = entry.isIntersecting;
            heroSection.classList.toggle("hero-paused", !visible);
            if (visible) scheduleNext(400);
        }, {
            threshold: .02
        });
        heroObs.observe(heroSection);
    }
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && visible) scheduleNext(400);
    });
}

function initToolsCatalogFilter() {
    const tabs = document.querySelectorAll(".tool-tab");
    const searchInput = document.getElementById("toolSearchInput");
    const cards = Array.from(document.querySelectorAll(".tool-catalog-card"));
    if (!cards.length) return;
    const cache = cards.map(card => ({
        el: card,
        category: card.getAttribute("data-category") || "",
        text: ((card.querySelector(".tool-card-title")?.textContent || "") + " " + (card.querySelector(".tool-card-desc")?.textContent || "")).toLowerCase()
    }));
    let currentCategory = "all";
    let searchQuery = "";
    let rafId = 0;
    function applyFilter() {
        rafId = 0;
        for (let i = 0; i < cache.length; i++) {
            const c = cache[i];
            const matchesCategory = currentCategory === "all" || c.category === currentCategory;
            const matchesSearch = !searchQuery || c.text.includes(searchQuery);
            c.el.classList.toggle("hidden", !(matchesCategory && matchesSearch));
        }
    }
    function requestFilter() {
        if (rafId) return;
        rafId = requestAnimationFrame(applyFilter);
    }
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");
            currentCategory = tab.getAttribute("data-category") || "all";
            requestFilter();
        });
    });
    if (searchInput) {
        let searchDebounce;
        searchInput.addEventListener("input", e => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                searchQuery = e.target.value.trim().toLowerCase();
                requestFilter();
            }, 90);
        });
    }
}

function initFaqAccordion() {
    const items = document.querySelectorAll(".faq-item");
    if (!items.length) return;
    items.forEach(item => {
        const trigger = item.querySelector(".faq-trigger");
        if (!trigger) return;
        trigger.addEventListener("click", () => {
            const isActive = item.classList.contains("active");
            document.querySelectorAll(".faq-item.active").forEach(other => {
                if (other !== item) {
                    other.classList.remove("active");
                    other.querySelector(".faq-trigger")?.setAttribute("aria-expanded", "false");
                }
            });
            item.classList.toggle("active", !isActive);
            trigger.setAttribute("aria-expanded", String(!isActive));
        });
    });
}

function initNavbarScroll() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;
    let isScrolled = false;
    let ticking = false;
    const updateNavbar = () => {
        const shouldBeScrolled = window.scrollY > 20;
        if (shouldBeScrolled !== isScrolled) {
            isScrolled = shouldBeScrolled;
            if (isScrolled) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        }
        ticking = false;
    };
    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, {
        passive: true
    });
    updateNavbar();
}

function initMobileDrawer() {
    const hamburger = document.getElementById("hamburger");
    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("drawerOverlay");
    const drawerClose = document.getElementById("drawerClose");
    let scrollY = 0;
    function openDrawer() {
        scrollY = window.scrollY || 0;
        if (drawer) drawer.classList.add("open");
        if (overlay) overlay.classList.add("open");
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
    }
    function closeDrawer() {
        if (drawer) drawer.classList.remove("open");
        if (overlay) overlay.classList.remove("open");
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        window.scrollTo(0, scrollY);
    }
    if (hamburger) hamburger.addEventListener("click", openDrawer, {
        passive: true
    });
    if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
    if (overlay) overlay.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && drawer && drawer.classList.contains("open")) {
            closeDrawer();
        }
    });
    if (drawer) {
        drawer.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", closeDrawer);
        });
    }
}

function initScrollReveals() {
    const faders = Array.from(document.querySelectorAll(".fade-up"));
    if (!faders.length) return;
    const heroFaders = faders.filter(el => el.closest("#hero"));
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            heroFaders.forEach(el => el.classList.add("visible"));
        });
    });
    const rest = faders.filter(el => !el.closest("#hero"));
    if (!rest.length) return;
    if (!("IntersectionObserver" in window)) {
        rest.forEach(el => el.classList.add("visible"));
        return;
    }
    let pending = [];
    let rafQueued = false;
    const flush = () => {
        rafQueued = false;
        const toShow = pending;
        pending = [];
        toShow.forEach(el => el.classList.add("visible"));
    };
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                pending.push(entry.target);
                observer.unobserve(entry.target);
            }
        });
        if (pending.length && !rafQueued) {
            rafQueued = true;
            requestAnimationFrame(flush);
        }
    }, {
        threshold: .08,
        rootMargin: "0px 0px -40px 0px"
    });
    rest.forEach(el => observer.observe(el));
}

function initAppStoreComingSoon() {
    const appStoreBtns = document.querySelectorAll(".app-store-btn");
    if (!appStoreBtns.length) return;
    let toast = document.getElementById("comingSoonToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "comingSoonToast";
        toast.className = "toast-notification";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.innerHTML = `\n      <div class="toast-icon">\n        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">\n          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>\n        </svg>\n      </div>\n      <div class="toast-content">\n        <div class="toast-title-row">\n          <span class="toast-title">iOS App Coming Soon...</span>\n          <span class="toast-badge">In Review</span>\n        </div>\n        <p class="toast-sub">We're finalizing PagiQ for iPhone. Stay tuned!</p>\n      </div>\n      <button class="toast-close" id="toastCloseBtn" aria-label="Close notification">&times;</button>\n    `;
        document.body.appendChild(toast);
        const closeBtn = toast.querySelector("#toastCloseBtn");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                toast.classList.remove("show");
            });
        }
    }
    let toastTimeout;
    appStoreBtns.forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();
            clearTimeout(toastTimeout);
            toast.classList.add("show");
            toastTimeout = setTimeout(() => {
                toast.classList.remove("show");
            }, 3500);
        });
    });
}

function initPauseOffscreenAnimations() {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = document.querySelectorAll(".mobile-showcase-frame, .scanner-viewfinder-target, .hero-mockup-wrapper");
    if (!targets.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
            const animated = entry.target.querySelectorAll(".scan-laser-bar, .floating-card");
            animated.forEach(el => {
                el.style.animationPlayState = entry.isIntersecting ? "" : "paused";
            });
        });
    }, {
        threshold: .02,
        rootMargin: "80px 0px 80px 0px"
    });
    targets.forEach(t => obs.observe(t));
}