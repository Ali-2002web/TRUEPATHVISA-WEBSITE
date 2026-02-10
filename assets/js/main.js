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
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        this.slotsTitle.textContent = 'Available Slots for ' + months[this.selectedDate.getMonth()] + ' ' + this.selectedDate.getDate();
    }

    render() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.monthLabel.textContent = months[this.currentMonth] + ' ' + this.currentYear;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const daysInPrev = new Date(this.currentYear, this.currentMonth, 0).getDate();

        let html = '';
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
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

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HeroSlider();
    new BookingCalendar();

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

        // Animate methodology section steps
        const processSteps = document.querySelectorAll('.process-step');
        processSteps.forEach((step, index) => {
            gsap.from(step, {
                scrollTrigger: {
                    trigger: step,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 30,
                duration: 0.5,
                delay: index * 0.15,
                ease: 'power3.out'
            });
        });
    }
});
