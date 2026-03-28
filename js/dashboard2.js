/* ═══════════════════════════════════════════════════════════
   VELOCITY MOTORSPORTS — DASHBOARD 2 (ADMIN) JS
   Page Switching, Charts, Counters, Interactivity
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

        // Init
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
    }

    // ── SIDEBAR TOGGLE ──
    const sidebar = document.getElementById('adminSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.toggle('open');
            } else {
                sidebar.classList.toggle('collapsed');
            }
        });
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
        document.querySelectorAll('.admin-page.active [data-count]').forEach(el => {
            if (el.dataset.animated) return;
            const target = parseInt(el.dataset.count);
            if (isNaN(target)) return;
            el.dataset.animated = 'true';
            const duration = 1600;
            const startTime = performance.now();

            function update(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(target * eased);
                el.textContent = current.toLocaleString();
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        });
    }

    // Observe counter sections
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) animateCounters();
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.stats-ribbon').forEach(s => counterObserver.observe(s));

    // ── SCROLL REVEAL FOR CARDS ──
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    function initRevealCards() {
        document.querySelectorAll('.admin-page.active .admin-card, .admin-page.active .stat-card, .admin-page.active .service-admin-card, .admin-page.active .staff-card, .admin-page.active .report-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(16px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            revealObserver.observe(card);
        });
    }
    initRevealCards();

    // ── PAGE SWITCHING ──
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-page]');
    const adminPages = document.querySelectorAll('.admin-page[data-page]');
    const breadcrumb = document.getElementById('breadcrumbCurrent');

    const pageNames = {
        'overview': 'Overview',
        'customers': 'Customers',
        'bookings': 'Bookings',
        'services': 'Services',
        'staff': 'Staff',
        'inventory': 'Inventory',
        'finance': 'Finance',
        'reports': 'Reports',
        'admin-settings': 'Settings'
    };

    function switchPage(pageName) {
        adminPages.forEach(p => p.classList.remove('active'));
        sidebarLinks.forEach(l => l.classList.remove('active'));

        const targetPage = document.querySelector(`.admin-page[data-page="${pageName}"]`);
        if (targetPage) targetPage.classList.add('active');

        const targetLink = document.querySelector(`.sidebar-link[data-page="${pageName}"]`);
        if (targetLink) targetLink.classList.add('active');

        if (breadcrumb && pageNames[pageName]) {
            breadcrumb.textContent = pageNames[pageName];
        }

        if (window.innerWidth <= 1024 && sidebar) sidebar.classList.remove('open');

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Re-init
        if (typeof lucide !== 'undefined') setTimeout(() => lucide.createIcons(), 50);

        // Reset counters for fresh animation
        document.querySelectorAll('.admin-page.active [data-count]').forEach(el => {
            delete el.dataset.animated;
        });
        setTimeout(animateCounters, 100);

        // Reveal cards
        setTimeout(initRevealCards, 50);

        // Draw charts if needed
        if (pageName === 'overview') setTimeout(drawRevenueChart, 100);
        if (pageName === 'finance') setTimeout(drawFinanceChart, 100);

        // Animate satisfaction gauge
        if (pageName === 'overview') setTimeout(animateSatGauge, 300);
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) switchPage(page);
        });
    });

    // ── REVENUE CHART ──
    function drawRevenueChart() {
        const canvas = document.getElementById('revenueCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);

        const w = rect.width, h = rect.height;
        const padL = 60, padR = 20, padT = 20, padB = 40;
        const chartW = w - padL - padR;
        const chartH = h - padT - padB;

        ctx.clearRect(0, 0, w, h);

        const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
        const revenue = [22400, 28600, 24800, 31200, 26800, 30100];
        const expenses = [14200, 16800, 15400, 19600, 17200, 18400];
        const maxVal = 35000;

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.035)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padT + (chartH / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(w - padR, y);
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.font = "10px 'Bookman Old Style', serif";
            ctx.textAlign = 'right';
            ctx.fillText('$' + ((maxVal - (maxVal / 5) * i) / 1000).toFixed(0) + 'K', padL - 8, y + 4);
        }

        // X labels
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = "11px 'Bookman Old Style', serif";
        months.forEach((m, i) => {
            const x = padL + (chartW / (months.length - 1)) * i;
            ctx.fillText(m, x, h - 10);
        });

        function drawAreaLine(data, color, alpha) {
            const points = data.map((val, i) => ({
                x: padL + (chartW / (data.length - 1)) * i,
                y: padT + chartH - (val / maxVal) * chartH
            }));

            // Area fill
            const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
            grad.addColorStop(0, color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
            grad.addColorStop(1, color + '00');
            ctx.beginPath();
            ctx.moveTo(points[0].x, padT + chartH);
            ctx.lineTo(points[0].x, points[0].y);
            for (let i = 0; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
            ctx.lineTo(points[points.length - 1].x, padT + chartH);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();

            // Line
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 0; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
            ctx.stroke();

            // Dots
            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#0a0d12';
                ctx.fill();
            });
        }

        drawAreaLine(expenses, '#00b4d8', 0.12);
        drawAreaLine(revenue, '#D90429', 0.18);
    }

    drawRevenueChart();
    window.addEventListener('resize', () => {
        const activePage = document.querySelector('.admin-page.active');
        if (activePage) {
            const pg = activePage.dataset.page;
            if (pg === 'overview') drawRevenueChart();
            if (pg === 'finance') drawFinanceChart();
        }
    });

    // ── FINANCE CHART ──
    function drawFinanceChart() {
        const canvas = document.getElementById('financeCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);

        const w = rect.width, h = rect.height;
        const padL = 60, padR = 20, padT = 20, padB = 40;
        const chartW = w - padL - padR;
        const chartH = h - padT - padB;

        ctx.clearRect(0, 0, w, h);

        const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
        const rev = [28600, 31200, 24800, 35200, 29800, 34100];
        const exp = [16800, 19600, 15400, 22400, 18200, 20400];
        const profit = rev.map((r, i) => r - exp[i]);
        const maxVal = 40000;

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.035)';
        for (let i = 0; i <= 4; i++) {
            const y = padT + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(w - padR, y);
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.font = "10px 'Bookman Old Style', serif";
            ctx.textAlign = 'right';
            ctx.fillText('$' + ((maxVal - (maxVal / 4) * i) / 1000).toFixed(0) + 'K', padL - 8, y + 4);
        }

        // X labels
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        months.forEach((m, i) => {
            const x = padL + (chartW / (months.length - 1)) * i;
            ctx.fillText(m, x, h - 10);
        });

        // Bar chart style — grouped bars
        const barGroupW = chartW / months.length;
        const barW = barGroupW * 0.25;

        months.forEach((_, i) => {
            const cx = padL + barGroupW * i + barGroupW / 2;

            // Revenue bar
            const rH = (rev[i] / maxVal) * chartH;
            const ry = padT + chartH - rH;
            ctx.fillStyle = 'rgba(217,4,41,0.7)';
            roundRect(ctx, cx - barW - 2, ry, barW, rH, 3);

            // Expense bar
            const eH = (exp[i] / maxVal) * chartH;
            const ey = padT + chartH - eH;
            ctx.fillStyle = 'rgba(0,180,216,0.6)';
            roundRect(ctx, cx + 2, ey, barW, eH, 3);
        });

        // Profit line
        const profitPts = profit.map((val, i) => ({
            x: padL + barGroupW * i + barGroupW / 2,
            y: padT + chartH - (val / maxVal) * chartH
        }));

        ctx.beginPath();
        ctx.strokeStyle = '#06d6a0';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.moveTo(profitPts[0].x, profitPts[0].y);
        for (let i = 1; i < profitPts.length; i++) {
            ctx.lineTo(profitPts[i].x, profitPts[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        profitPts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#06d6a0';
            ctx.fill();
        });
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    }

    // ── SATISFACTION GAUGE ANIMATION ──
    function animateSatGauge() {
        const satFill = document.querySelector('.sat-fill');
        if (!satFill) return;
        const total = 157;
        const score = 4.9 / 5.0;
        const offset = total * (1 - score);
        setTimeout(() => {
            satFill.style.transition = 'stroke-dashoffset 1.5s ease';
            satFill.style.strokeDashoffset = offset;
        }, 200);
    }
    animateSatGauge();

    // ── PERIOD TAB TOGGLE ──
    document.querySelectorAll('.chart-period-tabs').forEach(group => {
        group.querySelectorAll('.period-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                group.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    });

    // ── FILTER CHIPS TOGGLE ──
    document.querySelectorAll('.filter-chips').forEach(group => {
        group.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                group.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });
    });

    // ── CUSTOMER SEARCH ──
    const customerSearch = document.getElementById('customerSearch');
    if (customerSearch) {
        customerSearch.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('#customerTable tbody tr').forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }

    // ── SETTINGS NAV TABS ──
    document.querySelectorAll('.settings-nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.settings-nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // ── STAT CARD HOVER TILT ──
    document.querySelectorAll('.stat-card, .quick-btn').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rx = ((y - cy) / cy) * -2;
            const ry = ((x - cx) / cx) * 2;
            card.style.transform = `translateY(-2px) perspective(500px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ── NOTIFICATION PULSE ──
    const notifCount = document.querySelector('.notif-count');
    if (notifCount) {
        setInterval(() => {
            notifCount.style.transform = 'scale(1.3)';
            setTimeout(() => { notifCount.style.transform = 'scale(1)'; }, 300);
        }, 4000);
        notifCount.style.transition = 'transform 0.3s ease';
    }

});
