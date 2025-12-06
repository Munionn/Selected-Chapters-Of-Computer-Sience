/**
 * Slider Class - Full implementation with all requirements
 * 
 * Features:
 * - Кнопки далее и назад
 * - Подпись текста к каждому слайду
 * - Вывод номера и максимального количества (1/3, 2/3, 3/3)
 * - Пагинация (при клике - переключается на нужный слайд)
 * - loop - возможность листать слайдер по кругу
 * - navs - Вывод стрелочек или их отключение
 * - pags - вывод пагинации или отключение
 * - auto - слайдер сам переключается
 * - stopMouseHover - пауза при наведении мыши
 * - delay - время в секундах на показ слайда
 */
class Slider {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Slider container with id "${containerId}" not found`);
            return;
        }

        // Default options
        this.options = {
            loop: options.loop !== undefined ? options.loop : true,
            navs: options.navs !== undefined ? options.navs : true,
            pags: options.pags !== undefined ? options.pags : true,
            auto: options.auto !== undefined ? options.auto : true,
            stopMouseHover: options.stopMouseHover !== undefined ? options.stopMouseHover : true,
            delay: options.delay !== undefined ? options.delay : 5, // seconds
            ...options
        };

        // Get slides
        this.slides = this.container.querySelectorAll('.carousel-slide');
        this.totalSlides = this.slides.length;
        this.currentIndex = 0;

        // Get navigation elements
        this.prevBtn = this.container.querySelector('.carousel-btn.prev-btn');
        this.nextBtn = this.container.querySelector('.carousel-btn.next-btn');
        this.dots = this.container.querySelectorAll('.carousel-dots .dot');
        this.counter = this.container.querySelector('.carousel-counter');

        // Auto-play interval
        this.interval = null;

        // Initialize slider
        this.init();
    }

    init() {
        if (this.totalSlides === 0) {
            console.error('No slides found in slider container');
            return;
        }

        // Show first slide
        this.showSlide(0);

        // Setup navigation buttons
        if (this.options.navs) {
            this.setupNavigation();
        } else {
            this.hideNavigation();
        }

        // Setup pagination
        if (this.options.pags) {
            this.setupPagination();
        } else {
            this.hidePagination();
        }

        // Setup counter
        this.setupCounter();

        // Setup auto-play
        if (this.options.auto) {
            this.startAutoPlay();
        }

        // Setup mouse hover pause
        if (this.options.stopMouseHover && this.options.auto) {
            this.setupMouseHover();
        }
    }

    setupNavigation() {
        if (this.prevBtn) {
            this.prevBtn.style.display = 'block';
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.prev();
            });
        }
        if (this.nextBtn) {
            this.nextBtn.style.display = 'block';
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.next();
            });
        }
    }

    hideNavigation() {
        if (this.prevBtn) this.prevBtn.style.display = 'none';
        if (this.nextBtn) this.nextBtn.style.display = 'none';
    }

    setupPagination() {
        if (this.dots.length === 0) return;

        this.dots.forEach((dot, index) => {
            dot.style.display = 'inline-block';
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.goToSlide(index);
            });
        });
    }

    hidePagination() {
        const dotsContainer = this.container.querySelector('.carousel-dots');
        if (dotsContainer) {
            dotsContainer.style.display = 'none';
        }
    }

    setupCounter() {
        // Create counter if it doesn't exist
        if (!this.counter) {
            const counterEl = document.createElement('div');
            counterEl.className = 'carousel-counter';
            counterEl.style.cssText = 'position: absolute; bottom: 20px; right: 20px; background: rgba(0,0,0,0.6); color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; z-index: 10;';
            this.container.style.position = 'relative';
            this.container.appendChild(counterEl);
            this.counter = counterEl;
        }
        this.updateCounter();
    }

    updateCounter() {
        if (this.counter) {
            this.counter.textContent = `${this.currentIndex + 1}/${this.totalSlides}`;
        }
    }

    setupMouseHover() {
        this.container.addEventListener('mouseenter', () => {
            this.stopAutoPlay();
        });

        this.container.addEventListener('mouseleave', () => {
            if (this.options.auto) {
                this.startAutoPlay();
            }
        });
    }

    showSlide(index) {
        // Remove active class from all slides
        this.slides.forEach(slide => slide.classList.remove('active'));

        // Add active class to current slide
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
        }

        // Update dots
        this.dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update counter
        this.updateCounter();
    }

    next() {
        if (this.options.loop) {
            this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        } else {
            if (this.currentIndex < this.totalSlides - 1) {
                this.currentIndex++;
            }
        }
        this.showSlide(this.currentIndex);
    }

    prev() {
        if (this.options.loop) {
            this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        } else {
            if (this.currentIndex > 0) {
                this.currentIndex--;
            }
        }
        this.showSlide(this.currentIndex);
    }

    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.currentIndex = index;
            this.showSlide(this.currentIndex);
        }
    }

    startAutoPlay() {
        this.stopAutoPlay(); // Clear any existing interval
        const delayMs = this.options.delay * 1000; // Convert seconds to milliseconds
        this.interval = setInterval(() => {
            this.next();
        }, delayMs);
    }

    stopAutoPlay() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    // Method to update options (for admin settings)
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        
        // Restart auto-play if needed
        if (this.options.auto) {
            this.startAutoPlay();
        } else {
            this.stopAutoPlay();
        }

        // Update navigation visibility
        if (this.options.navs) {
            this.setupNavigation();
        } else {
            this.hideNavigation();
        }

        // Update pagination visibility
        if (this.options.pags) {
            this.setupPagination();
        } else {
            this.hidePagination();
        }
    }

    // Method to get current settings (for admin form)
    getSettings() {
        return {
            loop: this.options.loop,
            navs: this.options.navs,
            pags: this.options.pags,
            auto: this.options.auto,
            stopMouseHover: this.options.stopMouseHover,
            delay: this.options.delay
        };
    }
}

// Initialize slider when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get slider settings from data attributes or localStorage
    const sliderContainer = document.getElementById('bannerCarousel');
    if (sliderContainer) {
        // Try to get settings from localStorage (set by admin)
        let sliderSettings = {
            loop: sliderContainer.dataset.loop !== undefined ? sliderContainer.dataset.loop === 'true' : true,
            navs: sliderContainer.dataset.navs !== undefined ? sliderContainer.dataset.navs === 'true' : true,
            pags: sliderContainer.dataset.pags !== undefined ? sliderContainer.dataset.pags === 'true' : true,
            auto: sliderContainer.dataset.auto !== undefined ? sliderContainer.dataset.auto === 'true' : true,
            stopMouseHover: sliderContainer.dataset.stopMouseHover !== undefined ? sliderContainer.dataset.stopMouseHover === 'true' : true,
            delay: sliderContainer.dataset.delay ? parseFloat(sliderContainer.dataset.delay) : 5
        };

        // Try to load from localStorage (admin settings)
        try {
            const savedSettings = localStorage.getItem('sliderSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                sliderSettings = { ...sliderSettings, ...parsed };
            }
        } catch (e) {
            console.warn('Could not load slider settings from localStorage:', e);
        }

        // Initialize slider
        window.slider = new Slider('bannerCarousel', sliderSettings);
    }
});

