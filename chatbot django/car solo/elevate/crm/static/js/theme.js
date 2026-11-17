// Theme Manager for Light / Dark Mode
(function () {
    const THEME_KEY = 'chatbot_theme';

    // Get current theme from localStorage or system preference
    function getPreferredTheme() {
        const storedTheme = localStorage.getItem(THEME_KEY);
        if (storedTheme === 'dark' || storedTheme === 'light') {
            return storedTheme;
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    // Apply theme to document
    function applyTheme(theme) {
        const isDark = (theme === 'dark');
        
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (document.body) {
                document.body.classList.add('dark-mode');
            }
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            if (document.body) {
                document.body.classList.remove('dark-mode');
            }
        }

        // Synchronize all theme checkboxes on the page
        document.querySelectorAll('.theme-slider-checkbox').forEach(function (checkbox) {
            checkbox.checked = isDark;
        });

        // Update active class on sun/moon icons
        document.querySelectorAll('.light-icon, .quick-icon-sun').forEach(function (el) {
            if (isDark) {
                el.classList.remove('active');
            } else {
                el.classList.add('active');
            }
        });

        document.querySelectorAll('.dark-icon, .quick-icon-moon').forEach(function (el) {
            if (isDark) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    // Public helper to switch theme
    window.setTheme = function (theme) {
        localStorage.setItem(THEME_KEY, theme);
        applyTheme(theme);
    };

    window.toggleTheme = function () {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        window.setTheme(next);
    };

    // Apply immediately to prevent FOUC (flash of unstyled content)
    applyTheme(getPreferredTheme());

    // Bind event listeners once DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        const currentTheme = getPreferredTheme();
        applyTheme(currentTheme);

        // Bind all theme checkboxes
        document.querySelectorAll('.theme-slider-checkbox').forEach(function (checkbox) {
            checkbox.checked = (currentTheme === 'dark');
            checkbox.addEventListener('change', function () {
                window.setTheme(this.checked ? 'dark' : 'light');
            });
        });

        // Clicking sun icon switches to light mode
        document.querySelectorAll('.light-icon, .quick-icon-sun').forEach(function (icon) {
            icon.style.cursor = 'pointer';
            icon.addEventListener('click', function () {
                window.setTheme('light');
            });
        });

        // Clicking moon icon switches to dark mode
        document.querySelectorAll('.dark-icon, .quick-icon-moon').forEach(function (icon) {
            icon.style.cursor = 'pointer';
            icon.addEventListener('click', function () {
                window.setTheme('dark');
            });
        });

        // Listen for OS theme preference changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
                if (!localStorage.getItem(THEME_KEY)) {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    });
})();
