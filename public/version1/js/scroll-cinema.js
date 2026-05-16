/**
 * scroll-cinema.js — Royal Enfield Dealership
 * Cinematic Hero → Hunter 350 Card Scroll Transition
 * Enhanced with smooth section transitions and 60fps optimizations
 */

(function () {
    'use strict';

    const isLowPerf = (() => {
        const mem = navigator.deviceMemory || 8;
        const cpu = navigator.hardwareConcurrency || 4;
        return mem <= 2 || cpu <= 2;
    })();
    if (isLowPerf) document.body.classList.add('low-perf');

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        // Lenis scrollerProxy (if lenis exists)
        if (window.lenis) {
            ScrollTrigger.scrollerProxy(document.body, {
                scrollTop(value) {
                    if (arguments.length) {
                        window.lenis.scrollTo(value);
                    }
                    return window.lenis.scroll;
                },
                getBoundingClientRect() {
                    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
                }
            });
        }

        const heroBike = document.getElementById('hero-bike');
        const heroSection = document.getElementById('hero');
        const hunterCard = document.getElementById('hunter-card');
        const progressBar = document.getElementById('scroll-progress');
        const modelCards = document.querySelectorAll('.model-card');

        // ---- Scroll Progress Bar ----
        if (progressBar) {
            gsap.to(progressBar, {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: document.documentElement,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0,
                    onUpdate: self => {
                        progressBar.style.transform = `scaleX(${self.progress})`;
                    }
                }
            });
        }

        // ---- Hero Load-in Animation ----
        if (!prefersReduced) {
            const heroLoadTL = gsap.timeline({ delay: 0.3 });
            heroLoadTL
                .fromTo('.hero-badge', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
                .fromTo('.hero-headline', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, '-=0.4')
                .fromTo('.hero-sub', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5')
                .fromTo('.hero-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
                .fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.35')
                .fromTo('.hero-stat', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' }, '-=0.3')
                .fromTo('.hero-scroll-indicator', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2');
            if (heroBike) {
                heroLoadTL.fromTo(heroBike,
                    { opacity: 0, x: 80, scale: 0.88 },
                    { opacity: 1, x: 0, scale: 1, duration: 1.2, ease: 'power3.out' }, '-=1.1'
                );
            }
            heroLoadTL.play();
        } else {
            gsap.set(['.hero-badge', '.hero-headline', '.hero-sub', '.hero-desc', '.hero-cta', '.hero-stat', '.hero-scroll-indicator', heroBike], { opacity: 1, y: 0 });
        }

        // ---- Hero Bike Floating ----
        let floatAnim;
        if (heroBike && !prefersReduced && !isLowPerf) {
            floatAnim = gsap.to(heroBike, {
                y: -16,
                duration: 3,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                delay: 1.5
            });
        }

        // ---- PINNED HERO → HUNTER CARD TRANSITION ----
        if (heroBike && hunterCard && !prefersReduced) {
            const getTargetPos = () => {
                const cardImg = hunterCard.querySelector('.model-card-img');
                if (!cardImg) return { x: 0, y: 0 };
                const rect = cardImg.getBoundingClientRect();
                return {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
            };

            const bikeScrollTL = gsap.timeline({
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top top',
                    end: '+=100%', // Reduced from 150% to minimize blank space
                    pin: true,
                    scrub: 1.8,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onEnter: () => { if (floatAnim) floatAnim.pause(); },
                    onLeaveBack: () => { if (floatAnim) floatAnim.resume(); }
                }
            });

            bikeScrollTL
                .to('.hero-content', { opacity: 0, y: -60, duration: 0.35, ease: 'power2.in' }, 0)
                .to('.hero-stats', { opacity: 0, y: 30, duration: 0.3, ease: 'power2.in' }, 0.05)
                .to('.hero-scroll-indicator', { opacity: 0, duration: 0.2 }, 0)
                .to('.hero-bg-grad', { opacity: 0, duration: 0.6, ease: 'power1.out' }, 0)
                .to(heroBike, {
                    scale: 0.22,
                    x: () => {
                        const target = getTargetPos();
                        const bikeRect = heroBike.getBoundingClientRect();
                        const bikeX = bikeRect.left + bikeRect.width / 2;
                        return target.x - bikeX;
                    },
                    y: () => {
                        const target = getTargetPos();
                        const bikeRect = heroBike.getBoundingClientRect();
                        const bikeY = bikeRect.top + bikeRect.height / 2;
                        return target.y - bikeY;
                    },
                    opacity: 0,
                    duration: 0.65,
                    ease: 'power3.inOut'
                }, 0.3)
                .to('#hunter-card', {
                    keyframes: [
                        { boxShadow: '0 0 0 0 rgba(201,168,76,0)', duration: 0 },
                        { boxShadow: '0 0 60px 10px rgba(201,168,76,0.55), 0 0 120px 20px rgba(201,168,76,0.2)', duration: 0.15 },
                        { boxShadow: '0 0 0 0 rgba(201,168,76,0)', duration: 0.3 },
                    ],
                    duration: 0.45,
                    ease: 'power2.out'
                }, 0.88);
        }

        // ---- SMOOTH SECTION TRANSITIONS ----
        // Fade in models section gradually while still in pin region
        if (!prefersReduced) {
            gsap.fromTo('#models .section-header', 
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0, duration: 1,
                    scrollTrigger: {
                        trigger: '#hero',
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 1
                    }
                }
            );

            // Parallax for all section backgrounds
            const sections = ['#models', '#about', '#services', '#test-ride', '#emi', '#testimonials', '#contact'];
            sections.forEach(sel => {
                gsap.to(sel, {
                    backgroundPositionY: '20%',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sel,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.5
                    }
                });
            });

            // Scale + blur entrance for model cards
            gsap.fromTo('.model-card',
                { scale: 0.9, filter: 'blur(4px)' },
                {
                    scale: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.15,
                    scrollTrigger: {
                        trigger: '#models',
                        start: 'top 80%',
                        end: 'top 20%',
                        scrub: 1
                    }
                }
            );

            // About image parallax (enhanced)
            gsap.to('.about-image-main', {
                yPercent: -20,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#about',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 2
                }
            });

            // Services image parallax
            gsap.to('.services-image img', {
                yPercent: -15,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#services',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 2
                }
            });

            // Testimonials track subtle parallax
            gsap.to('.testimonials-track', {
                xPercent: -10,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#testimonials',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5
                }
            });
        }

        // ---- Models Section Reveal (fallback if scrub doesn't trigger) ----
        if (modelCards.length && !prefersReduced) {
            gsap.fromTo(modelCards,
                { opacity: 0, y: 70, scale: 0.96 },
                {
                    opacity: 1, y: 0, scale: 1, duration: 0.75, stagger: 0.11, ease: 'power3.out',
                    scrollTrigger: { trigger: '#models', start: 'top 75%' }
                }
            );
        }

        // ---- Section Header Reveal ----
        if (!prefersReduced) {
            document.querySelectorAll('.section-header').forEach(hdr => {
                gsap.fromTo(Array.from(hdr.children),
                    { opacity: 0, y: 35 },
                    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.15,
                      scrollTrigger: { trigger: hdr, start: 'top 88%' } }
                );
            });

            // Specific element reveals
            const selectors = ['.service-card', '.contact-item', '.about-stat'];
            selectors.forEach(sel => {
                document.querySelectorAll(sel).forEach((el, i) => {
                    gsap.fromTo(el,
                        { opacity: 0, y: 40 },
                        { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', delay: (i % 3) * 0.1,
                          scrollTrigger: { trigger: el, start: 'top 92%' } }
                    );
                });
            });

            // About grid entrance
            gsap.fromTo('.about-image-wrap', { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '#about', start: 'top 80%' } });
            gsap.fromTo('.about-content', { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '#about', start: 'top 80%' } });
        }

        // ---- Generic reveals for remaining elements ----
        if (!prefersReduced) {
            gsap.utils.toArray('.perk-item, .footer-col, .emi-slider-group, .emi-result').forEach(el => {
                gsap.fromTo(el,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
                      scrollTrigger: { trigger: el, start: 'top 90%' } }
                );
            });
        }

        // ---- Model Cards Hover Effect ----
        if (!isLowPerf) {
            modelCards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    gsap.to(card, { y: -8, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
                });
                card.addEventListener('mouseleave', () => {
                    gsap.to(card, { y: 0, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
                });
            });
        }

        // ---- Testimonials Reveal ----
        if (!prefersReduced) {
            gsap.fromTo('.testimonial-card',
                { opacity: 0, y: 50, scale: 0.97 },
                { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out',
                  scrollTrigger: { trigger: '#testimonials', start: 'top 82%' } }
            );
        }

        // Final refresh
        ScrollTrigger.refresh();
    });
})();