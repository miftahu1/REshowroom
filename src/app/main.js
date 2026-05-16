/**
 * main.js — Royal Enfield Dealership
 * GSAP animations, smooth scroll, interactions, EMI, carousel, etc.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Lenis Smooth Scroll ── */
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
        window.lenis = lenis; // expose for scroll-cinema
        function lenisRaf(time) {
            lenis.raf(time);
            requestAnimationFrame(lenisRaf);
        }
        requestAnimationFrame(lenisRaf);
        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
        }
    }

    /* ── GSAP + ScrollTrigger Register ── */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* ══════════════════════════════════
       NAVBAR
    ══════════════════════════════════ */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar && navbar.classList.toggle('scrolled', window.scrollY > 60);
    });

    /* Mobile menu toggle */
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    hamburger && hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        if (mobileMenu.style.display === 'flex') {
            mobileMenu.style.display = 'none';
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        } else {
            mobileMenu.style.display = 'flex';
            requestAnimationFrame(() => mobileMenu.classList.add('open'));
            document.body.style.overflow = 'hidden';
        }
    });
    document.querySelectorAll('.mobile-menu a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger && hamburger.classList.remove('open');
            if (mobileMenu) {
                mobileMenu.classList.remove('open');
                mobileMenu.style.display = 'none';
            }
            document.body.style.overflow = '';
        });
    });

    /* ══════════════════════════════════
       ABOUT — ANIMATED COUNTERS
    ══════════════════════════════════ */
    let countersStarted = false;
    function animateCounters() {
        if (countersStarted) return;
        countersStarted = true;
        document.querySelectorAll('[data-count]').forEach(el => {
            const target = parseInt(el.getAttribute('data-count'));
            const suffix = el.getAttribute('data-suffix') || '';
            let start = 0;
            const duration = 2000;
            const startTime = performance.now();
            function tick(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(ease * target) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }

    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
        }, { threshold: 0.3 });
        obs.observe(aboutSection);
    }

    /* ══════════════════════════════════
       TEST RIDE FORM
    ══════════════════════════════════ */
    const form = document.getElementById('booking-form');
    const formSuccess = document.querySelector('.form-success');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            if (typeof gsap !== 'undefined') {
                gsap.to(form, {
                    opacity: 0, duration: 0.4, onComplete: () => {
                        form.style.display = 'none';
                        formSuccess.style.display = 'block';
                        gsap.from(formSuccess, { opacity: 0, y: 20, duration: 0.5 });
                    }
                });
            } else {
                form.style.display = 'none';
                formSuccess.style.display = 'block';
            }
        });
    }

    /* ══════════════════════════════════
       EMI CALCULATOR
    ══════════════════════════════════ */
    const loanSlider = document.getElementById('loan-amount');
    const tenureSlider = document.getElementById('loan-tenure');
    const rateSlider = document.getElementById('loan-rate');
    const emiDisplay = document.getElementById('emi-display');
    const loanDisplay = document.getElementById('loan-display');
    const tenureDisplay = document.getElementById('tenure-display');
    const rateDisplay = document.getElementById('rate-display');
    const totalDisplay = document.getElementById('total-display');
    const interestDisp = document.getElementById('interest-display');

    function formatCurrency(n) {
        if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
        if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
        return '₹' + n;
    }

    function calcEMI() {
        if (!loanSlider) return;
        const P = parseInt(loanSlider.value);
        const N = parseInt(tenureSlider.value);
        const R = parseFloat(rateSlider.value) / (12 * 100);
        const emi = R === 0 ? P / N : (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        const total = emi * N;
        const interest = total - P;

        if (emiDisplay) emiDisplay.textContent = '₹' + Math.round(emi).toLocaleString('en-IN');
        if (loanDisplay) loanDisplay.textContent = formatCurrency(P);
        if (tenureDisplay) tenureDisplay.textContent = N + ' mo';
        if (rateDisplay) rateDisplay.textContent = parseFloat(rateSlider.value).toFixed(1) + '%';
        if (totalDisplay) totalDisplay.textContent = formatCurrency(Math.round(total));
        if (interestDisp) interestDisp.textContent = formatCurrency(Math.round(interest));

        [loanSlider, tenureSlider, rateSlider].forEach(slider => {
            if (!slider) return;
            const min = parseFloat(slider.min), max = parseFloat(slider.max), val = parseFloat(slider.value);
            const pct = ((val - min) / (max - min)) * 100;
            slider.style.background = `linear-gradient(to right, #c9a84c ${pct}%, rgba(255,255,255,0.1) ${pct}%)`;
        });
    }

    [loanSlider, tenureSlider, rateSlider].forEach(s => s && s.addEventListener('input', calcEMI));
    calcEMI();

    /* ══════════════════════════════════
       TESTIMONIALS CAROUSEL
    ══════════════════════════════════ */
    const track = document.querySelector('.testimonials-track');
    const dots = document.querySelectorAll('.dot');
    let current = 0;
    let autoPlay;
    const CARD_WIDTH = 468; // 440 + 28 gap

    function goTo(idx) {
        if (!track) return;
        const max = document.querySelectorAll('.testimonial-card').length - 1;
        current = Math.max(0, Math.min(idx, max));
        const offset = current * CARD_WIDTH;
        track.style.transform = `translateX(-${offset}px)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetAuto(); }));

    function resetAuto() {
        clearInterval(autoPlay);
        autoPlay = setInterval(() => {
            const cards = document.querySelectorAll('.testimonial-card').length;
            goTo((current + 1) % cards);
        }, 4000);
    }
    resetAuto();
    goTo(0);

    /* ══════════════════════════════════
       SMOOTH ANCHOR SCROLLING (fallback)
    ══════════════════════════════════ */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
                else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

});