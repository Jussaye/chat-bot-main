// Theme Manager: Instant Light / Dark Mode Switcher
(function () {
    const THEME_KEY = 'chatbot_theme';

    function getSavedTheme() {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === 'dark' || saved === 'light') return saved;
        } catch (e) {}
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    function applyTheme(theme) {
        const isDark = (theme === 'dark');
        
        // 1. Set HTML and Body attributes & classes
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.classList.add('dark-theme');
            document.documentElement.classList.remove('light-theme');
            if (document.body) {
                document.body.setAttribute('data-theme', 'dark');
                document.body.classList.add('dark-theme', 'dark-mode');
                document.body.classList.remove('light-theme', 'light-mode');
                document.body.style.backgroundColor = '#0b1120';
                document.body.style.color = '#f8fafc';
            }
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark-theme');
            if (document.body) {
                document.body.setAttribute('data-theme', 'light');
                document.body.classList.add('light-theme', 'light-mode');
                document.body.classList.remove('dark-theme', 'dark-mode');
                document.body.style.backgroundColor = '#f0f2f5';
                document.body.style.color = '#0f172a';
            }
        }

        // 2. Update active states on all theme buttons on the page
        document.querySelectorAll('.theme-btn-light').forEach(function (btn) {
            if (!isDark) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        document.querySelectorAll('.theme-btn-dark').forEach(function (btn) {
            if (isDark) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function setTheme(theme) {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            console.warn('localStorage error:', e);
        }
        applyTheme(theme);
    }

    // Expose globally so onclick="setTheme('light')" or onclick="setTheme('dark')" works immediately
    window.setTheme = setTheme;
    window.applyTheme = applyTheme;

    // Apply immediately to prevent FOUC
    applyTheme(getSavedTheme());

    // Re-apply when DOM is ready to bind to any elements rendered later
    document.addEventListener('DOMContentLoaded', function () {
        applyTheme(getSavedTheme());
    });
})();
