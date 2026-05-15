// ===== CONFIGURATION =====
const MAIL_RECIPIENT = 'info@meeraind.com';
const FORM_SUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(MAIL_RECIPIENT)}`;

// ===== STICKY HEADER =====
function initStickyHeader() {
    const scrollRevealStrip = document.getElementById('scrollRevealStrip');
    if (!scrollRevealStrip) return;

    const triggerPoint = window.innerHeight;

    window.addEventListener('scroll', () => {
        scrollRevealStrip.classList.toggle('is-visible', window.scrollY > triggerPoint);
    }, { passive: true });
}

// ===== PRODUCT CAROUSEL =====
let currentSlideIndex = 0;

function initCarousel() {
    const thumbnails = document.querySelectorAll('.carousel-thumbnail .thumb');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const slideCount = thumbnails.length;

    if (!slideCount) return;

    const goToSlide = (index) => {
        currentSlideIndex = ((index % slideCount) + slideCount) % slideCount;
        updateCarouselSlide(thumbnails);
    };

    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => goToSlide(index));
    });

    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlideIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlideIndex + 1));

    const wrapper = document.querySelector('.image-carousel-wrapper');
    if (wrapper) {
        wrapper.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') goToSlide(currentSlideIndex - 1);
            if (e.key === 'ArrowRight') goToSlide(currentSlideIndex + 1);
        });
    }

    updateCarouselSlide(thumbnails);
}

function updateCarouselSlide(thumbnails) {
    thumbnails.forEach((thumb, index) => {
        const isActive = index === currentSlideIndex;
        thumb.style.border = isActive ? '3px solid #007bff' : 'none';
        thumb.style.opacity = isActive ? '1' : '0.6';
        thumb.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const activeThumb = thumbnails[currentSlideIndex];
    if (!activeThumb) return;

    const fullSrc = activeThumb.getAttribute('data-full-src');
    const fullAlt = activeThumb.getAttribute('data-full-alt') || '';
    const mainImage = document.querySelector('.carousel-main-img');
    const zoomImage = document.querySelector('.zoom-preview .zoom-image');

    if (mainImage && fullSrc) {
        mainImage.src = fullSrc;
        mainImage.alt = fullAlt;
    }
    if (zoomImage && fullSrc) {
        zoomImage.src = fullSrc;
        zoomImage.alt = fullAlt ? `Zoom preview: ${fullAlt}` : 'Zoom preview of active slide';
    }
}

// ===== CAROUSEL ZOOM =====
function initCarouselZoom() {
    const carousel = document.querySelector('.image-carousel');
    const zoomPreview = document.getElementById('zoom-preview');
    if (!carousel || !zoomPreview) return;

    carousel.addEventListener('mouseenter', () => zoomPreview.classList.add('active'));
    carousel.addEventListener('mouseleave', () => zoomPreview.classList.remove('active'));

    carousel.addEventListener('mousemove', (e) => {
        if (!zoomPreview.classList.contains('active')) return;

        const rect = carousel.getBoundingClientRect();
        const zoomX = ((e.clientX - rect.left) / rect.width) * 100;
        const zoomY = ((e.clientY - rect.top) / rect.height) * 100;
        const zoomImage = zoomPreview.querySelector('.zoom-image');

        if (zoomImage) {
            zoomImage.style.transform = `scale(2) translate(calc(-${zoomX}% + 25%), calc(-${zoomY}% + 25%))`;
        }
    });
}

// ===== FAQ ACCORDION =====
function initAccordion() {
    const items = document.querySelectorAll('.accordion-item');
    if (!items.length) return;

    items.forEach((item) => {
        const header = item.querySelector('.accordion-header');
        if (!header) return;

        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            items.forEach((other) => {
                other.classList.remove('active');
                const icon = other.querySelector('.accordion-icon');
                if (icon) icon.textContent = '▼';
            });

            if (!isActive) {
                item.classList.add('active');
                const icon = item.querySelector('.accordion-icon');
                if (icon) icon.textContent = '▲';
            }
        });
    });
}

// ===== APPLICATIONS CAROUSEL =====
function initApplicationsCarousel() {
    const track = document.querySelector('.carousel-track');
    const prevBtn = document.querySelector('.applications-section .prev-btn');
    const nextBtn = document.querySelector('.applications-section .next-btn');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const cards = document.querySelectorAll('.app-card');

    if (!track || !cards.length) return;

    let currentIndex = 0;
    const visibleCount = () => (window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    const maxIndex = () => Math.max(0, cards.length - visibleCount());

    const updateCarousel = () => {
        const cardWidth = cards[0].offsetWidth;
        const gap = 24;
        track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;

        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    };

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = currentIndex <= 0 ? maxIndex() : currentIndex - 1;
            updateCarousel();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = currentIndex >= maxIndex() ? 0 : currentIndex + 1;
            updateCarousel();
        });
    }

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            currentIndex = Math.min(i, maxIndex());
            updateCarousel();
        });
    });

    window.addEventListener('resize', updateCarousel);
    updateCarousel();
}

// ===== MANUFACTURING TABS =====
function initManufacturingTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    if (!tabButtons.length) return;

    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            tabButtons.forEach((b) => b.classList.remove('active'));
            tabContents.forEach((c) => c.classList.remove('active'));

            btn.classList.add('active');
            const target = document.getElementById(tabId);
            if (target) target.classList.add('active');
        });
    });
}

// ===== EMAIL / FORM SUBMISSION =====
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

async function sendToMailbox(payload) {
    const response = await fetch(FORM_SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            _subject: payload.subject,
            _template: 'table',
            _captcha: 'false',
            ...payload.fields,
        }),
    });

    if (!response.ok) {
        throw new Error('Mail delivery failed');
    }

    return response.json();
}

function openMailtoFallback(subject, body) {
    const mailto = `mailto:${MAIL_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const name = formData.get('name')?.toString().trim() || '';
        const company = formData.get('company')?.toString().trim() || '';
        const email = formData.get('email')?.toString().trim() || '';
        const phoneCode = formData.get('phone_code')?.toString() || '';
        const phone = formData.get('phone')?.toString().trim() || '';

        if (!name || !company || !email || !phone) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        const submitBtn = form.querySelector('.form-submit-btn');
        const originalText = submitBtn?.textContent || 'Submit';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        const subject = 'Custom Quote Request - Mangalam HDPE';
        const messageBody = [
            `Name: ${name}`,
            `Company: ${company}`,
            `Email: ${email}`,
            `Phone: ${phoneCode} ${phone}`,
        ].join('\n');

        try {
            await sendToMailbox({
                subject,
                fields: {
                    name,
                    company,
                    email,
                    phone: `${phoneCode} ${phone}`,
                    message: messageBody,
                },
            });
            showToast('Quote request sent! We will contact you soon.');
            form.reset();
        } catch {
            openMailtoFallback(subject, messageBody);
            showToast('Opening your email app to complete the request.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

function initCatalogueForm() {
    const form = document.getElementById('catalogueForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = form.querySelector('.email-input');
        const email = emailInput?.value.trim() || '';

        if (!email) {
            showToast('Please enter your email address.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        const submitBtn = form.querySelector('.catalogue-btn');
        const originalText = submitBtn?.textContent || 'Submit';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        const subject = 'Catalogue Request - Mangalam HDPE';

        try {
            await sendToMailbox({
                subject,
                fields: {
                    email,
                    message: `Catalogue requested by: ${email}`,
                },
            });
            showToast('Catalogue request sent! Check your inbox soon.');
            form.reset();
        } catch {
            openMailtoFallback(subject, `Please send me the product catalogue.\n\nMy email: ${email}`);
            showToast('Opening your email app to complete the catalogue request.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

// ===== CTA / QUOTE BUTTONS → CONTACT =====
function initQuoteButtons() {
    const selectors = [
        '[data-action="quote"]',
        '.feature-request-btn',
        '.cta-btn',
        '.scroll-reveal-cta',
    ];

    document.querySelectorAll(selectors.join(',')).forEach((btn) => {
        btn.addEventListener('click', (e) => {
            if (btn.tagName === 'A' && btn.getAttribute('href')?.startsWith('#')) return;
            e.preventDefault();
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        });
    });

    document.querySelector('[data-action="specs"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('specifications')?.scrollIntoView({ behavior: 'smooth' });
    });
}

// ===== NAV ACTIVE STATE =====
function getSectionByKey(key) {
    const map = {
        about: document.querySelector('.product-page'),
        products: document.getElementById('products'),
        contact: document.getElementById('contact'),
    };
    return map[key] || document.getElementById(key);
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sectionEntries = [...navLinks]
        .map((link) => ({ key: link.dataset.section, el: getSectionByKey(link.dataset.section) }))
        .filter((entry) => entry.el);

    if (!sectionEntries.length) return;

    const setActive = () => {
        const scrollPos = window.scrollY + 120;
        let currentKey = sectionEntries[0].key;

        sectionEntries.forEach(({ key, el }) => {
            if (el.offsetTop <= scrollPos) currentKey = key;
        });

        navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === currentKey);
        });
    };

    window.addEventListener('scroll', setActive, { passive: true });
    setActive();
}

// ===== DOWNLOAD DATASHEET =====
function downloadTechnicalDatasheet() {
    const csvContent = `Technical Specifications,Value
Pipe Diameter Range,20mm to 1600mm (3/4" to 63")
Pressure Ratings,PN 2.5 PN 4 PN 6 PN 8 PN 10 PN 12.5 PN 16
Standard Dimension Ratio,SDR 33 SDR 26 SDR 21 SDR 17 SDR 13.6 SDR 11
Operating Temperature,-40°C to +80°C (-40°F to +176°F)
Service Life,50+ Years (at 20 degrees C PN 10)
Material Density,0.95 - 0.96 g/cm3
Certification Standards,IS 5934 ISO 4427 ASTM D3035
Joint Type,Butt Fusion Electrofusion Mechanical
Coil Lengths,Up to 500mm (for smaller diameters)
Country of Origin,India`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Technical_Specifications_HDPE_Pipes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast('Technical datasheet downloaded successfully!');
}

function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    button.querySelector('.ripple')?.remove();
    button.appendChild(ripple);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: ${type === 'error' ? '#e53935' : '#4CAF50'};
        color: white;
        padding: 16px 24px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease-in-out;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        max-width: min(360px, calc(100vw - 40px));
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.6s ease-in-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.specs-section, .footer-section').forEach((el) => {
        observer.observe(el);
    });
}

// ===== GLOBAL STYLES FOR JS UI =====
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: rippleAnimation 0.6s ease-out;
        pointer-events: none;
    }
    @keyframes rippleAnimation {
        to { transform: scale(4); opacity: 0; }
    }
    .specs-table tbody tr { transition: transform 0.2s ease; }
    .download-btn { position: relative; overflow: hidden; }
    .nav-link.active { font-weight: 700; text-decoration: underline; }
    .applications-carousel .carousel-track {
        display: flex;
        gap: 24px;
        transition: transform 0.4s ease;
    }
`;
document.head.appendChild(style);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.style.scrollBehavior = 'smooth';

    initStickyHeader();
    initCarousel();
    initCarouselZoom();
    initAccordion();
    initApplicationsCarousel();
    initManufacturingTabs();
    initContactForm();
    initCatalogueForm();
    initQuoteButtons();
    initNavigation();
    initScrollAnimations();

    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            createRipple(e);
            downloadTechnicalDatasheet();
        });
    }

    document.querySelectorAll('.specs-table tbody tr').forEach((row) => {
        row.addEventListener('mouseenter', () => { row.style.transform = 'scale(1.01)'; });
        row.addEventListener('mouseleave', () => { row.style.transform = 'scale(1)'; });
    });

});
