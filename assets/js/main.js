// Language Toggle System
function getCurrentLang() {
    return localStorage.getItem('lang') || 'fr';
}

function setLang(lang) {
    localStorage.setItem('lang', lang);
    applyTranslations(lang);
    // Update toggle buttons
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === lang);
    });
    // Update html lang attribute
    document.documentElement.lang = lang;
    // Re-render calendar if it exists
    if (window.bookingCalendar && window.bookingCalendar.grid) {
        window.bookingCalendar.render();
        window.bookingCalendar.updateSlotsTitle();
    }
}

function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                // skip, handled by data-i18n-placeholder
            } else if (key.includes('.title') && t[key].includes('<br>')) {
                el.innerHTML = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });
    // innerHTML for elements with BR tags
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (t[key] !== undefined) {
            el.innerHTML = t[key];
        }
    });
    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key] !== undefined) {
            el.placeholder = t[key];
        }
    });
}

function initLangToggle() {
    const lang = getCurrentLang();
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === lang);
        opt.addEventListener('click', () => {
            setLang(opt.dataset.lang);
        });
    });
    // Apply saved language on load
    if (lang !== 'fr') {
        applyTranslations(lang);
    }
    document.documentElement.lang = lang;
}

// Header scroll effect
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.nav');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Hero Slider Animation
class HeroSlider {
    constructor() {
        this.currentIndex = 0;
        this.totalSlides = 8;
        this.autoPlayInterval = 1300; // 1.3 seconds
        this.isAnimating = false;

        this.backgrounds = document.querySelectorAll('.hero-background');
        this.titles = document.querySelectorAll('.hero-title-bg');
        this.labels = document.querySelectorAll('.destination-label');
        this.circleImages = document.querySelectorAll('.circle-image-container');
        this.indicators = document.querySelectorAll('.indicator');

        this.init();
    }

    init() {
        // Set up indicator click events
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (!this.isAnimating && index !== this.currentIndex) {
                    this.goToSlide(index);
                }
            });
        });

        // Start autoplay
        this.startAutoPlay();
    }

    goToSlide(index) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // Remove active class from current elements
        this.backgrounds[this.currentIndex].classList.remove('active');
        this.titles[this.currentIndex].classList.remove('active');
        this.labels[this.currentIndex].classList.remove('active');
        this.circleImages[this.currentIndex].classList.remove('active');
        this.indicators[this.currentIndex].classList.remove('active');

        // Update current index
        this.currentIndex = index;

        // Add active class to new elements
        this.backgrounds[this.currentIndex].classList.add('active');
        this.titles[this.currentIndex].classList.add('active');
        this.labels[this.currentIndex].classList.add('active');
        this.circleImages[this.currentIndex].classList.add('active');
        this.indicators[this.currentIndex].classList.add('active');

        // Reset animation lock after transition
        setTimeout(() => {
            this.isAnimating = false;
        }, 300);
    }

    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.totalSlides;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevIndex);
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayTimer = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayInterval);
    }

    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
        }
    }
}

