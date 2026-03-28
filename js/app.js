document.addEventListener("DOMContentLoaded", () => {
    // 0. Reveal & Animation Logic
    function initReveal() {
        const revealElements = document.querySelectorAll(".reveal");
        if (revealElements.length > 0) {
            const revealObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("active");
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { root: null, threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
            );
            revealElements.forEach((el) => revealObserver.observe(el));
        }

        // Stats Counter Animation
        initStatsCounter();
    }

    function initStatsCounter() {
        const statsNumbers = document.querySelectorAll('.stats-number[data-target]');
        if (statsNumbers.length === 0) return;
        let statsAnimated = false;

        function animateStats() {
            if (statsAnimated) return;
            statsAnimated = true;
            statsNumbers.forEach((el, index) => {
                const target = parseInt(el.dataset.target);
                const suffix = el.dataset.suffix || '';
                const duration = 2000;
                const delay = index * 150;
                setTimeout(() => {
                    const startTime = performance.now();
                    function update(now) {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.round(target * eased);
                        el.innerHTML = current + '<span class="text-accent">' + suffix + '</span>';
                        if (progress < 1) {
                            requestAnimationFrame(update);
                        } else {
                            el.innerHTML = target + '<span class="text-accent">' + suffix + '</span>';
                        }
                    }
                    requestAnimationFrame(update);
                }, delay);
            });
        }

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const statsSection = document.querySelector('.stats-section');
        if (statsSection) statsObserver.observe(statsSection);
    }

    // Initialize animations immediately
    initReveal();

    // 1. LTR / RTL Toggle
    const dirToggleBtn = document.getElementById("dir-toggle");
    const htmlTag = document.documentElement;
    if (dirToggleBtn) {
        dirToggleBtn.addEventListener("click", () => {
            const currentDir = htmlTag.getAttribute("dir");
            const newDir = currentDir === "ltr" ? "rtl" : "ltr";
            htmlTag.setAttribute("dir", newDir);
            if (window.lucide) lucide.createIcons();
        });
    }

    // 1b. Light / Dark Theme Toggle
    const themeToggleBtn = document.getElementById("theme-toggle");
    if (themeToggleBtn) {
        const updateThemeIcon = (theme) => {
            const icon = themeToggleBtn.querySelector("i");
            if (icon) {
                icon.setAttribute("data-lucide", theme === "light" ? "sun" : "moon");
                if (window.lucide) lucide.createIcons();
            }
        };

        const setTheme = (theme) => {
            if (theme === "light") {
                document.body.classList.remove("theme-dark");
                document.body.classList.add("theme-light");
            } else {
                document.body.classList.remove("theme-light");
                document.body.classList.add("theme-dark");
            }
            updateThemeIcon(theme);
            localStorage.setItem("theme", theme);
        };

        themeToggleBtn.addEventListener("click", () => {
            const isLight = document.body.classList.contains("theme-light");
            setTheme(isLight ? "dark" : "light");
        });

        // Init Theme
        const savedTheme = localStorage.getItem("theme") || "dark";
        setTheme(savedTheme);
    }

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav");
    if (menuToggle && nav) {
        menuToggle.addEventListener("click", () => {
            nav.classList.toggle("active");
            document.body.classList.toggle("nav-open", nav.classList.contains("active"));
            const icon = menuToggle.querySelector("i");
            if (nav.classList.contains("active")) {
                icon.setAttribute("data-lucide", "x");
            } else {
                icon.setAttribute("data-lucide", "menu");
                // Close any open dropdowns when closing the menu
                document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
            }
            lucide.createIcons();
        });
    }

    // 2b. Mobile Dropdown Toggle (click instead of hover for touch devices)
    document.querySelectorAll('.nav-dropdown > .dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                const parent = this.closest('.nav-dropdown');
                // Close other dropdowns
                document.querySelectorAll('.nav-dropdown.open').forEach(d => {
                    if (d !== parent) d.classList.remove('open');
                });
                parent.classList.toggle('open');
            }
        });
    });

    // 3. Header Scroll Effect
    const header = document.getElementById("header");
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        });
    }

    // 4. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (href !== "#") {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                    if (nav && nav.classList.contains("active")) {
                        nav.classList.remove("active");
                        if (menuToggle) menuToggle.querySelector("i").setAttribute("data-lucide", "menu");
                        if (window.lucide) lucide.createIcons();
                    }
                }
            }
        });
    });
    // 5. Active Link Highlight
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link:not(.dropdown-toggle), .dropdown-link").forEach(link => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("#") && href.split("#")[0] === currentPage) {
            link.classList.add("active");
            const parentDropdown = link.closest(".nav-dropdown");
            if (parentDropdown) {
                const parentToggle = parentDropdown.querySelector(".dropdown-toggle");
                if (parentToggle) parentToggle.classList.add("active");
            }
        }
    });
});
