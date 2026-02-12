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
    // Refresh chatbot language
    if (window.chatbot) {
        window.chatbot.refresh();
    }
    // Refresh eligibility quiz language
    if (window.eligibilityQuiz) {
        window.eligibilityQuiz.refresh();
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
const navParent = nav ? nav.parentElement : null;
const navNextSibling = nav ? nav.nextElementSibling : null;

if (mobileMenuBtn && nav) {
    // Add "Book consultation" button inside mobile nav
    const mobileBookBtn = document.createElement('a');
    mobileBookBtn.href = 'book.html';
    mobileBookBtn.className = 'mobile-book-btn';
    mobileBookBtn.setAttribute('data-i18n', 'nav.book');
    mobileBookBtn.textContent = getCurrentLang() === 'en' ? 'Book a consultation' : 'Réserver une consultation';
    nav.appendChild(mobileBookBtn);

    function openMobileMenu() {
        // Move nav to body so backdrop-filter on header doesn't break fixed positioning
        document.body.appendChild(nav);
        nav.classList.add('active');
        mobileMenuBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        nav.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.style.overflow = '';
        // Move nav back into header
        if (navNextSibling) {
            navParent.insertBefore(nav, navNextSibling);
        } else {
            navParent.appendChild(nav);
        }
    }

    mobileMenuBtn.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Close mobile menu when a nav link is clicked
    nav.querySelectorAll('.nav-link, .mobile-book-btn').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
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

        if (this.backgrounds.length === 0) return;

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
            const fullDate = d + '/' + (this.currentMonth + 1) + '/' + this.currentYear;
            html += '<div class="' + cls + '" data-day="' + d + '" data-date="' + fullDate + '">' + d + '</div>';
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

// Chatbot Widget
class ChatbotWidget {
    constructor() {
        this.isOpen = false;
        this.faqData = this.getFaqData();
        this.createDOM();
        this.bindEvents();
        this.showGreeting();
    }

    t(key) {
        return translations[getCurrentLang()][key] || key;
    }

    getFaqData() {
        return {
            general: {
                en: [
                    { q: "What is a B1/B2 visa?", a: "The B1/B2 visa is a U.S. nonimmigrant visa for Moroccan citizens traveling to the United States. B1 is for business and B2 is for tourism, family visits, or medical treatment. They are typically issued as a combined visa, valid for up to 10 years." },
                    { q: "Where is the visa interview held?", a: "All B1/B2 visa interviews for Moroccan applicants are conducted at the U.S. Consulate General in Casablanca, located on Boulevard Moulay Youssef." },
                    { q: "How long does the process take?", a: "The DS-160 form takes 1-2 days, payment confirmation about 24 hours, and interview wait times vary from a few weeks to several months. We recommend starting at least 3 months before your travel date." },
                    { q: "What services does TruePathVisa offer?", a: "We offer end-to-end visa assistance: DS-160 form filling, payment guidance, interview booking, and interview preparation. Book a consultation to learn more!" }
                ],
                fr: [
                    { q: "Qu'est-ce qu'un visa B1/B2 ?", a: "Le visa B1/B2 est un visa de non-immigrant am\u00e9ricain pour les citoyens marocains. Le B1 est pour les affaires et le B2 pour le tourisme, les visites familiales ou les soins m\u00e9dicaux. Il est g\u00e9n\u00e9ralement valide jusqu'\u00e0 10 ans." },
                    { q: "O\u00f9 se d\u00e9roule l'entretien ?", a: "Tous les entretiens de visa B1/B2 pour les demandeurs marocains ont lieu au Consulat G\u00e9n\u00e9ral des \u00c9tats-Unis \u00e0 Casablanca, Boulevard Moulay Youssef." },
                    { q: "Combien de temps dure le processus ?", a: "Le formulaire DS-160 prend 1-2 jours, la confirmation de paiement environ 24 heures, et les d\u00e9lais d'entretien varient de quelques semaines \u00e0 plusieurs mois. Nous recommandons de commencer au moins 3 mois avant votre voyage." },
                    { q: "Quels services offre TruePathVisa ?", a: "Nous offrons une assistance compl\u00e8te : remplissage du DS-160, guidance de paiement, r\u00e9servation d'entretien et pr\u00e9paration \u00e0 l'entretien. R\u00e9servez une consultation pour en savoir plus !" }
                ]
            },
            ds160: {
                en: [
                    { q: "Can you help fill out the DS-160?", a: "Yes! We assist applicants with the DS-160 regardless of language. The form is in English but our team guides you through every field. Contact us to get started." },
                    { q: "What documents do I need for the DS-160?", a: "You'll need: valid Moroccan passport, CIN, employment details, education history, a digital photo (5x5 cm, white background), and your U.S. contact/hotel details." },
                    { q: "Which consulate should I select?", a: "Select \"Casablanca, Morocco\" as your interview location. It's the only location in Morocco that processes B1/B2 visa interviews." },
                    { q: "Can I correct mistakes after submission?", a: "No, once submitted the DS-160 cannot be edited. You would need to fill out a new form entirely. That's why we recommend professional assistance to avoid costly mistakes." }
                ],
                fr: [
                    { q: "Pouvez-vous aider \u00e0 remplir le DS-160 ?", a: "Oui ! Nous aidons les demandeurs avec le DS-160 quelle que soit la langue. Le formulaire est en anglais mais notre \u00e9quipe vous guide \u00e0 chaque \u00e9tape." },
                    { q: "Quels documents pour le DS-160 ?", a: "Vous aurez besoin de : passeport marocain valide, CIN, d\u00e9tails d'emploi, historique scolaire, photo num\u00e9rique (5x5 cm, fond blanc), et coordonn\u00e9es de votre contact/h\u00f4tel aux USA." },
                    { q: "Quel consulat s\u00e9lectionner ?", a: "S\u00e9lectionnez \"Casablanca, Morocco\". C'est le seul endroit au Maroc qui traite les entretiens de visa B1/B2." },
                    { q: "Puis-je corriger des erreurs apr\u00e8s soumission ?", a: "Non, une fois soumis le DS-160 ne peut pas \u00eatre modifi\u00e9. Il faudrait remplir un nouveau formulaire. C'est pourquoi nous recommandons une assistance professionnelle." }
                ]
            },
            payment: {
                en: [
                    { q: "How much is the visa fee?", a: "The B1/B2 visa fee is $185 USD, payable in Moroccan Dirhams at the current exchange rate. This fee is non-refundable regardless of the outcome." },
                    { q: "Where can I pay?", a: "The fee is paid at authorized bank branches across Morocco. You'll need your CGI reference slip (provided by our agency) to make the payment." },
                    { q: "How long after payment can I book?", a: "After paying, wait approximately 24 hours for the payment to be validated in the system. Then you can schedule your interview appointment." },
                    { q: "Is the fee refundable if denied?", a: "No, the fee is non-refundable. However, the receipt stays valid for one year \u2014 you can reschedule within that period without paying again." }
                ],
                fr: [
                    { q: "Combien co\u00fbte le visa ?", a: "Les frais de visa B1/B2 sont de 185 $ USD, payables en Dirhams marocains au taux de change actuel. Ces frais sont non remboursables." },
                    { q: "O\u00f9 puis-je payer ?", a: "Les frais se paient dans les agences bancaires autoris\u00e9es au Maroc. Vous aurez besoin de votre bordereau CGI (fourni par notre agence) pour effectuer le paiement." },
                    { q: "Combien de temps apr\u00e8s le paiement ?", a: "Apr\u00e8s le paiement, comptez environ 24 heures pour la validation dans le syst\u00e8me. Ensuite, notre agence se charge de r\u00e9server votre entretien." },
                    { q: "Les frais sont-ils remboursables ?", a: "Non, les frais ne sont pas remboursables. Cependant, le re\u00e7u reste valide pendant un an \u2014 vous pouvez reprogrammer sans repayer." }
                ]
            },
            interview: {
                en: [
                    { q: "What happens on interview day?", a: "Arrive 15 minutes early. You'll go through security, submit fingerprints, then meet a consular officer. The interview lasts 3-5 minutes in English or French." },
                    { q: "What documents should I bring?", a: "Bring: passport, DS-160 confirmation page, appointment letter, fee receipt, bank statements, attestation de travail, property deeds, family booklet, and travel itinerary." },
                    { q: "Can the interview be in French?", a: "Yes! At the Casablanca consulate, many officers speak French. The interview can often be conducted in French." },
                    { q: "I was denied before. Can I reapply?", a: "Yes, a 214(b) denial doesn't permanently ban you. You can reapply anytime but must show changed circumstances: new job, stronger finances, property, or family ties." }
                ],
                fr: [
                    { q: "Que se passe-t-il le jour de l'entretien ?", a: "Arrivez 15 minutes en avance. Contr\u00f4le de s\u00e9curit\u00e9, empreintes digitales, puis entretien de 3-5 minutes avec un agent consulaire en fran\u00e7ais ou anglais." },
                    { q: "Quels documents apporter ?", a: "Apportez : passeport, confirmation DS-160, lettre de rendez-vous, re\u00e7u de paiement, relev\u00e9s bancaires, attestation de travail, titres de propri\u00e9t\u00e9, livret de famille et itin\u00e9raire de voyage." },
                    { q: "L'entretien peut-il \u00eatre en fran\u00e7ais ?", a: "Oui ! Au consulat de Casablanca, de nombreux agents parlent fran\u00e7ais. L'entretien peut souvent se d\u00e9rouler en fran\u00e7ais." },
                    { q: "Refus\u00e9 avant, puis-je redemander ?", a: "Oui, un refus 214(b) ne vous interdit pas d\u00e9finitivement. Vous pouvez redemander \u00e0 tout moment en montrant un changement de situation : nouvel emploi, finances plus solides, propri\u00e9t\u00e9 ou liens familiaux." }
                ]
            }
        };
    }

    createDOM() {
        // Toggle button
        this.toggle = document.createElement('button');
        this.toggle.className = 'chatbot-toggle';
        this.toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

        // Chat window
        this.window = document.createElement('div');
        this.window.className = 'chatbot-window';
        this.window.innerHTML =
            '<div class="chatbot-header">' +
                '<div class="chatbot-header-info">' +
                    '<div class="chatbot-header-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>' +
                    '<div><div class="chatbot-header-name"></div><div class="chatbot-header-status"></div></div>' +
                '</div>' +
                '<button class="chatbot-close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>' +
            '</div>' +
            '<div class="chatbot-messages"></div>' +
            '<div class="chatbot-suggestions"></div>' +
            '<div class="chatbot-input-bar">' +
                '<input type="text" class="chatbot-input" placeholder="">' +
                '<button class="chatbot-send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>' +
            '</div>';

        // Notification bubble
        this.bubble = document.createElement('div');
        this.bubble.className = 'chatbot-bubble';
        this.bubble.innerHTML = '<button class="chatbot-bubble-close">&times;</button><span class="chatbot-bubble-text"></span>';

        document.body.appendChild(this.toggle);
        document.body.appendChild(this.window);
        document.body.appendChild(this.bubble);

        this.messagesEl = this.window.querySelector('.chatbot-messages');
        this.suggestionsEl = this.window.querySelector('.chatbot-suggestions');
        this.inputEl = this.window.querySelector('.chatbot-input');
        this.sendBtn = this.window.querySelector('.chatbot-send');
        this.updateBubbleText();
        this.updateInputPlaceholder();
    }

    updateBubbleText() {
        var lang = getCurrentLang();
        this.bubble.querySelector('.chatbot-bubble-text').textContent = lang === 'fr' ? 'Besoin d\u2019aide pour votre visa ?' : 'Need help with your visa?';
    }

    bindEvents() {
        this.toggle.addEventListener('click', () => this.toggleChat());
        this.window.querySelector('.chatbot-close').addEventListener('click', () => this.toggleChat());
        this.bubble.querySelector('.chatbot-bubble-text').addEventListener('click', () => {
            this.bubble.classList.add('hidden');
            if (!this.isOpen) this.toggleChat();
        });
        this.bubble.querySelector('.chatbot-bubble-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.bubble.classList.add('hidden');
        });
        this.sendBtn.addEventListener('click', () => this.handleUserInput());
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });
    }

    updateInputPlaceholder() {
        var lang = getCurrentLang();
        this.inputEl.placeholder = lang === 'fr' ? 'Tapez votre question...' : 'Type your question...';
    }

    handleUserInput() {
        var text = this.inputEl.value.trim();
        if (!text) return;
        this.addMessage(text, 'user');
        this.inputEl.value = '';
        this.findAnswer(text);
    }

    findAnswer(query) {
        var lang = getCurrentLang();
        var lowerQuery = query.toLowerCase();
        var bestMatch = null;
        var bestScore = 0;
        var self = this;

        // Search all FAQ categories for the best matching question
        Object.keys(this.faqData).forEach(function(cat) {
            var items = self.faqData[cat][lang];
            items.forEach(function(item) {
                var score = self.getMatchScore(lowerQuery, item.q.toLowerCase());
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = item;
                }
            });
        });

        if (bestMatch && bestScore >= 2) {
            this.addMessage(bestMatch.a, 'bot');
            this.showAfterAnswer(null);
        } else {
            var noAnswer = lang === 'fr'
                ? 'Je n\'ai pas trouv\u00e9 de r\u00e9ponse exacte. Veuillez choisir un sujet ci-dessous ou r\u00e9server une consultation pour une aide personnalis\u00e9e.'
                : 'I couldn\'t find an exact answer. Please choose a topic below or book a consultation for personalized help.';
            this.addMessage(noAnswer, 'bot');
            this.showCategories();
        }
    }

    getMatchScore(query, question) {
        var queryWords = query.split(/\s+/);
        var score = 0;
        queryWords.forEach(function(word) {
            if (word.length > 2 && question.indexOf(word) !== -1) {
                score++;
            }
        });
        return score;
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.window.classList.toggle('open', this.isOpen);
        this.toggle.classList.toggle('open', this.isOpen);
        if (this.isOpen) {
            this.bubble.classList.add('hidden');
            this.toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        } else {
            this.toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
        }
    }

    updateHeader() {
        this.window.querySelector('.chatbot-header-name').textContent = this.t('chat.name');
        this.window.querySelector('.chatbot-header-status').textContent = this.t('chat.status');
    }

    addMessage(text, type) {
        var msg = document.createElement('div');
        msg.className = 'chatbot-msg ' + type;
        msg.textContent = text;
        this.messagesEl.appendChild(msg);
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    clearSuggestions() {
        this.suggestionsEl.innerHTML = '';
    }

    showGreeting() {
        this.updateHeader();
        this.messagesEl.innerHTML = '';
        this.addMessage(this.t('chat.greeting'), 'bot');
        this.showCategories();
    }

    showCategories() {
        this.clearSuggestions();
        var categories = ['general', 'ds160', 'payment', 'interview'];
        var self = this;
        categories.forEach(function(cat) {
            var btn = document.createElement('button');
            btn.className = 'chatbot-suggestion-btn';
            btn.textContent = self.t('chat.cat.' + cat);
            btn.addEventListener('click', function() {
                self.addMessage(self.t('chat.cat.' + cat), 'user');
                self.showQuestions(cat);
            });
            self.suggestionsEl.appendChild(btn);
        });
    }

    showQuestions(category) {
        this.clearSuggestions();
        var lang = getCurrentLang();
        var questions = this.faqData[category][lang];
        var self = this;

        questions.forEach(function(item) {
            var btn = document.createElement('button');
            btn.className = 'chatbot-suggestion-btn';
            btn.textContent = item.q;
            btn.addEventListener('click', function() {
                self.addMessage(item.q, 'user');
                self.addMessage(item.a, 'bot');
                self.showAfterAnswer(category);
            });
            self.suggestionsEl.appendChild(btn);
        });

        var backBtn = document.createElement('button');
        backBtn.className = 'chatbot-back-btn';
        backBtn.textContent = this.t('chat.back');
        backBtn.addEventListener('click', function() {
            self.showCategories();
        });
        this.suggestionsEl.appendChild(backBtn);
    }

    showAfterAnswer(category) {
        this.clearSuggestions();
        var self = this;

        var moreBtn = document.createElement('button');
        moreBtn.className = 'chatbot-suggestion-btn';
        moreBtn.textContent = this.t('chat.back');
        moreBtn.addEventListener('click', function() {
            self.showCategories();
        });
        this.suggestionsEl.appendChild(moreBtn);

        var ctaBtn = document.createElement('button');
        ctaBtn.className = 'chatbot-cta-btn';
        ctaBtn.textContent = this.t('chat.book');
        ctaBtn.addEventListener('click', function() {
            window.location.href = 'book.html';
        });
        this.suggestionsEl.appendChild(ctaBtn);
    }

    refresh() {
        this.updateHeader();
        this.updateBubbleText();
        this.updateInputPlaceholder();
        this.messagesEl.innerHTML = '';
        this.addMessage(this.t('chat.greeting'), 'bot');
        this.showCategories();
    }
}

