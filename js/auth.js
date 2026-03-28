/* ===== Auth JS - Velocity Motorsports ===== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize language support
    initializeLanguageToggle();

    // Initialize theme support
    initializeTheme();

    // Initialize particles
    createParticles();

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Password toggle handlers
    setupPasswordToggle('togglePassword', 'password', 'eyeIcon');
    setupPasswordToggle('toggleRegPassword', 'regPassword', 'eyeIconReg');
    setupPasswordToggle('toggleConfirmPassword', 'confirmPassword', 'eyeIconConfirm');

    // Password strength meter
    const regPassword = document.getElementById('regPassword');
    if (regPassword) {
        regPassword.addEventListener('input', checkPasswordStrength);
    }

    // Input focus animations
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('focus', () => {
            input.closest('.form-group')?.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.closest('.form-group')?.classList.remove('focused');
            }
        });
    });

    // Handle brand click to redirect to home (logo, title, and accent)
    const brandLogo = document.querySelector('.logo');
    const brandTitle = document.querySelector('.brand-title');
    const brandAccent = document.querySelector('.brand-accent');
    
    function redirectToHome() {
        window.location.href = 'index.html';
    }
    
    if (brandLogo) {
        brandLogo.addEventListener('click', redirectToHome);
    }
    if (brandTitle) {
        brandTitle.addEventListener('click', redirectToHome);
    }
    if (brandAccent) {
        brandAccent.addEventListener('click', redirectToHome);
    }
});

/* ===== Particle Background ===== */
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (4 + Math.random() * 4) + 's';
        particle.style.width = particle.style.height = (1 + Math.random() * 3) + 'px';

        // Random red shades
        const colors = ['#D90429', '#EF233C', '#ff4d6a', '#b80424'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        container.appendChild(particle);
    }
}

/* ===== Password Toggle ===== */
function setupPasswordToggle(toggleId, inputId, iconId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!toggle || !input) return;

    toggle.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';

        // Swap icon
        const iconEl = toggle.querySelector('svg');
        if (iconEl) {
            const newIcon = document.createElement('i');
            newIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
            iconEl.replaceWith(newIcon);
            lucide.createIcons();
        }
    });
}

/* ===== Password Strength ===== */
function checkPasswordStrength() {
    const password = this.value;
    const bars = document.querySelectorAll('.strength-bars .bar');
    const text = document.getElementById('strengthText');
    if (!bars.length || !text) return;

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) strength++;

    const levels = ['', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    const classes = ['', 'weak', 'medium', 'strong', 'very-strong'];

    bars.forEach((bar, i) => {
        bar.className = 'bar';
        if (i < strength) {
            bar.classList.add(classes[strength]);
        }
    });

    text.textContent = password ? levels[strength] || 'Weak' : '';
    text.style.color = strength <= 1 ? '#ef4444' : strength === 2 ? '#f59e0b' : '#22c55e';
}

/* ===== Login Handler ===== */
function handleLogin(e) {
    e.preventDefault();
    const btn = this.querySelector('.btn-login');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        shakeElement(btn);
        return;
    }

    // Loading animation
    btn.classList.add('loading');

    // Show success then redirect
    setTimeout(() => {
        btn.classList.remove('loading');
        showSuccessOverlay('Login Successful!', 'Redirecting to dashboard...', () => {
            window.location.href = 'dashboard1.html';
        });
    }, 1200);
}

/* ===== Register Handler ===== */
function handleRegister(e) {
    e.preventDefault();
    const btn = this.querySelector('.btn-login');
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms');

    // Check password match
    if (password !== confirm) {
        const confirmGroup = document.getElementById('confirmPassword').closest('.form-group');
        shakeElement(confirmGroup);
        showToast('Passwords do not match!', 'error');
        return;
    }

    if (!terms.checked) {
        showToast('Please accept the Terms of Service', 'error');
        return;
    }

    // Loading animation
    btn.classList.add('loading');

    setTimeout(() => {
        btn.classList.remove('loading');
        showSuccessOverlay('Account Created!', 'Redirecting to login...', () => {
            window.location.href = 'login.html';
        });
    }, 1200);
}

/* ===== Success Overlay ===== */
function showSuccessOverlay(title, subtitle, callback) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
        <div class="success-content">
            <div class="success-checkmark">
                <i data-lucide="check"></i>
            </div>
            <h3 class="success-text">${title}</h3>
            <p class="success-subtext">${subtitle}</p>
        </div>
    `;
    document.body.appendChild(overlay);
    lucide.createIcons();

    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    // Redirect after delay
    setTimeout(() => {
        if (callback) callback();
    }, 1800);
}

/* ===== Toast Notification ===== */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 0.85rem 1.5rem;
        background: ${type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(34, 197, 94, 0.95)'};
        color: #fff;
        border-radius: 8px;
        font-family: 'Inter', sans-serif;
        font-size: 0.85rem;
        font-weight: 500;
        z-index: 2000;
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

/* ===== Shake Animation ===== */
function shakeElement(el) {
    if (!el) return;
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = 'shake 0.5s ease';
    setTimeout(() => { el.style.animation = ''; }, 500);
}

// Add shake keyframes dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
    }
`;
document.head.appendChild(shakeStyle);

/* ===== Language Toggle (RTL/LTR) ===== */
function initializeLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    if (!langToggle) return;

    // Load saved language from localStorage, default to 'en'
    const savedLang = localStorage.getItem('authPageLanguage') || 'en';
    setLanguage(savedLang);

    // Toggle language on click
    langToggle.addEventListener('click', () => {
        const htmlEl = document.documentElement;
        const currentDir = htmlEl.getAttribute('dir');
        const newLang = currentDir === 'ltr' ? 'ar' : 'en';
        setLanguage(newLang);
    });
}

function setLanguage(lang) {
    const htmlEl = document.documentElement;
    const body = document.body;

    if (lang === 'ar') {
        htmlEl.setAttribute('lang', 'ar');
        htmlEl.setAttribute('dir', 'rtl');
        body.classList.add('rtl-mode');
        body.classList.remove('ltr-mode');
    } else {
        htmlEl.setAttribute('lang', 'en');
        htmlEl.setAttribute('dir', 'ltr');
        body.classList.add('ltr-mode');
        body.classList.remove('rtl-mode');
    }

    localStorage.setItem('authPageLanguage', lang);
}

/* ===== Theme Toggle (Light/Dark) ===== */
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('theme-light') ? 'light' : 'dark';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

function setTheme(theme) {
    const body = document.body;
    const themeBtn = document.getElementById('themeToggle');
    
    if (theme === 'light') {
        body.classList.add('theme-light');
        if (themeBtn) {
            themeBtn.innerHTML = '<i data-lucide="sun"></i>';
        }
    } else {
        body.classList.remove('theme-light');
        if (themeBtn) {
            themeBtn.innerHTML = '<i data-lucide="moon"></i>';
        }
    }
    
    localStorage.setItem('theme', theme);
    if (window.lucide) {
        lucide.createIcons();
    }
}
