/**
 * FOSEM CONTROLS — Main Application Logic
 * --------------------------------------
 * Handles:
 * - Header scroll transparency & shadow
 * - Mobile menu & dropdown toggles
 * - Logo tagline interactive toggle
 * - Hero carousel with preloading support
 * - Animation intersection observers
 * - Animated stat counters
 */

document.addEventListener('DOMContentLoaded', () => {
  
  /* --- Navigation & Header --- */
  const header = document.getElementById('site-header');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');
  const logoContainer = document.getElementById('logo-container');
  const logoTagline = document.getElementById('logo-tagline');

  // Scroll transparency & shadow
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile menu toggle
  if (mobileMenuBtn) {
    mobileBtnCallback = () => {
      mainNav.classList.toggle('active'); // CSS might use .open or .active, let's keep both for safety
      mainNav.classList.toggle('open');
      mobileMenuBtn.classList.toggle('active');
    };
    mobileMenuBtn.addEventListener('click', mobileBtnCallback);
  }

  // Mobile dropdown toggles
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

  /* --- Hero Carousel --- */
  const track = document.getElementById('carousel-track');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  
  let currentSlideIndex = 0;
  let carouselInterval = null;
  const totalSlides = slides.length;

  function updateCarousel(index) {
    // Wrap around
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    
    currentSlideIndex = index;

    // Move track (using transform for performance)
    if (track) {
      track.style.transform = `translateX(-${currentSlideIndex * 100}vw)`;
    }

    // Update active states
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlideIndex);
    });
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlideIndex);
    });
  }

  function startAuto() {
    stopAuto();
    carouselInterval = setInterval(() => updateCarousel(currentSlideIndex + 1), 8000);
  }

  function stopAuto() {
    if (carouselInterval) clearInterval(carouselInterval);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateCarousel(currentSlideIndex + 1);
      startAuto();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateCarousel(currentSlideIndex - 1);
      startAuto();
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      updateCarousel(i);
      startAuto();
    });
  });

  // Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;

  if (track) {
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) updateCarousel(currentSlideIndex + 1);
        else updateCarousel(currentSlideIndex - 1);
        startAuto();
      }
    }, { passive: true });
  }

  startAuto();

  /* --- Animation Intersection Observer --- */
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        animationObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach(el => {
    animationObserver.observe(el);
  });

  /* --- Stat Counter Observer --- */
  const statNumbers = document.querySelectorAll('.mv-stat-number');
  let statsStarted = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsStarted) {
        statsStarted = true;
        animateStats();
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  function animateStats() {
    statNumbers.forEach(num => {
      const target = parseInt(num.dataset.target);
      const duration = 2000;
      const start = performance.now();
      num.classList.add('counting');

      const ghost = document.createElement('span');
      ghost.classList.add('mv-stat-ghost');
      num.parentElement.appendChild(ghost);

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(target * ease);
        
        num.textContent = currentValue;
        ghost.textContent = currentValue;
        
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          num.classList.remove('counting');
          ghost.classList.add('ghost-burst');
          setTimeout(() => ghost.remove(), 1000);
        }
      }
      requestAnimationFrame(update);
    });
  }

  const statsContainer = document.querySelector('.mv-stats');
  if (statsContainer) statsObserver.observe(statsContainer);

});
