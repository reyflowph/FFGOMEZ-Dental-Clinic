(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 981px) and (pointer: fine)').matches;
  const gsapReady = window.gsap && window.ScrollTrigger;

  document.documentElement.classList.add('torrelle-motion-ready');

  function setupSmartNavigation() {
    const header = document.querySelector('#siteHeader');
    if (!header) return;

    let lastY = Math.max(0, window.scrollY);
    let visible = true;
    let tickingNav = false;

    header.style.willChange = 'transform';
    header.style.transition = reduce ? 'none' : 'transform 360ms cubic-bezier(.22,1,.36,1)';

    const setVisible = (show) => {
      if (show === visible) return;
      visible = show;
      header.style.transform = show ? 'translate3d(0,0,0)' : 'translate3d(0,-110%,0)';
      header.style.pointerEvents = show ? '' : 'none';
    };

    const updateNavigation = () => {
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - lastY;
      const menuOpen = header.querySelector('[aria-expanded="true"]');

      if (document.body.classList.contains('torrelle-loading') || menuOpen || currentY <= 24) {
        setVisible(true);
      } else if (delta > 6 && currentY > 96) {
        setVisible(false);
      } else if (delta < -4) {
        setVisible(true);
      }

      lastY = currentY;
      tickingNav = false;
    };

    addEventListener('scroll', () => {
      if (!tickingNav) {
        tickingNav = true;
        requestAnimationFrame(updateNavigation);
      }
    }, { passive: true });

    header.addEventListener('focusin', () => setVisible(true));
  }

  setupSmartNavigation();

  const progress = document.createElement('div');
  progress.className = 'torrelle-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const isHome = /(^|\/)index\.html$/.test(location.pathname) || /\/$/.test(location.pathname);

  function addLoader() {
    const loader = document.createElement('div');
    loader.className = 'torrelle-loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = '<div class="torrelle-loader__inner">' +
      '<img class="torrelle-loader__mark" src="assets/ffgomez-logo.jpg" alt="">' +
      '<p class="torrelle-loader__name">FFGOMEZ</p>' +
      '<p class="torrelle-loader__sub">' + (isHome ? 'Dental artistry · Manila' : document.title.split('|')[0].trim()) + '</p>' +
      '<div class="torrelle-loader__track"><div class="torrelle-loader__line"></div></div>' +
      '</div>';
    document.body.prepend(loader);
    document.body.classList.add('torrelle-loading');
    return loader;
  }

  if (reduce || !gsapReady) {
    progress.remove();
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in', 'reveal-in'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const loader = isHome ? addLoader() : null;

  const intro = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      document.body.classList.remove('torrelle-loading');
      if (loader) loader.remove();
      ScrollTrigger.refresh();
    }
  });

  if (isHome) {
    intro
      .to('.torrelle-loader__line', { x: 0, duration: .65 })
      .fromTo('.torrelle-loader__mark', { opacity: 0, scale: .84 }, { opacity: 1, scale: 1, duration: .5 }, .05)
      .fromTo(['.torrelle-loader__name', '.torrelle-loader__sub'], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .42, stagger: .08 }, .12)
      .to(loader, { yPercent: -100, duration: .82, ease: 'power4.inOut' }, .85);
  }

  const hero = document.querySelector('.hero');
  if (hero) {
    const heroMedia = hero.querySelector('img, video, .hero-bg, .hero-image, .hero-media');
    const heroText = hero.querySelectorAll('h1, .eyebrow, p, .btn, a');
    if (heroMedia) intro.fromTo(heroMedia, { scale: isHome ? 1.1 : 1.045 }, { scale: 1.015, duration: isHome ? 1.35 : .85, ease: 'power2.out' }, isHome ? 1.05 : 0);
    if (heroText.length) intro.fromTo(heroText, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .72, stagger: .075 }, isHome ? 1.12 : .08);
    if (desktop && heroMedia) {
      gsap.to(heroMedia, { yPercent: 5, scale: 1.07, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .7 } });
    }
  }

  const headings = gsap.utils.toArray('main h2, section h2, .section-head h2');
  headings.forEach(el => gsap.fromTo(el, { opacity: 0, y: 28 }, {
    opacity: 1, y: 0, duration: .85, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
  }));

  const cards = gsap.utils.toArray('.service-card, .review-card, .testimonial-card, .video-card, .faq-item, .team-card, .gallery-card, article');
  cards.forEach((el, i) => gsap.fromTo(el, { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, duration: .78, delay: (i % 3) * .045, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 91%', once: true }
  }));

  const revealEls = gsap.utils.toArray('.reveal');
  revealEls.forEach(el => {
    if (el.matches('h2, .service-card, .review-card, .testimonial-card, .video-card, .faq-item, article')) return;
    gsap.fromTo(el, { opacity: 0, y: 24 }, {
      opacity: 1, y: 0, duration: .82, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  if (desktop) {
    const media = gsap.utils.toArray('section img').filter(img => !img.closest('footer') && !img.closest('.service-card, .review-card, .testimonial-card'));
    media.forEach(img => {
      img.classList.add('torrelle-image-mask');
      gsap.to(img, { clipPath: 'inset(0 0 0% 0)', duration: 1.12, ease: 'power3.inOut', scrollTrigger: { trigger: img, start: 'top 88%', once: true } });
      gsap.fromTo(img, { scale: 1.07, yPercent: -3 }, { scale: 1.02, yPercent: 3, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: .8 } });
    });
  }

  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    progress.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')';
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  if (desktop && window.Lenis) {
    const lenis = new Lenis({ duration: 1.02, smoothWheel: true, wheelMultiplier: .82, touchMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
})();
