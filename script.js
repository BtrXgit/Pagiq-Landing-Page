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
        initScrollProgress();
        initAnalytics();
        if (typeof lucide !== "undefined" && lucide.createIcons) {
            lucide.createIcons();
        }
    }
})();

function initTheme() {
    const html = document.documentElement;
    const btn = document.getElementById("themeToggle");
    const icon = document.getElementById("themeIcon");
    function updateIcon() {
        if (!icon) return;
        if (html.classList.contains("dark")) {
            icon.innerHTML = `<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>`;
            icon.style.color = "#94A3B8";
        } else {
            icon.innerHTML = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>`;
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
    if (!hamburger || !drawer || !overlay) return;

    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let isOpen = false;
    let scrollY = 0;
    let lastFocused = null;
    let closeTimer = null;

    function setExpanded(open) {
        hamburger.setAttribute("aria-expanded", String(open));
        hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        hamburger.classList.toggle("is-open", open);
        document.documentElement.classList.toggle("drawer-open", open);
        document.body.classList.toggle("drawer-open", open);
    }

    function lockScroll() {
        scrollY = window.scrollY || window.pageYOffset || 0;
        const sbw = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        if (sbw) document.body.style.paddingRight = sbw + "px";
    }

    function unlockScroll() {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.paddingRight = "";
        window.scrollTo(0, scrollY);
    }

    function openDrawer() {
        if (isOpen) return;
        isOpen = true;
        clearTimeout(closeTimer);
        lastFocused = document.activeElement;
        overlay.hidden = false;
        try {
            drawer.inert = false;
        } catch (err) {
            drawer.removeAttribute("inert");
        }
        drawer.setAttribute("aria-hidden", "false");
        void overlay.offsetWidth;
        requestAnimationFrame(() => {
            drawer.classList.add("open");
            overlay.classList.add("open");
            setExpanded(true);
            lockScroll();
            const first = drawer.querySelector(focusableSelector);
            if (first) first.focus({
                preventScroll: true
            });
        });
    }

    function closeDrawer() {
        if (!isOpen) return;
        isOpen = false;
        drawer.classList.remove("open");
        overlay.classList.remove("open");
        setExpanded(false);
        unlockScroll();
        drawer.setAttribute("aria-hidden", "true");
        closeTimer = setTimeout(() => {
            if (!isOpen) {
                overlay.hidden = true;
                try {
                    drawer.inert = true;
                } catch (err) {
                    drawer.setAttribute("inert", "");
                }
            }
        }, 320);
        if (lastFocused && typeof lastFocused.focus === "function") {
            lastFocused.focus({
                preventScroll: true
            });
        } else {
            hamburger.focus({
                preventScroll: true
            });
        }
    }

    function toggleDrawer() {
        if (isOpen) closeDrawer();
        else openDrawer();
    }

    hamburger.addEventListener("click", e => {
        e.preventDefault();
        toggleDrawer();
    });
    if (drawerClose) drawerClose.addEventListener("click", e => {
        e.preventDefault();
        closeDrawer();
    });
    overlay.addEventListener("click", closeDrawer);
    overlay.addEventListener("touchmove", e => e.preventDefault(), {
        passive: false
    });

    document.addEventListener("keydown", e => {
        if (!isOpen) return;
        if (e.key === "Escape") {
            e.preventDefault();
            closeDrawer();
            return;
        }
        if (e.key !== "Tab") return;
        const nodes = Array.from(drawer.querySelectorAll(focusableSelector)).filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    drawer.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => closeDrawer());
    });

    let resizeTimer = null;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isOpen && window.matchMedia("(min-width: 960px)").matches) closeDrawer();
        }, 100);
    }, {
        passive: true
    });
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

function initScrollProgress() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bar = document.createElement("div");
    bar.id = "scrollProgress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    let ticking = false;
    const update = () => {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || window.pageYOffset || 0) / max)) : 0;
        bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
        ticking = false;
    };
    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
    window.addEventListener("resize", () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
    update();
}

function initAnalytics() {
    function sendEvent(eventName, data) {
        data = data || {};
        try {
            if (window.zaraz && typeof window.zaraz.track === "function") {
                window.zaraz.track(eventName, data);
            }
            if (typeof window.plausible === "function") {
                window.plausible(eventName, {
                    props: data
                });
            }
            if (window.umami && typeof window.umami.track === "function") {
                window.umami.track(eventName, data);
            }
            if (typeof window.gtag === "function") {
                window.gtag("event", eventName, data);
            }
        } catch (e) {}
        if (window.console && console.debug) {
            console.debug("[Analytics]", eventName, data);
        }
    }
    var playLinks = document.querySelectorAll('a[href*="play.google.com"]');
    playLinks.forEach(function(link) {
        if (link.hasAttribute("data-track-bound")) return;
        link.setAttribute("data-track-bound", "true");
        link.addEventListener("click", function() {
            var label = (link.textContent || link.getAttribute("aria-label") || "Google Play").trim().replace(/\s+/g, " ").slice(0, 80);
            sendEvent("download_click", {
                location: label || "unknown",
                destination: "google_play",
                page: location.pathname
            });
        });
    });
    var iosBtns = document.querySelectorAll(".app-store-btn");
    iosBtns.forEach(function(btn) {
        if (btn.hasAttribute("data-track-bound")) return;
        btn.setAttribute("data-track-bound", "true");
        btn.addEventListener("click", function() {
            sendEvent("appstore_click", {
                location: "app_store_badge",
                destination: "ios_coming_soon",
                page: location.pathname
            });
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