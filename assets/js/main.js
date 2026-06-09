/**
 * FOSEM CONTROLS — Main Application Logic (Performance-Optimized)
 * ---------------------------------------------------------------
 * Perf changes vs previous version:
 *  - Removed infinite rAF loop (updateScrollFeatures ran every frame)
 *  - Removed canvas particle system (40-particle O(n²) line drawing)
 *  - Removed skewY/scroll velocity card transform (forced layout/reflow)
 *  - Removed typographic elasticity (unnecessary extra observer + setTimeout)
 *  - Replaced raw scroll listener with passive + rAF-gated version
 *  - IntersectionObservers: disconnected after first trigger where possible
 *  - Carousel: setInterval only, no rAF overhead
 *  - All event listeners marked passive where applicable
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Respect reduced-motion preference ─── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Navigation & Header ─── */
  const header        = document.getElementById('site-header');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mainNav       = document.getElementById('main-nav');
  const logoContainer = document.getElementById('logo-container');
  const logoTagline   = document.getElementById('logo-tagline');

  // Throttled scroll handler — only triggers rAF once per frame
  let scrollTicking = false;
  function onScroll() {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 20);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      mainNav.classList.toggle('open');
      mobileMenuBtn.classList.toggle('active');
    });
  }

  // Mobile dropdown toggles (only bind on mobile)
  if (window.innerWidth <= 768) {
    document.querySelectorAll('.nav-item .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        link.parentElement.classList.toggle('active');
      });
    });
  }

  // Logo tagline toggle
  if (logoContainer && logoTagline) {
    let taglineVisible = false;
    logoContainer.addEventListener('click', () => {
      taglineVisible = !taglineVisible;
      logoTagline.classList.toggle('visible', taglineVisible);
    });
  }

  /* ─── Hero Carousel ─── */
  const track      = document.getElementById('carousel-track');
  const slides     = Array.from(document.querySelectorAll('.carousel-slide'));
  const dots       = Array.from(document.querySelectorAll('.carousel-dot'));
  const prevBtn    = document.getElementById('carousel-prev');
  const nextBtn    = document.getElementById('carousel-next');
  const totalSlides = slides.length;
  let currentSlide  = 0;
  let autoTimer     = null;

  function goTo(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;
    if (track) track.style.transform = `translateX(-${currentSlide * 100}vw)`;
    slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
    dots.forEach((d, i)   => d.classList.toggle('active', i === currentSlide));
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(currentSlide + 1), 8000);
  }
  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(currentSlide + 1); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(currentSlide - 1); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAuto(); }));

  // Swipe support
  if (track) {
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) { goTo(currentSlide + (diff > 0 ? 1 : -1)); startAuto(); }
    }, { passive: true });
  }

  startAuto();

  /* ─── Scroll-triggered fade animations ─── */
  // Skip animations entirely if user prefers reduced motion
  if (!prefersReducedMotion) {
    const animObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          obs.unobserve(entry.target); // fire once, then stop watching
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach(el => {
      animObserver.observe(el);
    });
  } else {
    // Immediately show all animated elements for reduced-motion users
    document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach(el => {
      el.classList.add('animate-in');
    });
  }

  /* ─── Stat Counters ─── */
  const statNumbers   = document.querySelectorAll('.mv-stat-number');
  let   statsStarted  = false;

  function animateStats() {
    statNumbers.forEach(num => {
      const target   = parseInt(num.dataset.target, 10);
      const duration = prefersReducedMotion ? 0 : 1800;
      if (duration === 0) { num.textContent = target; return; }

      const start = performance.now();
      num.classList.add('counting');

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3); // cubic ease-out
        num.textContent = Math.round(target * ease);
        if (progress < 1) requestAnimationFrame(tick);
        else              num.classList.remove('counting');
      }
      requestAnimationFrame(tick);
    });
  }

  if (statNumbers.length) {
    const statsContainer = document.querySelector('.mv-stats');
    if (statsContainer) {
      const statsObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !statsStarted) {
          statsStarted = true;
          animateStats();
          statsObs.disconnect();
        }
      }, { threshold: 0.3 });
      statsObs.observe(statsContainer);
    }
  }

  /* ─── Service Card Click-to-Expand ─── */
  const serviceCards = document.querySelectorAll('.svc-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      const wasExpanded = card.classList.contains('expanded');
      serviceCards.forEach(c => c.classList.remove('expanded'));
      if (!wasExpanded) {
        card.classList.add('expanded');
        // Use scrollIntoView only if card is outside viewport
        const rect = card.getBoundingClientRect();
        if (rect.bottom > window.innerHeight || rect.top < 0) {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  });

});
