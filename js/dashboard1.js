/* ═══════════════════════════════════════════════════════════
   VELOCITY MOTORSPORTS — DASHBOARD 1 JS
   Animations, Charts, Counters, Interactivity
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // ── RTL / LTR TOGGLE ──
    const dirToggle = document.getElementById('dirToggle');
    if (dirToggle) {
        dirToggle.addEventListener('click', () => {
            const html = document.documentElement;
            const current = html.getAttribute('dir') || 'ltr';
            const next = current === 'ltr' ? 'rtl' : 'ltr';
            html.setAttribute('dir', next);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    // ── THEME TOGGLE ──
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const setTheme = (theme) => {
            if (theme === 'light') {
                document.body.classList.remove('theme-dark');
                document.body.classList.add('theme-light');
            } else {
                document.body.classList.remove('theme-light');
                document.body.classList.add('theme-dark');
            }
            const icon = themeToggle.querySelector('[data-lucide]');
            if (icon) {
                icon.setAttribute('data-lucide', theme === 'light' ? 'moon' : 'sun');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
            localStorage.setItem('theme', theme);
        };

        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.contains('theme-light');
            setTheme(isLight ? 'dark' : 'light');
        });

        // Init from saved preference
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
    }

    // ── SIDEBAR TOGGLE ──
    const sidebar = document.getElementById('dbSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.toggle('open');
            } else {
                sidebar.classList.toggle('collapsed');
            }
        });
        // Close sidebar on overlay click (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && sidebar.classList.contains('open')) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }

    // ── ANIMATED COUNTERS ──
    function animateCounters() {
        document.querySelectorAll('[data-count]').forEach(el => {
            if (el.dataset.animated) return;
            const target = parseInt(el.dataset.count);
            if (isNaN(target)) return;
            el.dataset.animated = 'true';
            const duration = 1500;
            const startTime = performance.now();
            const startVal = 0;

            function update(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(startVal + (target - startVal) * eased);
                el.textContent = current.toLocaleString();
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        });
    }

    // Use IntersectionObserver for counters
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.db-metrics, .db-quick-actions, .db-welcome').forEach(section => {
        counterObserver.observe(section);
    });

    // ── SPENDING CHART (Canvas) ──
    const canvas = document.getElementById('spendingCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        function drawChart() {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            ctx.scale(dpr, dpr);

            const w = rect.width;
            const h = rect.height;
            const padL = 50, padR = 20, padT = 20, padB = 40;
            const chartW = w - padL - padR;
            const chartH = h - padT - padB;

            ctx.clearRect(0, 0, w, h);

            // Data
            const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
            const services = [420, 680, 350, 890, 540, 780];
            const parts = [220, 310, 180, 450, 280, 360];
            const maintenance = [180, 240, 290, 200, 320, 280];
            const maxVal = 1000;

            // Grid lines
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = padT + (chartH / 4) * i;
                ctx.beginPath();
                ctx.moveTo(padL, y);
                ctx.lineTo(w - padR, y);
                ctx.stroke();

                // Y-axis labels
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.font = '11px Inter';
                ctx.textAlign = 'right';
                ctx.fillText('$' + ((maxVal - (maxVal / 4) * i)).toFixed(0), padL - 8, y + 4);
            }

            // X-axis labels
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '12px Inter';
            months.forEach((month, i) => {
                const x = padL + (chartW / (months.length - 1)) * i;
                ctx.fillText(month, x, h - 8);
            });

            // Draw smooth lines
            function drawLine(data, color, fill) {
                const points = data.map((val, i) => ({
                    x: padL + (chartW / (data.length - 1)) * i,
                    y: padT + chartH - (val / maxVal) * chartH
                }));

                // Gradient fill
                if (fill) {
                    const gradient = ctx.createLinearGradient(0, padT, 0, padT + chartH);
                    gradient.addColorStop(0, color + '30');
                    gradient.addColorStop(1, color + '00');
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, padT + chartH);
                    drawSmoothCurve(points);
                    ctx.lineTo(points[points.length - 1].x, padT + chartH);
                    ctx.closePath();
                    ctx.fillStyle = gradient;
                    ctx.fill();
                }

                // Line
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                drawSmoothCurve(points);
                ctx.stroke();

                // Dots
                points.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = '#151a22';
                    ctx.fill();
                });
            }

            function drawSmoothCurve(points) {
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 0; i < points.length - 1; i++) {
                    const xc = (points[i].x + points[i + 1].x) / 2;
                    const yc = (points[i].y + points[i + 1].y) / 2;
                    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
                }
                ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
            }

            drawLine(maintenance, '#00b4d8', true);
            drawLine(parts, '#06d6a0', true);
            drawLine(services, '#D90429', true);
        }

        drawChart();
        window.addEventListener('resize', drawChart);
    }

    // ── GAUGE ANIMATION ──
    const gaugeFill = document.querySelector('.gauge-fill');
    if (gaugeFill) {
        const gaugeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const total = 251.2;
                    const percentage = 0.98; // 98%
                    const offset = total * (1 - percentage);
                    setTimeout(() => {
                        gaugeFill.style.transition = 'stroke-dashoffset 1.5s ease';
                        gaugeFill.style.strokeDashoffset = offset;
                    }, 300);
                    gaugeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        gaugeObserver.observe(gaugeFill.closest('.gauge-container'));
    }

    // ── LOYALTY RING ANIMATION ──  
    const loyaltyProgress = document.querySelector('.loyalty-progress');
    if (loyaltyProgress) {
        const loyaltyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const circumference = 2 * Math.PI * 60; // ~377
                    const percentage = 2480 / 3000; // Points / Max
                    const offset = circumference * (1 - percentage);
                    setTimeout(() => {
                        loyaltyProgress.style.strokeDashoffset = offset;
                    }, 400);
                    loyaltyObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        loyaltyObserver.observe(loyaltyProgress.closest('.loyalty-ring-wrap'));
    }

    // ── CHART TABS TOGGLE ──
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });



    // ── GREETING BASED ON TIME ──
    const greetEl = document.querySelector('.welcome-greeting');
    if (greetEl) {
        const hour = new Date().getHours();
        if (hour < 12) greetEl.textContent = 'Good morning,';
        else if (hour < 17) greetEl.textContent = 'Good afternoon,';
        else greetEl.textContent = 'Good evening,';
    }

    // ── SCROLL REVEAL FOR CARDS ──
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.db-card, .table-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(card);
    });

    // ── TABLE SEARCH FILTER ──
    const tableSearchInput = document.querySelector('.table-search input');
    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.db-table tbody tr').forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // ── NOTIFICATION BADGE PULSE ──
    const notifDot = document.querySelector('.notif-dot');
    if (notifDot) {
        setInterval(() => {
            notifDot.style.transform = 'scale(1.4)';
            setTimeout(() => { notifDot.style.transform = 'scale(1)'; }, 300);
        }, 3000);
        notifDot.style.transition = 'transform 0.3s ease';
    }

    // ── SIDEBAR PAGE NAVIGATION ──
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-page]');
    const dbPages = document.querySelectorAll('.db-page[data-page]');

    function switchPage(pageName) {
        // Deactivate all pages
        dbPages.forEach(p => { p.classList.remove('active'); });
        // Deactivate all sidebar links
        sidebarLinks.forEach(l => l.classList.remove('active'));

        // Activate target page
        const targetPage = document.querySelector(`.db-page[data-page="${pageName}"]`);
        if (targetPage) targetPage.classList.add('active');

        // Activate sidebar link
        const targetLink = document.querySelector(`.sidebar-link[data-page="${pageName}"]`);
        if (targetLink) targetLink.classList.add('active');

        // Close sidebar on mobile
        if (window.innerWidth <= 1024 && sidebar) {
            sidebar.classList.remove('open');
        }

        // Scroll to top of main content
        const mainEl = document.querySelector('.db-main');
        if (mainEl) mainEl.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Re-initialize Lucide
        if (typeof lucide !== 'undefined') setTimeout(() => lucide.createIcons(), 50);

        // Re-run counters for fresh page
        document.querySelectorAll('.db-page.active [data-count]').forEach(el => {
            delete el.dataset.animated;
        });
        animateCounters();

        // Reveal cards on new page
        document.querySelectorAll('.db-page.active .db-card, .db-page.active .table-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            revealObserver.observe(card);
        });

        // Draw analytics chart if switching to analytics
        if (pageName === 'analytics') {
            drawAnalyticsChart();
        }
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) switchPage(page);
        });
    });

    // ── ANALYTICS COST TREND CHART ──
    function drawAnalyticsChart() {
        const aCanvas = document.getElementById('analyticsCanvas');
        if (!aCanvas) return;
        const actx = aCanvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = aCanvas.parentElement.getBoundingClientRect();
        aCanvas.width = rect.width * dpr;
        aCanvas.height = rect.height * dpr;
        aCanvas.style.width = rect.width + 'px';
        aCanvas.style.height = rect.height + 'px';
        actx.scale(dpr, dpr);

        const w = rect.width, h = rect.height;
        const padL = 55, padR = 20, padT = 20, padB = 40;
        const chartW = w - padL - padR;
        const chartH = h - padT - padB;

        actx.clearRect(0, 0, w, h);

        const months = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb'];
        const totalCost = [1200,980,1540,1100,1680,1420,890,1250];
        const maxVal = 2000;

        // Grid
        actx.strokeStyle = 'rgba(255,255,255,0.04)';
        actx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padT + (chartH / 4) * i;
            actx.beginPath();
            actx.moveTo(padL, y);
            actx.lineTo(w - padR, y);
            actx.stroke();
            actx.fillStyle = 'rgba(255,255,255,0.3)';
            actx.font = "11px 'Bookman Old Style', serif";
            actx.textAlign = 'right';
            actx.fillText('$' + (maxVal - (maxVal/4)*i), padL - 8, y + 4);
        }

        // X labels
        actx.textAlign = 'center';
        actx.fillStyle = 'rgba(255,255,255,0.4)';
        actx.font = "12px 'Bookman Old Style', serif";
        months.forEach((m, i) => {
            const x = padL + (chartW / (months.length - 1)) * i;
            actx.fillText(m, x, h - 8);
        });

        // Area + Line
        const points = totalCost.map((val, i) => ({
            x: padL + (chartW / (totalCost.length - 1)) * i,
            y: padT + chartH - (val / maxVal) * chartH
        }));

        // Fill
        const grad = actx.createLinearGradient(0, padT, 0, padT + chartH);
        grad.addColorStop(0, 'rgba(217,4,41,0.25)');
        grad.addColorStop(1, 'rgba(217,4,41,0)');
        actx.beginPath();
        actx.moveTo(points[0].x, padT + chartH);
        actx.lineTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i+1].x) / 2;
            const yc = (points[i].y + points[i+1].y) / 2;
            actx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        actx.lineTo(points[points.length-1].x, points[points.length-1].y);
        actx.lineTo(points[points.length-1].x, padT + chartH);
        actx.closePath();
        actx.fillStyle = grad;
        actx.fill();

        // Line
        actx.beginPath();
        actx.strokeStyle = '#D90429';
        actx.lineWidth = 2.5;
        actx.lineJoin = 'round';
        actx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i+1].x) / 2;
            const yc = (points[i].y + points[i+1].y) / 2;
            actx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        actx.lineTo(points[points.length-1].x, points[points.length-1].y);
        actx.stroke();

        // Dots
        points.forEach(p => {
            actx.beginPath();
            actx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            actx.fillStyle = '#D90429';
            actx.fill();
            actx.beginPath();
            actx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            actx.fillStyle = '#151a22';
            actx.fill();
        });
    }

    // ── HOVER TILT EFFECT ON METRIC CARDS ──
    document.querySelectorAll('.metric-card, .qa-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;
            card.style.transform = `translateY(-3px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) perspective(600px) rotateX(0) rotateY(0)';
        });
    });

});
