/**
 * Theme Toggle Manager
 * Theme toggle manager for light/dark theme with localStorage persistence
 */

class ThemeManager {
    constructor() {
        this.themes = {
            light: 'light',
            dark: 'dark'
        };
        this.currentTheme = null;
        this.html = document.documentElement;
        this.themeIcon = null;
        this.themeToggle = null;
        
        this.init();
    }
    
    init() {
        const savedTheme = localStorage.getItem('theme') || this.themes.light;
        
        this.setTheme(savedTheme, false);
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupToggle());
        } else {
            this.setupToggle();
        }
    }
    
    setupToggle() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Theme toggle clicked, current theme:', this.getTheme());
                const newTheme = this.toggle();
                console.log('Theme changed to:', newTheme);
            });
            
            this.updateIcon();
            console.log('Theme toggle button initialized');
        } else {
            console.error('Theme toggle button not found! ID: themeToggle');
        }
        
        window.toggleTheme = () => this.toggle();
        window.setTheme = (theme) => this.setTheme(theme);
        window.getTheme = () => this.getTheme();
        
        console.log('ThemeManager initialized. Current theme:', this.getTheme());
    }
    
    getTheme() {
        const theme = this.html.getAttribute('data-theme') || this.themes.light;
        return theme;
    }
    
    setTheme(theme, updateIcon = true) {
        if (!Object.values(this.themes).includes(theme)) {
            console.warn(`Invalid theme: ${theme}. Using light theme.`);
            theme = this.themes.light;
        }
        
        this.currentTheme = theme;
        
        // Устанавливаем атрибут на html элемент
        this.html.setAttribute('data-theme', theme);
        
        // Также устанавливаем на body для дополнительной надежности
        if (document.body) {
            document.body.setAttribute('data-theme', theme);
        }
        
        localStorage.setItem('theme', theme);
        
        // Принудительно применяем стили
        if (theme === 'dark') {
            document.documentElement.style.backgroundColor = '#000000';
            if (document.body) {
                document.body.style.backgroundColor = '#000000';
            }
        } else {
            document.documentElement.style.backgroundColor = '';
            if (document.body) {
                document.body.style.backgroundColor = '';
            }
        }
        
        if (updateIcon) {
            this.updateIcon();
        }
        
        const event = new CustomEvent('themeChanged', { 
            detail: { theme: theme } 
        });
        document.dispatchEvent(event);
        
        console.log(`Theme set to: ${theme}`);
        console.log(`HTML data-theme: ${this.html.getAttribute('data-theme')}`);
        console.log(`Body background: ${document.body ? window.getComputedStyle(document.body).backgroundColor : 'N/A'}`);
        
        return theme;
    }
    
    toggle() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === this.themes.dark 
            ? this.themes.light 
            : this.themes.dark;
        
        console.log(`Toggling from ${currentTheme} to ${newTheme}`);
        return this.setTheme(newTheme);
    }
    
    updateIcon() {
        if (!this.themeIcon) {
            this.themeIcon = document.getElementById('themeIcon');
        }
        
        if (this.themeIcon) {
            const currentTheme = this.getTheme();
            if (currentTheme === this.themes.dark) {
                this.themeIcon.className = 'fas fa-moon';
                this.themeIcon.setAttribute('title', 'Переключить на светлую тему');
            } else {
                this.themeIcon.className = 'fas fa-sun';
                this.themeIcon.setAttribute('title', 'Переключить на темную тему');
            }
            console.log('Icon updated for theme:', currentTheme);
        } else {
            console.warn('Theme icon not found!');
        }
    }
    
    switchToDark() {
        return this.setTheme(this.themes.dark);
    }
    
    switchToLight() {
        return this.setTheme(this.themes.light);
    }
}

const themeManager = new ThemeManager();

window.themeManager = themeManager;
