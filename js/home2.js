/* ============================================================
   HOME 2 — JavaScript: Scroll Animations, Tilt, Counter, FAQ
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* ========================
       1. HERO ENTRANCE ANIMATIONS
       ======================== */
    function triggerHeroAnimations() {
        const animEls = document.querySelectorAll(
            '.anim-slide-right, .anim-char-reveal, .anim-fade-up, .anim-float'
        );
        animEls.forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('animated');
            }, 400 + i * 120);
        });
    }

    // Trigger hero animations immediately
    setTimeout(triggerHeroAnimations, 200);

    /* ========================
       2. SCROLL REVEAL (IntersectionObserver)
       ======================== */
    const scrollRevealEls = document.querySelectorAll('.scroll-reveal');
    if (scrollRevealEls.length > 0) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        scrollRevealEls.forEach((el) => revealObserver.observe(el));
    }

    /* ========================
       3. COUNTER ANIMATION
       ======================== */
    function animateCounter(el, target, duration = 2000) {
        let start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target.toLocaleString();
            }
        }
        requestAnimationFrame(update);
    }

    const counterEls = document.querySelectorAll('[data-target]');
    if (counterEls.length > 0) {
        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const target = parseInt(entry.target.dataset.target, 10);
                        animateCounter(entry.target, target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        counterEls.forEach((el) => counterObserver.observe(el));
    }

    /* ========================
       4. TILT CARD EFFECT (Mouse parallax)
       ======================== */
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });

    /* ========================
       5. MAGNETIC BUTTON EFFECT
       ======================== */
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    /* ========================
       6. FAQ ACCORDION
       ======================== */
    const faqItems = document.querySelectorAll('.h2-faq-item');
    faqItems.forEach((item) => {
        const question = item.querySelector('.h2-faq-q');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach((i) => i.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    /* ========================
       7. PARALLAX IMAGE ON SCROLL
       ======================== */
    const parallaxImgs = document.querySelectorAll('.parallax-img img');
    if (parallaxImgs.length > 0) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    parallaxImgs.forEach((img) => {
                        const speed = 0.15;
                        img.style.transform = `scale(1.08) translateY(${scrollY * speed}px)`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /* ========================
       8. SMOOTH SCROLL for nav links
       ======================== */
    document.querySelectorAll('a[href^="#h2-"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ========================
       9. HEADER SCROLL EFFECT
       ======================== */
    const header = document.getElementById('header');
    if (header) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            if (currentScroll > 80) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            lastScroll = currentScroll;
        });
    }

    /* ========================
       10. SERVICES HORIZONTAL SCROLL with mouse drag
       ======================== */
    const servicesTrack = document.querySelector('.h2-services-track');
    if (servicesTrack) {
        let isDown = false;
        let startX;
        let scrollLeft;

        servicesTrack.addEventListener('mousedown', (e) => {
            isDown = true;
            servicesTrack.style.cursor = 'grabbing';
            startX = e.pageX - servicesTrack.offsetLeft;
            scrollLeft = servicesTrack.scrollLeft;
        });
        servicesTrack.addEventListener('mouseleave', () => {
            isDown = false;
            servicesTrack.style.cursor = 'grab';
        });
        servicesTrack.addEventListener('mouseup', () => {
            isDown = false;
            servicesTrack.style.cursor = 'grab';
        });
        servicesTrack.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - servicesTrack.offsetLeft;
            const walk = (x - startX) * 1.5;
            servicesTrack.scrollLeft = scrollLeft - walk;
        });
        servicesTrack.style.cursor = 'grab';
    }

    // Mobile nav and dropdowns are handled by app.js
});