// Eligibility Quiz Widget — Branching Logic
class EligibilityQuiz {
    constructor() {
        this.isOpen = false;
        this.score = 0;
        this.totalSteps = 0;
        this.stepIndex = 0;
        this.path = [];
        this.status = '';
        this.createDOM();
        this.bindEvents();
    }

    t(key) {
        return translations[getCurrentLang()][key] || key;
    }

    // Build the branching question flow based on Q1 answer
    buildPath(statusKey) {
        this.status = statusKey;
        var sfxMap = { employed: 'emp', selfemployed: 'self', student: 'stu', retired: 'ret', unemployed: 'unemp' };
        var sfx = sfxMap[statusKey];
        var path = [];

        // Q2: Financial situation (branched per status)
        path.push({ key: 'q2_' + sfx, answers: [
            { key: 'a1', score: 3 },
            { key: 'a2', score: 2 },
            { key: 'a3', score: 1 },
            { key: 'a4', score: 0 }
        ]});

        // Q3: Strong ties (branched per status)
        var q3Scores = statusKey === 'unemployed'
            ? [{ key: 'a1', score: 2 }, { key: 'a2', score: 1 }, { key: 'a3', score: 0 }]
            : [{ key: 'a1', score: 3 }, { key: 'a2', score: 2 }, { key: 'a3', score: 1 }];
        path.push({ key: 'q3_' + sfx, answers: q3Scores });

        // Q4: Property / Assets (shared)
        path.push({ key: 'q4', answers: [
            { key: 'a1', score: 3 },
            { key: 'a2', score: 1 },
            { key: 'a3', score: 1 }
        ]});

        // Q5: Family situation (shared)
        path.push({ key: 'q5', answers: [
            { key: 'a1', score: 3 },
            { key: 'a2', score: 2 },
            { key: 'a3', score: 1 },
            { key: 'a4', score: 0 }
        ]});

        // Q6: Travel history (shared)
        path.push({ key: 'q6', answers: [
            { key: 'a1', score: 3 },
            { key: 'a2', score: 2 },
            { key: 'a3', score: 0 }
        ]});

        // Q7: Purpose of travel (shared)
        path.push({ key: 'q7', answers: [
            { key: 'a1', score: 2 },
            { key: 'a2', score: 3 },
            { key: 'a3', score: 2 },
            { key: 'a4', score: 1 }
        ]});

        this.path = path;
        this.totalSteps = path.length + 1; // +1 for Q1
    }