// Booking Calendar
class BookingCalendar {
    constructor() {
        this.grid = document.querySelector('.book-calendar-grid');
        this.monthLabel = document.querySelector('.book-calendar-month');
        this.slotsTitle = document.querySelector('.book-slots-title');
        if (!this.grid) return;

        this.today = new Date();
        this.currentMonth = this.today.getMonth();
        this.currentYear = this.today.getFullYear();
        this.selectedDate = new Date(this.today);

        document.querySelector('.book-cal-prev').addEventListener('click', () => this.changeMonth(-1));
        document.querySelector('.book-cal-next').addEventListener('click', () => this.changeMonth(1));

        // Time slot selection
        document.querySelectorAll('.book-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.book-slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
            });
        });

        this.render();
        this.updateSlotsTitle();
    }

    changeMonth(delta) {
        this.currentMonth += delta;
        if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
        if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
        this.render();
    }

    updateSlotsTitle() {
        const lang = getCurrentLang();
        const t = translations[lang];
        const months = t['cal.months.short'];
        const prefix = t['cal.slots.prefix'];
        if (lang === 'fr') {
            this.slotsTitle.textContent = prefix + this.selectedDate.getDate() + ' ' + months[this.selectedDate.getMonth()];
        } else {
            this.slotsTitle.textContent = prefix + months[this.selectedDate.getMonth()] + ' ' + this.selectedDate.getDate();
        }
    }

    render() {
        const lang = getCurrentLang();
        const t = translations[lang];
        const months = t['cal.months.long'];
        const days = t['cal.days'];
        this.monthLabel.textContent = months[this.currentMonth] + ' ' + this.currentYear;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const daysInPrev = new Date(this.currentYear, this.currentMonth, 0).getDate();

        let html = '';
        days.forEach(d => {
            html += '<div class="day-header">' + d + '</div>';
        });

        // Previous month filler days
        for (let i = firstDay - 1; i >= 0; i--) {
            html += '<div class="day-cell other-month">' + (daysInPrev - i) + '</div>';
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = d === this.today.getDate() && this.currentMonth === this.today.getMonth() && this.currentYear === this.today.getFullYear();
            const isSelected = d === this.selectedDate.getDate() && this.currentMonth === this.selectedDate.getMonth() && this.currentYear === this.selectedDate.getFullYear();
            let cls = 'day-cell';
            if (isSelected) cls += ' selected';
            else if (isToday) cls += ' today';
            html += '<div class="' + cls + '" data-day="' + d + '">' + d + '</div>';
        }

        // Next month filler days
        const totalCells = firstDay + daysInMonth;
        const remaining = (7 - (totalCells % 7)) % 7;
        for (let i = 1; i <= remaining; i++) {
            html += '<div class="day-cell other-month">' + i + '</div>';
        }

        this.grid.innerHTML = html;

        // Click handlers for day cells
        this.grid.querySelectorAll('.day-cell:not(.other-month)').forEach(cell => {
            cell.addEventListener('click', () => {
                this.grid.querySelectorAll('.day-cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                this.selectedDate = new Date(this.currentYear, this.currentMonth, parseInt(cell.dataset.day));
                this.updateSlotsTitle();
            });
        });
    }
}

// FAQ Accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Close all items
            faqItems.forEach(i => i.classList.remove('active'));
            // Open clicked item if it wasn't already open
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HeroSlider();
    window.bookingCalendar = new BookingCalendar();
    initFAQ();
    initLangToggle();

    // Initialize GSAP ScrollTrigger for card stacking animation
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Card stacking animation
        const cards = gsap.utils.toArray(".step-card");

        if (cards.length > 0) {
            const lastCardIndex = cards.length - 1;

            // Create ScrollTrigger for the last card
            const lastCardST = ScrollTrigger.create({
                trigger: cards[cards.length - 1],
                start: "center center"
            });

            // Iterate over each card
            cards.forEach((card, index) => {
                const scale = index === lastCardIndex ? 1 : 0.9;
                const scaleDown = gsap.to(card, {
                    scale: scale
                });

                ScrollTrigger.create({
                    trigger: card,
                    start: "top top",
                    end: () => lastCardST.start,
                    pin: true,
                    pinSpacing: false,
                    scrub: 0.5,
                    ease: "none",
                    animation: scaleDown,
                    toggleActions: "restart none none reverse"
                });
            });
        }

        // Highlight process steps and align circles with their cards
        const processSteps = document.querySelectorAll('.process-step');
        if (cards.length > 0 && processSteps.length > 0) {
            const stepsEl = document.querySelector('.process-steps');
            const sidebarPadding = 80;

            // Pre-compute each circle's center Y relative to .process-steps
            const circleOffsets = [];
            processSteps.forEach((step) => {
                const circle = step.querySelector('.step-circle');
                circleOffsets.push(step.offsetTop + circle.offsetHeight / 2);
            });

            processSteps[0].classList.add('active');

            function alignCircle(index) {
                // Card is pinned at top, 60vh tall, center at 30vh
                var targetY = window.innerHeight * 0.3;
                var circleY = sidebarPadding + circleOffsets[index];
                gsap.to(stepsEl, {
                    y: targetY - circleY,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            }

            cards.forEach((card, index) => {
                if (processSteps[index]) {
                    ScrollTrigger.create({
                        trigger: card,
                        start: 'top 60%',
                        end: 'bottom 40%',
                        onEnter: () => {
                            processSteps.forEach(s => s.classList.remove('active'));
                            processSteps[index].classList.add('active');
                            alignCircle(index);
                        },
                        onEnterBack: () => {
                            processSteps.forEach(s => s.classList.remove('active'));
                            processSteps[index].classList.add('active');
                            alignCircle(index);
                        }
                    });
                }
            });
        }
    }
});