    createDOM() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'quiz-overlay';

        this.panel = document.createElement('div');
        this.panel.className = 'quiz-panel';
        this.panel.innerHTML =
            '<div class="quiz-header">' +
                '<div>' +
                    '<h3 class="quiz-header-title"></h3>' +
                    '<p class="quiz-header-sub"></p>' +
                '</div>' +
                '<button class="quiz-close">&times;</button>' +
            '</div>' +
            '<div class="quiz-body">' +
                '<div class="quiz-progress"><div class="quiz-progress-bar"></div></div>' +
                '<div class="quiz-step-label"></div>' +
                '<div class="quiz-content"></div>' +
            '</div>';

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.panel);

        this.headerTitle = this.panel.querySelector('.quiz-header-title');
        this.headerSub = this.panel.querySelector('.quiz-header-sub');
        this.progressBar = this.panel.querySelector('.quiz-progress-bar');
        this.stepLabel = this.panel.querySelector('.quiz-step-label');
        this.content = this.panel.querySelector('.quiz-content');
        this.closeBtn = this.panel.querySelector('.quiz-close');

        this.updateTexts();
    }

    updateTexts() {
        this.headerTitle.textContent = this.t('quiz.title');
        this.headerSub.textContent = this.t('quiz.subtitle');
    }

    bindEvents() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quiz-trigger')) {
                e.preventDefault();
                this.open();
            }
        });
    }

    open() {
        this.isOpen = true;
        this.score = 0;
        this.stepIndex = 0;
        this.path = [];
        this.status = '';
        this.totalSteps = 7;
        this.updateTexts();
        this.panel.classList.add('open');
        this.overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        this.showQ1();
    }

    close() {
        this.isOpen = false;
        this.panel.classList.remove('open');
        this.overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    showQ1() {
        this.stepIndex = 0;
        var progress = (0 / this.totalSteps) * 100;
        this.progressBar.style.width = progress + '%';
        this.stepLabel.textContent = this.t('quiz.step') + ' 1 / ' + this.totalSteps;

        var statuses = [
            { key: 'employed', score: 3 },
            { key: 'selfemployed', score: 3 },
            { key: 'student', score: 1 },
            { key: 'retired', score: 2 },
            { key: 'unemployed', score: 0 }
        ];

        var html = '<h4 class="quiz-question">' + this.t('quiz.q1') + '</h4>';
        html += '<div class="quiz-options">';
        statuses.forEach(function(s) {
            html += '<button class="quiz-option" data-status="' + s.key + '" data-score="' + s.score + '">' +
                        '<span class="quiz-option-text">' + this.t('quiz.q1.' + s.key) + '</span>' +
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
                    '</button>';
        }.bind(this));
        html += '</div>';

        this.content.innerHTML = html;

        this.content.querySelectorAll('.quiz-option').forEach(function(btn) {
            btn.addEventListener('click', function() {
                this.score += parseInt(btn.dataset.score);
                btn.classList.add('selected');
                this.buildPath(btn.dataset.status);
                setTimeout(function() {
                    this.stepIndex = 1;
                    this.showBranchedQuestion();
                }.bind(this), 300);
            }.bind(this));
        }.bind(this));
    }

    showBranchedQuestion() {
        var pathIdx = this.stepIndex - 1;
        if (pathIdx >= this.path.length) {
            this.showResult();
            return;
        }

        var q = this.path[pathIdx];
        var progress = (this.stepIndex / this.totalSteps) * 100;
        this.progressBar.style.width = progress + '%';
        this.stepLabel.textContent = this.t('quiz.step') + ' ' + (this.stepIndex + 1) + ' / ' + this.totalSteps;

        var html = '<h4 class="quiz-question">' + this.t('quiz.' + q.key) + '</h4>';
        html += '<div class="quiz-options">';
        q.answers.forEach(function(a) {
            html += '<button class="quiz-option" data-score="' + a.score + '">' +
                        '<span class="quiz-option-text">' + this.t('quiz.' + q.key + '.' + a.key) + '</span>' +
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
                    '</button>';
        }.bind(this));
        html += '</div>';

        this.content.innerHTML = html;

        this.content.querySelectorAll('.quiz-option').forEach(function(btn) {
            btn.addEventListener('click', function() {
                this.score += parseInt(btn.dataset.score);
                btn.classList.add('selected');
                setTimeout(function() {
                    this.stepIndex++;
                    this.showBranchedQuestion();
                }.bind(this), 300);
            }.bind(this));
        }.bind(this));
    }

    showResult() {
        this.progressBar.style.width = '100%';
        this.stepLabel.textContent = '';

        var level, levelClass;
        var maxScore = 21;

        if (this.score >= 16) {
            level = 'high';
            levelClass = 'quiz-result-high';
        } else if (this.score >= 10) {
            level = 'mid';
            levelClass = 'quiz-result-mid';
        } else {
            level = 'low';
            levelClass = 'quiz-result-low';
        }

        var percentage = Math.min(Math.round((this.score / maxScore) * 100), 100);

        var html = '<div class="quiz-result">' +
            '<div class="quiz-score-circle ' + levelClass + '">' +
                '<span class="quiz-score-number">' + percentage + '%</span>' +
            '</div>' +
            '<h4 class="quiz-result-title ' + levelClass + '-text">' + this.t('quiz.result.' + level) + '</h4>' +
            '<p class="quiz-result-desc">' + this.t('quiz.result.' + level + '.desc') + '</p>' +
            '<div class="quiz-result-actions">' +
                '<a href="book.html" class="quiz-result-btn">' + this.t('quiz.result.cta') + '</a>' +
                '<button class="quiz-retry-btn">' + this.t('quiz.result.retry') + '</button>' +
            '</div>' +
        '</div>';

        this.content.innerHTML = html;

        this.content.querySelector('.quiz-retry-btn').addEventListener('click', function() {
            this.open();
        }.bind(this));
    }

    refresh() {
        this.updateTexts();
        if (this.isOpen) {
            // Re-render current state
            if (this.stepIndex === 0) {
                this.showQ1();
            } else if (this.stepIndex - 1 < this.path.length) {
                this.showBranchedQuestion();
            } else {
                this.showResult();
            }
        }
    }
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HeroSlider();
    window.bookingCalendar = new BookingCalendar();
    initFAQ();
    initLangToggle();
    window.chatbot = new ChatbotWidget();
    window.eligibilityQuiz = new EligibilityQuiz();

    // Initialize GSAP ScrollTrigger for card stacking animation
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Card stacking animation
        const cards = gsap.utils.toArray(".step-card");

        if (cards.length > 0) {
            const lastCardIndex = cards.length - 1;

            const lastCardST = ScrollTrigger.create({
                trigger: cards[cards.length - 1],
                start: "center center"
            });

            cards.forEach((card, index) => {
                card.style.zIndex = index + 1;
                const scale = index === lastCardIndex ? 1 : 0.9;
                const scaleDown = gsap.to(card, { scale: scale });

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

            // Pre-compute each circle's center Y relative to .process-steps
            const circleOffsets = [];
            processSteps.forEach((step) => {
                const circle = step.querySelector('.step-circle');
                circleOffsets.push(step.offsetTop + circle.offsetHeight / 2);
            });

            processSteps[0].classList.add('active');

            // Build a scrubbed timeline so sidebar moves continuously with cards
            const halfH = stepsEl.offsetHeight / 2;
            gsap.set(stepsEl, { y: halfH - circleOffsets[0] });

            const tl = gsap.timeline();
            for (var i = 1; i < circleOffsets.length; i++) {
                tl.to(stepsEl, { y: halfH - circleOffsets[i], ease: 'none' });
            }

            ScrollTrigger.create({
                trigger: cards[0],
                start: 'top top',
                endTrigger: cards[cards.length - 1],
                end: 'center center',
                scrub: 0.5,
                animation: tl,
                onUpdate: function(self) {
                    var idx = Math.min(
                        Math.floor(self.progress * processSteps.length),
                        processSteps.length - 1
                    );
                    processSteps.forEach(function(s, i) {
                        s.classList.toggle('active', i === idx);
                    });
                }
            });
        }
    }
});
