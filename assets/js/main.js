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
  // Upgrade the visual navigation labels to real, keyboard-operable controls.
  document.querySelectorAll('.nav-item > .nav-link').forEach((trigger, index) => {
    const menu = trigger.parentElement?.querySelector('.dropdown-menu');
    if (!menu) return;

    let control = trigger;
    if (trigger.tagName !== 'BUTTON') {
      control = document.createElement('button');
      control.type = 'button';
      control.className = trigger.className;
      control.innerHTML = trigger.innerHTML;
      trigger.replaceWith(control);
    }

    const menuId = menu.id || `nav-menu-${index + 1}`;
    menu.id = menuId;
    control.setAttribute('aria-haspopup', 'true');
    control.setAttribute('aria-controls', menuId);
    control.setAttribute('aria-expanded', 'false');
  });
  
  /* --- Navigation & Header --- */
  const header = document.getElementById('site-header');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');
  const logoContainer = document.getElementById('logo-container');
  const logoTagline = document.getElementById('logo-tagline');

  const setMobileMenuOpen = (isOpen, { returnFocus = false } = {}) => {
    if (!mainNav || !mobileMenuBtn) return;
    mainNav.classList.toggle('active', isOpen);
    mainNav.classList.toggle('open', isOpen);
    mobileMenuBtn.classList.toggle('active', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    document.body.classList.toggle('nav-open', isOpen && window.innerWidth <= 768);
    if (returnFocus) mobileMenuBtn.focus();
  };
  if (!window.fosemApp) window.fosemApp = {};
  window.fosemApp.setMobileMenuOpen = setMobileMenuOpen;

  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.type = 'button';
    mobileMenuBtn.setAttribute('aria-controls', mainNav.id || 'main-nav');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.setAttribute('aria-label', 'Open navigation menu');
  }

  // Scroll transparency & shadow
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile menu toggle
  if (mobileMenuBtn) {
    const mobileBtnCallback = () => setMobileMenuOpen(mobileMenuBtn.getAttribute('aria-expanded') !== 'true');
    mobileMenuBtn.addEventListener('click', mobileBtnCallback);
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileMenuBtn?.getAttribute('aria-expanded') === 'true') {
      setMobileMenuOpen(false);
    }
  }, { passive: true });

  // Mobile dropdown toggles
  document.querySelectorAll('.nav-item .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const currentItem = link.parentElement;
      const currentMenu = currentItem.querySelector('.dropdown-menu');
      const nextState = link.getAttribute('aria-expanded') !== 'true';

      document.querySelectorAll('.nav-item').forEach(item => {
        const trigger = item.querySelector(':scope > .nav-link');
        const menu = item.querySelector(':scope > .dropdown-menu');
        const isCurrent = item === currentItem && nextState;
        item.classList.toggle('active', isCurrent);
        item.classList.toggle('is-open', isCurrent);
        trigger?.setAttribute('aria-expanded', String(isCurrent));
        if (isCurrent) menu?.classList.remove('force-closed', 'de-emphasized');
      });
    });

    link.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      if (link.getAttribute('aria-expanded') !== 'true') link.click();
      link.parentElement?.querySelector('.dropdown-menu a')?.focus();
    });
  });

  // Logo tagline toggle & goHome
  if (logoContainer) {
    logoContainer.removeAttribute('onclick');
    logoContainer.removeAttribute('style');
    logoContainer.setAttribute('role', 'link');
    logoContainer.setAttribute('tabindex', '0');
    logoContainer.setAttribute('aria-label', 'Fosem Controls home');
    const activateLogo = (event) => {
      event.preventDefault();
      const homeView = document.getElementById('home-view');
      const solView = document.getElementById('solutions-view');
      if (homeView && solView) {
        if (!solView.classList.contains('view-hidden')) window.fosemApp.goHome();
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.location.href = 'index.html';
      }
    };
    logoContainer.addEventListener('click', activateLogo);
    logoContainer.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') activateLogo(event);
    });
    logoTagline?.setAttribute('aria-hidden', 'true');
  }

  /* --- Hero Carousel --- */
  const track = document.getElementById('carousel-track');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  
  let currentSlideIndex = 0;
  let carouselInterval = null;
  let carouselPreloadTimer = null;
  let carouselIsVisible = true;
  const totalSlides = slides.length;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function hydrateSlide(index) {
    if (!totalSlides) return;
    const normalizedIndex = (index + totalSlides) % totalSlides;
    const image = slides[normalizedIndex]?.querySelector('img[data-src]');
    if (!image) return;
    if (image.dataset.srcset) image.srcset = image.dataset.srcset;
    image.src = image.dataset.src;
    image.removeAttribute('data-src');
    image.removeAttribute('data-srcset');
  }

  function updateCarousel(index) {
    // Wrap around
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    hydrateSlide(index);
    
    currentSlideIndex = index;

    // Move track (using transform for performance)
    if (track) {
      track.style.transform = `translateX(-${currentSlideIndex * 100}vw)`;
    }

    // Update active states
    slides.forEach((slide, i) => {
      const isActive = i === currentSlideIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
    
    dots.forEach((dot, i) => {
      const isActive = i === currentSlideIndex;
      dot.classList.toggle('active', isActive);
      if (isActive) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function startAuto() {
    stopAuto();
    if (totalSlides <= 1 || reducedMotionQuery.matches || document.hidden || !carouselIsVisible) return;
    const nextIndex = (currentSlideIndex + 1) % totalSlides;
    carouselPreloadTimer = window.setTimeout(() => hydrateSlide(nextIndex), 5000);
    carouselInterval = window.setTimeout(() => {
      updateCarousel(nextIndex);
      startAuto();
    }, 8000);
  }

  function stopAuto() {
    if (carouselInterval) clearTimeout(carouselInterval);
    if (carouselPreloadTimer) clearTimeout(carouselPreloadTimer);
    carouselInterval = null;
    carouselPreloadTimer = null;
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
    dot.addEventListener('pointerenter', () => hydrateSlide(i), { passive: true });
    dot.addEventListener('focus', () => hydrateSlide(i));
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

  const carouselWrapper = document.querySelector('.carousel-wrapper');
  if (carouselWrapper && totalSlides > 1) {
    carouselWrapper.addEventListener('mouseenter', stopAuto);
    carouselWrapper.addEventListener('mouseleave', startAuto);
    carouselWrapper.addEventListener('focusin', stopAuto);
    carouselWrapper.addEventListener('focusout', (event) => {
      if (!carouselWrapper.contains(event.relatedTarget)) startAuto();
    });
    carouselWrapper.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        updateCarousel(currentSlideIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        updateCarousel(currentSlideIndex + 1);
      }
    });

    const carouselVisibilityObserver = new IntersectionObserver(([entry]) => {
      carouselIsVisible = entry.isIntersecting;
      if (carouselIsVisible) startAuto();
      else stopAuto();
    }, { threshold: 0.05 });
    carouselVisibilityObserver.observe(carouselWrapper);
  }

  document.addEventListener('visibilitychange', () => document.hidden ? stopAuto() : startAuto());
  reducedMotionQuery.addEventListener?.('change', () => reducedMotionQuery.matches ? stopAuto() : startAuto());
  updateCarousel(0);
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

  if (!window.fosemApp) window.fosemApp = {};
  window.fosemApp.animationObserver = animationObserver;

  document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach(el => {
    animationObserver.observe(el);
  });

  // Fallback: immediately animate elements already in the viewport on load
  // The IntersectionObserver may miss elements that are already visible when it attaches
  setTimeout(() => {
    document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('animate-in');
      }
    });
  }, 100);

  /* --- Services Row Reveal Observer --- */
  const serviceCards = Array.from(document.querySelectorAll('.services-new-grid .service-new-card'));
  if (serviceCards.length > 0) {
    const rows = [];
    for (let i = 0; i < serviceCards.length; i += 3) {
      rows.push(serviceCards.slice(i, i + 3));
    }

    const rowAnimated = Array(rows.length).fill(false);

    const rowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const rowIndex = rows.findIndex(row => row.includes(card));
          if (rowIndex !== -1 && !rowAnimated[rowIndex]) {
            rowAnimated[rowIndex] = true;
            const rowCards = rows[rowIndex];
            const isEvenRow = rowIndex % 2 === 1; // 0-indexed: Row 0 Odd (L-to-R), Row 1 Even (R-to-L)

            let staggerOrder;
            if (isEvenRow) {
              staggerOrder = [2, 1, 0]; // Right card first (index 2), Middle second (index 1), Left third (index 0)
            } else {
              staggerOrder = [0, 1, 2]; // Left card first (index 0), Middle second (index 1), Right third (index 2)
            }

            rowCards.forEach((c, indexInRow) => {
              const positionInOrder = staggerOrder.indexOf(indexInRow);
              const delay = positionInOrder * 220; // 220ms delay between cards
              
              // Set delay via transitionDelay style property
              c.style.transitionDelay = `${delay}ms`;
              c.classList.add('animate-in');
              
              // Clean up inline delay after animation finishes so hover has no delay
              setTimeout(() => {
                c.style.transitionDelay = '';
              }, delay + 1100);

              rowObserver.unobserve(c);
            });
          }
        }
      });
    }, {
      threshold: 0.20, // trigger when ~20% visible
      rootMargin: '0px 0px -40px 0px'
    });

    serviceCards.forEach(card => {
      rowObserver.observe(card);
    });

    // Fallback: immediately trigger animation for rows visible on page load
    setTimeout(() => {
      rows.forEach((rowCards, rowIndex) => {
        if (!rowAnimated[rowIndex]) {
          const firstCard = rowCards[0];
          const rect = firstCard.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            rowAnimated[rowIndex] = true;
            const isEvenRow = rowIndex % 2 === 1;
            const staggerOrder = isEvenRow ? [2, 1, 0] : [0, 1, 2];
            rowCards.forEach((c, indexInRow) => {
              const positionInOrder = staggerOrder.indexOf(indexInRow);
              const delay = positionInOrder * 220;
              c.style.transitionDelay = `${delay}ms`;
              c.classList.add('animate-in');
              setTimeout(() => {
                c.style.transitionDelay = '';
              }, delay + 1100);
              rowObserver.unobserve(c);
            });
          }
        }
      });
    }, 150);
  }

  document.querySelectorAll('.expandable-card .read-more-label').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.expandable-card');
      if (!card) return;
      const nextExpanded = !card.classList.contains('expanded');
      card.classList.toggle('expanded', nextExpanded);
      button.setAttribute('aria-expanded', String(nextExpanded));
      button.textContent = nextExpanded ? 'Show less' : 'Read more';
    });
  });

  /* --- Stat Counter Observer --- */
  const statNumbers = document.querySelectorAll('.mv-stat-number');
  let statsStarted = false;
  if (!reducedMotionQuery.matches) {
    statNumbers.forEach(num => { num.textContent = '0'; });
  }

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
      if (reducedMotionQuery.matches) {
        num.textContent = target;
        return;
      }
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

  /* --- Mission statement progressive disclosure --- */
  const missionToggle = document.querySelector('.mv-read-more');
  const missionCard = document.getElementById('mv-card-mission');
  const missionStatement = document.getElementById('mission-statement');

  if (missionToggle && missionCard && missionStatement) {
    const syncMissionExpandedHeight = () => {
      missionStatement.style.setProperty('--mission-expanded-height', `${missionStatement.scrollHeight}px`);
    };

    missionToggle.addEventListener('click', () => {
      const isExpanded = missionToggle.getAttribute('aria-expanded') === 'true';
      const nextExpandedState = !isExpanded;

      syncMissionExpandedHeight();
      missionToggle.setAttribute('aria-expanded', String(nextExpandedState));
      missionCard.classList.toggle('is-expanded', nextExpandedState);
      missionStatement.classList.toggle('is-expanded', nextExpandedState);
      missionToggle.querySelector('span').textContent = nextExpandedState ? 'Read less' : 'Read more';
    });

    let missionResizeFrame;
    window.addEventListener('resize', () => {
      if (missionToggle.getAttribute('aria-expanded') !== 'true') return;
      cancelAnimationFrame(missionResizeFrame);
      missionResizeFrame = requestAnimationFrame(syncMissionExpandedHeight);
    });
  }

});





/* ============================================
   FOSEM CONTROLS — SPA Navigation & Content Logic
   ============================================ */

const solutionsData = {
  'security-solutions': {
    title: 'Security Solutions',
    desc: 'Fosem Controls engineers and deploys enterprise-grade security architecture. From perimeter intrusion detection to unified surveillance command centers, we provide uncompromising operational visibility and control.',
    heroImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1600&q=80',
    how: 'Every security deployment begins with a rigorous threat and vulnerability assessment of your facility. Fosem engineers then design a heavily redundant, micro-segmented network topology specifically for your surveillance and access control hardware. We seamlessly integrate globally trusted OEM equipment, ensuring zero blind spots and absolute data integrity. Our internationally certified teams handle the entire installation process, from complex civil works and structured cabling to the final software commissioning. Following handover, our Network Operations Center provides continuous remote monitoring, ensuring rapid field response and preventative maintenance to keep your high-risk environments secure around the clock.',
    deliverables: [
{ title: 'Video Surveillance', desc: 'High-definition IP camera networks with AI-driven analytics.' },
      { title: 'Access Control', desc: 'Biometric and credential-based physical access management.' },
      { title: 'Intrusion Detection', desc: 'Perimeter and interior sensors linked to central command.' },
      { title: 'Visitor Management', desc: 'Automated tracking and auditing for facility guests.' },
      { title: 'Command Centre Integration', desc: 'Single-pane-of-glass platforms aggregating all security data.' },
      { title: 'Preventive Maintenance', desc: 'Scheduled servicing and immediate incident response SLA.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  'building-systems': {
    title: 'Building Systems',
    desc: 'Fosem Controls transforms complex commercial facilities into highly efficient, unified environments. We engineer intelligent automation systems that drastically reduce energy consumption while maximizing mechanical asset lifespan.',
    heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    how: 'Fosem approaches building automation as a holistic engineering challenge. We analyze your existing mechanical, electrical, and plumbing assets to design a unified control architecture based on open protocols like BACnet and KNX. Our engineers program intelligent, dynamic policies that automatically adapt HVAC, lighting, and power distribution to real-time facility occupancy and environmental conditions. We handle the complete integration—installing field sensors, programming programmable logic controllers, and commissioning the central management platform. Post-deployment, our team conducts continuous energy audits and predictive maintenance, ensuring your building operates at peak efficiency while lowering operational expenditure.',
    deliverables: [
      { title: 'Building Management Systems', desc: 'Centralized platforms for complete facility oversight.' },
      { title: 'HVAC Automation', desc: 'Dynamic climate control based on live occupancy metrics.' },
      { title: 'Lighting Control', desc: 'Automated daylight harvesting and scheduled illumination.' },
      { title: 'Energy Monitoring', desc: 'Granular tracking of power consumption across all zones.' },
      { title: 'Environmental Controls', desc: 'Precision temperature and humidity regulation for critical areas.' },
      { title: 'Centralised Monitoring', desc: 'Real-time alerting for mechanical faults and inefficiencies.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  'infrastructure': {
    title: 'Infrastructure',
    desc: 'Fosem Controls designs and deploys the physical digital backbone for modern enterprises. We engineer highly resilient, future-proof networks capable of supporting mission-critical, high-bandwidth operations.',
    heroImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80',
    how: 'Every infrastructure project begins with rigorous capacity planning and spatial design. Fosem engineers map out resilient, redundant network topologies that eliminate single points of failure. We deploy certified teams to execute precision structured cabling, fiber-optic splicing, and active switching installations, strictly adhering to BICSI and TIA/EIA international standards. Beyond cabling, we construct complete data center environments, including raised flooring, precision cooling, and uninterruptible power. Upon completion, every node and link is Fluke-tested and certified, providing you with a fully documented, robust foundation ready to support your most demanding enterprise applications.',
    deliverables: [
      { title: 'Data Center Buildouts', desc: 'Complete facility engineering including power and cooling.' },
      { title: 'Structured Cabling', desc: 'Certified copper and fiber-optic backbone installations.' },
      { title: 'Core Switching', desc: 'High-throughput, redundant enterprise network distribution.' },
      { title: 'Secure Architecture', desc: 'Micro-segmented networks designed with zero-trust principles.' },
      { title: 'Wireless LAN', desc: 'High-density, low-latency wireless coverage for large campuses.' },
      { title: 'Performance Certification', desc: 'Rigorous testing and documentation of all physical links.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  'energy': {
    title: 'Energy',
    desc: 'Fosem Controls engineers highly reliable, sustainable power architectures. We integrate commercial renewables, battery storage, and traditional generation to guarantee absolute power resilience.',
    heroImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=80',
    how: "Every power project begins with deep analysis of your facility's load profile, identifying peak demands and critical operational dependencies. We then engineer a bespoke hybrid power architecture that intelligently synchronizes grid power, diesel generation, solar PV arrays, and battery energy storage systems (BESS). Our certified technicians handle the complex high-tension electrical integration, ensuring seamless, zero-millisecond failovers during utility outages. We configure advanced SCADA systems to provide you with live telemetry on power generation, storage health, and consumption, backed by our maintenance teams who ensure your power infrastructure operates flawlessly year-round.",
    deliverables: [
      { title: 'Hybrid Power Integration', desc: 'Seamless synchronization of grid, solar, and generator power.' },
      { title: 'Battery Storage (BESS)', desc: 'Industrial-scale energy storage for peak shaving and backup.' },
      { title: 'Solar PV Arrays', desc: 'Commercial solar generation designed for maximum yield.' },
      { title: 'Uninterruptible Power', desc: 'Enterprise UPS systems protecting mission-critical assets.' },
      { title: 'Load Profiling', desc: 'Precision engineering based on exact facility power draw.' },
      { title: 'Remote Telemetry', desc: 'Live monitoring of generation, storage, and consumption.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  'mep': {
    title: 'MEP',
    desc: 'Professional MEP systems covering mechanical, electrical, and plumbing needs for commercial and institutional facilities.',
    heroImage: 'assets/images/engineering_airport.webp',
    how: 'We provide end-to-end mechanical, electrical, and plumbing engineering. Our certified teams design, install, and integrate complex HVAC, electrical power grids, and sanitation networks. From initial load planning to system commissioning, we ensure compliance with international construction standards and optimal facility utility performance.',
    deliverables: [
      { title: 'Mechanical Systems', desc: 'Centralized heating, cooling, and ventilation designs.' },
      { title: 'Electrical Engineering', desc: 'Secure power distribution, wiring, and safety grids.' },
      { title: 'Plumbing & Sanitation', desc: 'Efficient water supply, drainage, and waste management.' },
      { title: 'Code Compliance', desc: 'Strict adherence to local building and safety codes.' },
      { title: 'Preventive Maintenance', desc: 'Regular inspections and servicing of mechanical units.' },
      { title: 'Facility Management Integration', desc: 'Connecting mechanical systems to building automation.' }
    ],
    gallery: [
      'assets/images/service-installation.webp',
      'assets/images/service-commissioning.webp'
    ]
  },
  'access-control': {
    title: 'Access Control',
    desc: 'Enterprise-grade credentialing, identity verification, and physical access barrier management designed to safeguard critical assets and facilities.',
    heroImage: 'assets/images/solutions/access-control.webp',
    how: 'Fosem engineers design access control systems with safety, security, and traceability in mind. We assess entry and exit points across your facilities, designing a secure topology bridging RFID readers, biometric scanning, and mobile credentials. We handle the complete electrical and mechanical integration, installing turnstiles, electromagnetic locks, and barrier gates linked with emergency fire override controls. Our software deployments centralize management, offering real-time auditing and automated directory sync.',
    deliverables: [
      { title: 'Biometric Readers', desc: 'Fingerprint, facial recognition, and iris credential scanners.' },
      { title: 'Mobile Credentials', desc: 'Secure smartphone-based Bluetooth and NFC access.' },
      { title: 'Physical Barriers', desc: 'High-throughput optical turnstiles and security speed gates.' },
      { title: 'Visitor Management', desc: 'Self-service kiosks and automated digital guest badging.' },
      { title: 'Unified Control Software', desc: 'Centralized management dashboards with instant activity logs.' },
      { title: 'Compliance & Audits', desc: 'Ensuring life safety, ADA compliance, and data privacy audits.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  'fire-safety': {
    title: 'Fire Safety',
    desc: 'Code-compliant addressable fire detection networks, automated suppression integration, and rapid-response life safety notification systems.',
    heroImage: 'assets/images/solutions/fire-detection-safety.webp',
    how: "Fosem approaches fire protection with zero compromise. We perform code validation and draft cause-and-effect matrix plans for complex facilities. Our certified teams install addressable alarm systems and VESDA early warning smoke detection in high-value environments. We execute the integrations with HVAC dampers, elevator recall, and access control overrides to guarantee automatic containment during emergency triggers.",
    deliverables: [
      { title: 'Addressable Panels', desc: 'Pinpoint device location mapping for fast hazard response.' },
      { title: 'Aspirating Detection', desc: 'VESDA air sampling networks for ultra-early warning.' },
      { title: 'HVAC & Vent Control', desc: 'Automatic fan and smoke damper actuation controls.' },
      { title: 'Suppression Integration', desc: 'Clean agent gaseous fire extinguishing triggers.' },
      { title: 'Emergency Audio Evac', desc: 'Voice evacuation and public address announcement feeds.' },
      { title: 'SLA Inspections', desc: 'Routine preventative testing conforming to local regulations.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1620023647180-60b13d50f7ff?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  'automation-systems': {
    title: 'Automation Systems',
    desc: 'Programmable Logic Controller (PLC) systems, SCADA telemetry platforms, and centralized mechanical-electrical coordination frameworks.',
    heroImage: 'assets/images/solutions/automation-system.webp',
    how: 'We streamline facility operations by integrating mechanical-electrical components under high-availability automation logic. Our engineers program rugged PLCs and design intuitive SCADA HMI interfaces to map all mechanical, power, and thermal assets. We deploy edge-gateway routers to gather and analyze fieldbus telemetry (Modbus, BACnet, Profibus), giving operators unified oversight of critical systems.',
    deliverables: [
      { title: 'PLC Development', desc: 'Custom logic control scripts engineered for industrial hardware.' },
      { title: 'SCADA Telemetry', desc: 'Rich visualization screens mapping facility sensor nodes.' },
      { title: 'Motor & Drive Control', desc: 'VFD calibration to balance motor loads and save power.' },
      { title: 'Industrial Gateways', desc: 'Secure communication conversion bridging legacy protocols.' },
      { title: 'Process Optimisation', desc: 'Tuning feedback loops (PID) to reduce system wear.' },
      { title: 'Routine Diagnostics', desc: 'Periodic firmware updates and input-output loop validation.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  'cctv-surveillance': {
    title: 'CCTV & Surveillance',
    desc: 'High-definition network IP video architectures combined with edge AI analytics and centralized storage command structures.',
    heroImage: 'assets/images/solutions/cctv-surveillance.webp',
    how: 'Our surveillance team engineers systems tailored for high-risk and high-density areas. We analyze lens focal lengths and coverage zones to design IP camera distributions with zero blind spots. We configure robust network storage arrays (NVR/SAN), set up automated failovers, and integrate advanced edge-analytics like path-intrusion detection, facial matching, and automated license-plate recognition (LPR).',
    deliverables: [
      { title: 'Ultra-HD IP Cameras', desc: 'Low-light, 4K, and thermal cameras for extreme conditions.' },
      { title: 'Edge AI Analytics', desc: 'Intelligent filters for motion, intrusion, and facial logs.' },
      { title: 'Network Recording', desc: 'Redundant high-capacity storage servers with hot-swaps.' },
      { title: 'Control Room Video Walls', desc: 'High-density displays integrated into central desks.' },
      { title: 'Video Encription', desc: 'Zero-trust stream encryption preventing stream hijacking.' },
      { title: 'SLA Support', desc: 'Immediate lens cleaning, re-focus checks, and storage health audits.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80'
    ]
  }
};

/* Product catalogue presented in the Products & Solutions navigation. */
solutionsData['security-integrated-solutions'] = {
  ...solutionsData['security-solutions'],
  title: 'Security Integrated Solutions',
  desc: 'Unified physical-security architecture connecting surveillance, access control, alarms, intercoms, analytics, and command-centre operations into one accountable system.',
  heroImage: 'assets/images/integrated_security_ecosystem.webp',
  how: 'Fosem begins with a site-wide threat and operational assessment, then develops a coordinated security architecture with clear device, network, control-room, and response requirements. We integrate surveillance, access control, perimeter detection, alarm monitoring, visitor management, and communications on resilient infrastructure. Each subsystem is tested independently and as part of the complete operating workflow before handover, documentation, training, and ongoing maintenance support.'
};

solutionsData['cctv-surveillance'] = {
  ...solutionsData['cctv-surveillance'],
  title: 'CCTV and Surveillance'
};

solutionsData['fire-detection-safety-systems'] = {
  ...solutionsData['fire-safety'],
  title: 'Fire Detection and Safety Systems',
  desc: 'Addressable fire detection, early-warning monitoring, evacuation notification, and life-safety integrations engineered for rapid, coordinated emergency response.'
};

solutionsData['automation-system'] = {
  ...solutionsData['automation-systems'],
  title: 'Automation System',
  desc: 'Centralised automation for building, electrical, mechanical, and operational systems, providing reliable control, live status visibility, and measurable efficiency.'
};

solutionsData['alarm-systems'] = {
  title: 'Alarm Systems',
  desc: 'Professionally engineered intrusion, duress, perimeter, and critical-event alarm systems with dependable verification, escalation, and response workflows.',
  heroImage: 'assets/images/solutions/alarm-systems.webp',
  how: 'We assess the facility, identify protected zones and response priorities, and design an alarm architecture around the actual operating risk. Detection devices, panic controls, control panels, communications paths, and monitoring software are configured with clear alarm priorities and escalation procedures. Every zone is commissioned through activation testing, signal verification, backup-power checks, user training, and documented maintenance schedules.',
  deliverables: [
    { title: 'Intrusion Detection', desc: 'Door, window, motion, vibration, and glass-break detection for protected areas.' },
    { title: 'Perimeter Alarms', desc: 'Early warning for fences, gates, external approaches, and restricted zones.' },
    { title: 'Panic & Duress', desc: 'Fixed and wireless emergency controls for staff and high-risk locations.' },
    { title: 'Central Monitoring', desc: 'Prioritised alarm events, audit trails, and operator response workflows.' },
    { title: 'Resilient Communications', desc: 'Multi-path IP and cellular signalling with supervised backup power.' },
    { title: 'Testing & Maintenance', desc: 'Routine device testing, battery checks, reporting, and corrective support.' }
  ],
  gallery: [
    'assets/images/integrated_security_ecosystem.webp',
    'assets/images/slide2-surveillance-new.webp'
  ]
};

solutionsData['renewable-energy'] = {
  ...solutionsData['energy'],
  title: 'Renewable Energy',
  desc: 'Commercial solar, battery storage, hybrid generation, and energy monitoring systems designed for dependable power, lower operating costs, and long-term resilience.',
  heroImage: 'assets/images/slide5-renewable-energy.webp'
};

solutionsData['vehicles-management-system'] = {
  title: 'Vehicles Management System',
  desc: 'Integrated fleet visibility, vehicle access, driver accountability, route monitoring, and security controls for safer and more efficient transport operations.',
  heroImage: 'assets/images/engineering_airport.webp',
  how: 'Fosem maps each fleet workflow—from dispatch and authorised use to site entry, route activity, and incident review—before selecting the required telematics and security controls. GPS devices, driver identification, geofencing, vehicle access, cameras, and management software are integrated into a single operational view. The system is configured with practical alerts and reports, then validated through live route, communication, and exception testing before operator training and handover.',
  deliverables: [
    { title: 'Live Vehicle Tracking', desc: 'Real-time fleet location, route history, geofencing, and movement alerts.' },
    { title: 'Vehicle Access Control', desc: 'Authorised entry using tags, ANPR, barriers, and registered vehicle records.' },
    { title: 'Driver Monitoring', desc: 'Driver identification, behaviour events, utilisation, and accountability reporting.' },
    { title: 'Mobile Video', desc: 'On-vehicle cameras and event footage for safety and incident investigation.' },
    { title: 'Operational Alerts', desc: 'Speed, route, idle-time, unauthorised-use, and maintenance notifications.' },
    { title: 'Fleet Reporting', desc: 'Central dashboards for trip, utilisation, incident, and compliance records.' }
  ],
  gallery: [
    'assets/images/engineering_airport.webp',
    'assets/images/engineering_soc.webp'
  ]
};

solutionsData['it-structural-cabling'] = {
  ...solutionsData['infrastructure'],
  title: 'IT and Structural Cabling',
  desc: 'Certified copper, fibre, wireless, server-room, and voice-data infrastructure forming a reliable digital backbone for modern facilities.',
  heroImage: 'assets/images/engineering_datacenter.webp',
  how: 'We survey the facility, document capacity and service requirements, and design an organised cable and network architecture with defined pathways, distribution points, cabinets, labelling, grounding, and redundancy. Certified teams install and terminate copper and fibre links, configure racks and active network equipment, and validate every connection through professional testing. The completed system is delivered with test results, schedules, as-built records, and a clear maintenance plan.',
  deliverables: [
    { title: 'Server & Network Rooms', desc: 'Organised racks, cabinets, patching, power, cooling coordination, and monitoring.' },
    { title: 'Copper Cabling', desc: 'Standards-compliant Category 6 and Category 6A voice-data installations.' },
    { title: 'Fibre Backbone', desc: 'Single-mode and multimode fibre installation, splicing, termination, and testing.' },
    { title: 'Pathways & Labelling', desc: 'Managed containment, identification, schedules, and maintainable cable routing.' },
    { title: 'Wireless Infrastructure', desc: 'Access-point cabling and network foundations for reliable facility coverage.' },
    { title: 'Certification & Records', desc: 'Link certification, as-built drawings, port schedules, and handover documentation.' }
  ],
  gallery: [
    'assets/images/engineering_datacenter.webp',
    'assets/images/service-installation.webp'
  ]
};

/* Curated solution photography gives each service a clear, real-world context. */
const solutionHeroImages = {
  'security-integrated-solutions': 'assets/images/integrated_security_ecosystem.webp',
  'mep': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=85',
  'renewable-energy': 'https://images.unsplash.com/photo-1514488034139-5905ab173d22?auto=format&fit=crop&w=1400&q=85',
  'vehicles-management-system': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=85',
  'it-structural-cabling': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=85'
};

Object.entries(solutionHeroImages).forEach(([solutionKey, imageUrl]) => {
  if (solutionsData[solutionKey]) solutionsData[solutionKey].heroImage = imageUrl;
});

/* Small inline SVGs avoid a separate icon-font request while keeping every
   solution capability visually distinct. */
const solutionIconRules = [
  { pattern: /video|camera|surveillance/i, icon: 'videocam' },
  { pattern: /access|biometric|credential|visitor|barrier|driver/i, icon: 'badge' },
  { pattern: /fire|suppression|evac|aspirat/i, icon: 'local_fire_department' },
  { pattern: /alarm|intrusion|perimeter|panic|duress/i, icon: 'notifications_active' },
  { pattern: /solar|photovoltaic|\bpv\b/i, icon: 'solar_power' },
  { pattern: /battery|power|electrical|energy|ups|motor|drive/i, icon: 'bolt' },
  { pattern: /server|network|cabling|fibre|fiber|copper|wireless|switching|gateway/i, icon: 'hub' },
  { pattern: /mechanical|plumbing|sanitation|hvac|vent|cooling|temperature|humidity/i, icon: 'engineering' },
  { pattern: /monitor|telemetry|report|analytics|tracking|scada|profiling|dashboard/i, icon: 'analytics' },
  { pattern: /automation|control|lighting|logic|plc|integration|command centre|building management/i, icon: 'settings' },
  { pattern: /test|maintenance|support|compliance|audit|certification|diagnostic|inspection|record/i, icon: 'verified' },
  { pattern: /secure|safety|protection|encryption/i, icon: 'shield' }
];

const solutionIconFor = (deliverableTitle) => {
  const match = solutionIconRules.find(({ pattern }) => pattern.test(deliverableTitle));
  return match ? match.icon : 'shield';
};

const solutionIconPaths = {
  videocam: '<rect x="3" y="6" width="12" height="12" rx="2"/><path d="m15 10 6-3v10l-6-3z"/>',
  badge: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="9" r="2.5"/><path d="M8.5 16c.8-2.3 6.2-2.3 7 0"/>',
  local_fire_department: '<path d="M13.5 3.5c.8 3.2-.6 4.6-2 6.2-.7-1.6-1.8-2.5-3.1-3.3.1 2.9-3.4 4.8-2.4 9.2A6.3 6.3 0 0 0 18.3 13c.1-3.6-2.1-6.5-4.8-9.5Z"/><path d="M10 17.5c0-1.6 1-2.7 2-3.8 1 1.1 2 2.2 2 3.8a2 2 0 0 1-4 0Z"/>',
  notifications_active: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4M4.5 4.5 3 3m16.5 1.5L21 3"/>',
  solar_power: '<circle cx="6" cy="6" r="2.5"/><path d="M6 1v1M6 10v1M1 6h1m8 0h1M2.5 2.5l.7.7m5.6 5.6.7.7M9.5 2.5l-.7.7M3.2 8.8l-.7.7M5 14h14l2 7H3zM8 14l-1 7m9-7 1 7m-13-3h16"/>',
  bolt: '<path d="m13 2-8 12h7l-1 8 8-12h-7z"/>',
  hub: '<circle cx="12" cy="12" r="3"/><circle cx="4" cy="5" r="2"/><circle cx="20" cy="5" r="2"/><circle cx="4" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><path d="m6 6.5 4 3.5m8-3.5-4 3.5m-8 7.5 4-3.5m8 3.5-4-3.5"/>',
  engineering: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2.2 2.2M16.8 16.8 19 19M19 5l-2.2 2.2M7.2 16.8 5 19"/>',
  analytics: '<path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/><path d="m4 7 5-4 5 4 6-5"/>',
  settings: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="11" cy="18" r="2" fill="currentColor" stroke="none"/>',
  verified: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.7 2.7L16.5 9"/>',
  shield: '<path d="M12 3 4 6v5c0 5.3 3.4 8.7 8 10 4.6-1.3 8-4.7 8-10V6z"/><path d="m8.5 12 2.3 2.3 4.7-5"/>'
};

const inlineSolutionIcon = (deliverableTitle) => {
  const iconName = solutionIconFor(deliverableTitle);
  const paths = solutionIconPaths[iconName] || solutionIconPaths.shield;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">${paths}</svg>`;
};

if (!window.fosemApp) window.fosemApp = {};
Object.assign(window.fosemApp, {
  renderContent: function(data, isInitialLoad) {
    const container = document.getElementById('solutions-content');
    
    const applyHtml = () => {
      let html = `
        <!-- 1. Solution brief -->
        <section class="sol-hero sol-hero--editorial fade-up" data-image-shape="balanced">
          <div class="sol-hero-text fade-left" style="--stagger: 100ms">
            <p class="sol-hero-kicker">Integrated systems expertise</p>
            <h1 class="sol-hero-title">${data.title}</h1>
            <p class="sol-hero-desc">${data.desc}</p>
          </div>
          <div class="sol-hero-image-wrapper scale-in" style="--stagger: 200ms">
            <div class="sol-hero-image-viewport">
              <img src="${data.heroImage}" alt="${data.title}" class="sol-hero-image" loading="lazy" decoding="async">
            </div>
          </div>
        </section>

        <!-- 2. How Fosem Delivers -->
        <section class="sol-section sol-section--split fade-up">
          <div class="sol-section-intro">
            <p class="sol-section-label">Project approach</p>
            <h2 class="sol-section-title">How Fosem Delivers This Solution</h2>
          </div>
          <div class="sol-how">
            <p>${data.how}</p>
          </div>
        </section>

        <!-- 3. What We Deliver -->
        <section class="sol-section sol-section--deliverables fade-up">
          <div class="sol-section-heading">
            <h2 class="sol-section-title">What We Deliver</h2>
            <p>Every component is engineered as part of one coordinated, maintainable solution.</p>
          </div>
          <div class="sol-deliverables-grid" role="list">
            ${data.deliverables.map((d, index) => `
              <article class="sol-deliverable fade-up" role="listitem" style="--stagger: ${(index % 3 + 1) * 100}ms">
                <span class="sol-deliverable-icon" aria-hidden="true">${inlineSolutionIcon(d.title)}</span>
                <div class="sol-deliverable-copy">
                  <h3>${d.title}</h3>
                  <p>${d.desc}</p>
                </div>
              </article>
            `).join('')}
          </div>
        </section>

        <!-- 4. Consultation -->
        <section class="sol-consultation fade-up">
          <div class="sol-consultation-copy">
            <h2 class="sol-consultation-title">Ready to discuss your project?</h2>
            <p>Talk with our engineering team to design a solution tailored to your requirements.</p>
          </div>
          <div class="sol-consultation-actions">
            <a href="mailto:engineering@fosemcontrols.com" class="sol-btn-primary">Request Consultation<span class="sol-arrow-icon" aria-hidden="true">→</span></a>
          </div>
        </section>
      `;

      container.innerHTML = html;

      const hero = container.querySelector('.sol-hero--editorial');
      const heroImage = container.querySelector('.sol-hero-image');
      const fitHeroFrameToImage = () => {
        if (!hero || !heroImage || !heroImage.naturalWidth || !heroImage.naturalHeight) return;

        const width = heroImage.naturalWidth;
        const height = heroImage.naturalHeight;
        const ratio = width / height;
        const shape = ratio < 0.84
          ? 'portrait'
          : ratio < 1.16
            ? 'square'
            : ratio > 1.85
              ? 'panorama'
              : 'landscape';

        hero.dataset.imageShape = shape;
        hero.style.setProperty('--sol-image-ratio', `${width} / ${height}`);
        heroImage.width = width;
        heroImage.height = height;
      };

      if (heroImage?.complete) fitHeroFrameToImage();
      else heroImage?.addEventListener('load', fitHeroFrameToImage, { once: true });

      document.querySelector('.sol-content-area').scrollTo({ top: 0, behavior: 'instant' });
      
      // Observe all dynamic fade-up/scale-in elements inside solutions-content
      if (window.fosemApp.animationObserver) {
        container.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach(el => {
          window.fosemApp.animationObserver.observe(el);
        });
      }

      // Check visible elements immediately
      setTimeout(() => {
        container.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('animate-in');
          }
        });
      }, 100);

      container.classList.remove('animating-out');
      container.classList.add('animating-in');
      void container.offsetWidth;
      container.classList.remove('animating-in');
    };

    if (isInitialLoad) {
      applyHtml();
    } else {
      container.classList.add('animating-out');
      setTimeout(applyHtml, 300);
    }
  },

  updateSidebarState: function(solutionKey) {
    const buttons = document.querySelectorAll('.sol-nav-btn');
    buttons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-sol') === solutionKey) {
        btn.classList.add('active');
      }
    });
  },

  loadSolution: function(solutionKey) {
    const data = solutionsData[solutionKey];
    if (!data) return;
    this.currentSolution = solutionKey;

    const homeView = document.getElementById('home-view');
    const solView = document.getElementById('solutions-view');
    document.querySelector('.skip-link')?.setAttribute('href', '#solutions-view');

    // If we are on a static subpage, redirect to index.html with hash
    if (!homeView || !solView) {
      window.location.href = `index.html#${solutionKey}`;
      return;
    }

    this.updateSidebarState(solutionKey);

    // Update location hash silently for deep linking
    if (window.location.hash !== `#${solutionKey}`) {
      window.history.pushState(null, '', `#${solutionKey}`);
    }

    const isInitialLoad = !homeView.classList.contains('view-hidden');

    if (isInitialLoad) {
      homeView.style.opacity = '0';
      setTimeout(() => {
        homeView.classList.add('view-hidden');
        this.renderContent(data, true);
        solView.classList.remove('view-hidden');
        void solView.offsetWidth;
        solView.style.opacity = '1';
      }, 300);
    } else {
      this.renderContent(data, false);
    }

    // Close mobile menu if open
    document.getElementById('main-nav')?.classList.remove('active');
    document.getElementById('main-nav')?.classList.remove('open');
    document.getElementById('mobile-menu-btn')?.classList.remove('active');
    
    // Add detail-active for mobile master-detail layout
    document.querySelector('.sol-layout-wrapper')?.classList.add('detail-active');
  },

  goHome: function() {
    const homeView = document.getElementById('home-view');
    const solView = document.getElementById('solutions-view');
    document.querySelector('.skip-link')?.setAttribute('href', '#home-view');
    
    // Clear hash silently
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
    
    // Reset mobile detail view state
    document.querySelector('.sol-layout-wrapper')?.classList.remove('detail-active');
    
    if (solView && !solView.classList.contains('view-hidden')) {
      solView.style.opacity = '0';
      setTimeout(() => {
        solView.classList.add('view-hidden');
        if (homeView) {
          homeView.classList.remove('view-hidden');
          void homeView.offsetWidth;
          homeView.style.opacity = '1';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  },

  triggerCardFocus: function(targetId) {
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    // Clear any active focus cleanup timeout to prevent interruption conflicts
    if (window.fosemApp.focusTimeoutId) {
      clearTimeout(window.fosemApp.focusTimeoutId);
      window.fosemApp.focusTimeoutId = null;
    }

    // Remove focus highlights from any existing elements first
    document.querySelectorAll('.focus-highlight-pop, .focus-highlight-nudge, .focus-highlight-reduced').forEach(el => {
      el.classList.remove('focus-highlight-pop', 'focus-highlight-nudge', 'focus-highlight-reduced');
    });

    const isPrefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isPrefersReduced) {
      targetEl.classList.add('focus-highlight-reduced');
      window.fosemApp.focusTimeoutId = setTimeout(() => {
        targetEl.classList.remove('focus-highlight-reduced');
        window.fosemApp.focusTimeoutId = null;
      }, 1200);
      return;
    }

    // Check if element is already 60% visible in the viewport
    const rect = targetEl.getBoundingClientRect();
    const elemHeight = rect.height;
    const elemWidth = rect.width;
    const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    const isAlreadyVisible = (visibleHeight * visibleWidth) / (elemHeight * elemWidth) >= 0.60;

    let animClass = '';
    let duration = 0;

    if (isAlreadyVisible) {
      animClass = 'focus-highlight-nudge';
      duration = 1950;
    } else {
      animClass = 'focus-highlight-pop';
      duration = 2050;
    }

    targetEl.classList.add(animClass);
    
    // Store the timeout ID so we can cancel it if another card is focused
    window.fosemApp.focusTimeoutId = setTimeout(() => {
      targetEl.classList.remove('focus-highlight-pop', 'focus-highlight-nudge', 'focus-highlight-reduced');
      window.fosemApp.focusTimeoutId = null;
    }, duration);
  },

  scrollTargetIntoSafeView: function(targetCard, dropdownPanel, header) {
    if (!targetCard) return;

    // Measure bounding rectangles
    const cardRect = targetCard.getBoundingClientRect();
    const headerRect = header ? header.getBoundingClientRect() : { bottom: 80 };
    
    // Determine the active dropdown bottom boundary in viewport coordinates
    let dropdownBottom = headerRect.bottom;
    if (dropdownPanel) {
      const dropdownRect = dropdownPanel.getBoundingClientRect();
      if (dropdownRect.height > 0) {
        dropdownBottom = dropdownRect.bottom;
      }
    }

    const safeOffset = dropdownBottom + 32; // 32px safety clearance below the dropdown panel

    // Check if the card is already fully visible in the viewport and not blocked by the dropdown/header
    const isBelowDropdown = cardRect.top >= safeOffset;
    const isAboveViewportBottom = cardRect.bottom <= window.innerHeight;
    const isAlreadyFullyVisible = isBelowDropdown && isAboveViewportBottom;

    const slug = targetCard.id;

    if (isAlreadyFullyVisible) {
      // Already perfectly visible: trigger focus animation after a short wait (150ms)
      setTimeout(() => {
        this.triggerCardFocus(slug);
      }, 150);
    } else {
      // Scroll to position the top of the card exactly at safeOffset
      const cardDocTop = cardRect.top + window.pageYOffset;
      const targetScrollY = cardDocTop - safeOffset;

      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth'
      });

      // Wait for smooth scroll to finish (approx 650ms) then trigger focus pop
      setTimeout(() => {
        this.triggerCardFocus(slug);
      }, 650);
    }
  },

  scrollToAndFocus: function(targetId) {
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    const header = document.querySelector('.site-header');
    this.scrollTargetIntoSafeView(targetEl, null, header);
  }
});

// Intercept Clicks, Sidebar Navigation and Back to Home
document.addEventListener('DOMContentLoaded', () => {
  // Close all dropdowns helper
  const closeAllDropdowns = ({ lockUntilPointerExit = true } = {}) => {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active', 'is-open');
      item.querySelector(':scope > .nav-link')?.setAttribute('aria-expanded', 'false');
      const menu = item.querySelector('.dropdown-menu');
      if (menu) {
        menu.classList.toggle('force-closed', lockUntilPointerExit);
      }
    });
  };

  // A click outside or Escape can deliberately lock a menu closed. Release that
  // lock as soon as the user starts a fresh interaction so the first hover works.
  document.querySelectorAll('.nav-item').forEach(item => {
    const resetDropdownLock = () => {
      const menu = item.querySelector('.dropdown-menu');
      if (menu) {
        menu.classList.remove('force-closed', 'de-emphasized');
      }
    };

    item.addEventListener('mouseenter', resetDropdownLock);
    item.addEventListener('pointerenter', resetDropdownLock);
    item.addEventListener('focusin', resetDropdownLock);
    item.addEventListener('mouseleave', resetDropdownLock);
  });

  // Close menus on Escape press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');
      if (mobileMenuBtn?.getAttribute('aria-expanded') === 'true') {
        window.fosemApp.setMobileMenuOpen?.(false, { returnFocus: true });
      }
    }
  });

  // Close menus on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item') && !e.target.closest('#mobile-menu-btn')) {
      // The pointer is already outside the navigation, so no persistent lock is
      // needed. Leaving one behind is what made the next hover appear broken.
      closeAllDropdowns({ lockUntilPointerExit: false });
    }
  });

  // Handle click on any dropdown link with smooth scroll and zero-lag tab switching
  const dropdownLinks = document.querySelectorAll('.nav-item .dropdown-menu a');
  let isNavigating = false;

  dropdownLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.includes('#')) {
        const slug = href.split('#')[1];
        const homeView = document.getElementById('home-view');
        const solView = document.getElementById('solutions-view');

        const isServiceOption = slug.startsWith('service-');
        const isIndustryOption = slug.startsWith('industry-') || slug.startsWith('expertise-');
        const mainNav = document.getElementById('main-nav');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const closeNavigation = () => {
          window.fosemApp.setMobileMenuOpen?.(false);
          document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active', 'is-open');
            item.querySelector(':scope > .nav-link')?.setAttribute('aria-expanded', 'false');
          });
        };

        // Resolve a product choice before changing the menu state. This makes
        // the first product item as reliable as every other product link.
        if (solutionsData[slug]) {
          e.preventDefault();
          const solutionView = document.getElementById('solutions-view');
          const homeIsShowing = !homeView?.classList.contains('view-hidden');
          const solutionIsHidden = solutionView?.classList.contains('view-hidden');
          if (window.fosemApp.currentSolution !== slug || homeIsShowing || solutionIsHidden) {
            window.fosemApp.loadSolution(slug);
          }

          closeNavigation();
          document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('is-selecting', 'de-emphasized');
            menu.classList.add('force-closed');
          });

          const navbar = document.querySelector('.site-header');
          const navHeight = navbar ? navbar.offsetHeight : 80;
          setTimeout(() => {
            const targetView = document.getElementById('solutions-view');
            if (!targetView) return;
            const targetOffset = targetView.getBoundingClientRect().top + window.scrollY - navHeight - 24;
            window.scrollTo({ top: targetOffset, behavior: 'smooth' });
          }, 150);
          return;
        }

        // Service links remain visible briefly
        // so the selection animation can connect the menu choice to the card.
        if (!isServiceOption) closeNavigation();
        
        const parentMenu = link.closest('.dropdown-menu');
        if (parentMenu) {
          parentMenu.classList.remove('force-closed');
          if (isServiceOption) {
            parentMenu.classList.add('is-selecting');
            link.classList.add('is-selected');
            setTimeout(closeNavigation, 260);
          } else {
            parentMenu.classList.add('force-closed');
          }

          // Reset transient selection state before the next menu interaction.
          setTimeout(() => {
            parentMenu.classList.remove('is-selecting');
            link.classList.remove('is-selected');
          }, 520);
        }

        // Case A: Services & Support key
        if (slug.startsWith('service-')) {
          if (homeView && solView) {
            e.preventDefault();

            if (isNavigating) return;
            isNavigating = true;
            setTimeout(() => { isNavigating = false; }, 400);

            const performScrollAndFocus = () => {
              // Let the selected menu item register, then begin the page transition.
              setTimeout(() => {
                const targetEl = document.getElementById(slug);
                if (!targetEl) return;

                const header = document.querySelector('.site-header');
                window.fosemApp.scrollTargetIntoSafeView(targetEl, null, header);
              }, 180);
            };

            // Transition from solutions view back to home first
            if (!solView.classList.contains('view-hidden')) {
              window.fosemApp.goHome();
              setTimeout(performScrollAndFocus, 350);
            } else {
              performScrollAndFocus();
            }
          }
        }
        // Case B: Industries directory item
        else if (isIndustryOption) {
          e.preventDefault();

          const performIndustryFocus = () => {
            const targetEl = document.getElementById(slug);
            if (!targetEl) return;

            document.querySelectorAll('.industry-focus-active').forEach(el => {
              el.classList.remove('industry-focus-active');
            });
            targetEl.classList.add('industry-focus-active');

            if (window.fosemApp.industryFocusTimeoutId) {
              clearTimeout(window.fosemApp.industryFocusTimeoutId);
            }
            window.fosemApp.industryFocusTimeoutId = setTimeout(() => {
              targetEl.classList.remove('industry-focus-active');
              window.fosemApp.industryFocusTimeoutId = null;
            }, 6000);

            window.history.replaceState(null, '', `#${slug}`);
            const header = document.querySelector('.site-header');
            window.fosemApp.scrollTargetIntoSafeView(targetEl, null, header);
          };

          if (homeView && solView && !solView.classList.contains('view-hidden')) {
            window.fosemApp.goHome();
            setTimeout(performIndustryFocus, 350);
          } else {
            setTimeout(performIndustryFocus, 120);
          }
        }
      }
    });
  });

  // Intercept all hash/section links across the whole page (e.g. footer home/services links)
  const hashLinks = document.querySelectorAll('a[href^="#"], a[href^="index.html#"]');
  hashLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Exempt solution and service detail links from normal page redirects
      if (href && href.includes('#')) {
        const slug = href.split('#')[1];
        if (solutionsData[slug] || slug.startsWith('service-') || slug.startsWith('industry-') || slug.startsWith('expertise-')) {
          return;
        }
      }

      const homeView = document.getElementById('home-view');
      if (homeView && homeView.classList.contains('view-hidden')) {
        e.preventDefault();
        window.fosemApp.goHome();
        const targetId = href.includes('#') ? href.split('#')[1] : '';
        if (targetId) {
          setTimeout(() => {
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
          }, 400);
        }
      }
    });
  });
  
  // Sidebar navigation
  const sidebarButtons = document.querySelectorAll('.sol-nav-btn');
  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const solKey = btn.getAttribute('data-sol');
      window.fosemApp.loadSolution(solKey);
    });
  });

  // Back to Home button in Sidebar
  const backBtn = document.getElementById('sol-btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.fosemApp.goHome();
    });
  }

  // Mobile Back to List button
  const mobileBackBtn = document.getElementById('sol-mobile-back');
  if (mobileBackBtn) {
    mobileBackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('.sol-layout-wrapper')?.classList.remove('detail-active');
      window.history.pushState(null, '', '#solutions-list');
    });
  }

  // Deep linking: load solution or scroll to service if hash is present on load
  const loadHashSolution = () => {
    const hash = window.location.hash;
    if (hash) {
      const solutionKey = hash.substring(1);
      if (solutionKey === 'solutions-list') {
        const homeView = document.getElementById('home-view');
        const solView = document.getElementById('solutions-view');
        if (homeView && solView) {
          document.querySelector('.skip-link')?.setAttribute('href', '#solutions-view');
          homeView.style.opacity = '0';
          setTimeout(() => {
            homeView.classList.add('view-hidden');
            solView.classList.remove('view-hidden');
            void solView.offsetWidth;
            solView.style.opacity = '1';
            document.querySelector('.sol-layout-wrapper')?.classList.remove('detail-active');
            // Close mobile menu if open
            document.getElementById('main-nav')?.classList.remove('active', 'open');
            document.getElementById('mobile-menu-btn')?.classList.remove('active');
          }, 300);
        }
      } else if (solutionsData[solutionKey]) {
        window.fosemApp.loadSolution(solutionKey);
      } else if (solutionKey.startsWith('service-')) {
        setTimeout(() => {
          window.fosemApp.scrollToAndFocus(solutionKey);
        }, 300);
      } else if (solutionKey.startsWith('industry-') || solutionKey.startsWith('expertise-')) {
        setTimeout(() => {
          window.fosemApp.scrollToAndFocus(solutionKey);
        }, 300);
      }
    }
  };

  setTimeout(loadHashSolution, 150);

  // Listen for browser back/forward buttons or manual hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash) {
      const solutionKey = hash.substring(1);
      if (solutionKey === 'solutions-list') {
        loadHashSolution(); // Reuse the same logic
      } else if (solutionsData[solutionKey]) {
        window.fosemApp.loadSolution(solutionKey);
      } else if (solutionKey.startsWith('service-')) {
        window.fosemApp.scrollToAndFocus(solutionKey);
      } else if (solutionKey.startsWith('industry-') || solutionKey.startsWith('expertise-')) {
        window.fosemApp.scrollToAndFocus(solutionKey);
      }
    } else {
      window.fosemApp.goHome();
    }
  });

  /* --- Footer Enquiry Form Handler --- */
  const footerEnquiryForm = document.getElementById('footer-enquiry-form');
  if (footerEnquiryForm) {
    footerEnquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('footer-enquiry-status');
      const submitButton = footerEnquiryForm.querySelector('[type="submit"]');

      if (!footerEnquiryForm.checkValidity()) {
        footerEnquiryForm.reportValidity();
        if (status) status.textContent = 'Please complete all required fields correctly.';
        return;
      }

      if (status) status.textContent = 'Sending your enquiry…';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
      }

      try {
        const formData = new FormData(footerEnquiryForm);
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });
        if (!response.ok) throw new Error(`Form submission failed with ${response.status}`);
        footerEnquiryForm.reset();
        if (status) status.textContent = 'Thank you. Your enquiry has been sent successfully.';
      } catch (error) {
        if (status) status.textContent = 'We could not send your enquiry. Please email sales@fosemcontrols.com instead.';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute('aria-busy');
        }
      }
    });
  }

  /* --- 3D Rotating Earth Canvas Loop --- */
  const initGlobeCanvas = () => {
    const canvas = document.querySelector('.globe-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Scale for high-DPI Retina screens
    const width = 220;
    const height = 220;
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const scale = 2;
    const cx = 100;
    const cy = 100;
    const R = 92;
    
    // Camera settings (tilted by 8 degrees)
    const phi_0 = 8 * Math.PI / 180;
    const cosP = Math.cos(phi_0);
    const sinP = Math.sin(phi_0);
    
    // Reference database
    const data = window.fosemGlobeData;
    if (!data || !data.particles || !data.nodes) return;
    
    // Rotation state
    let theta = 0;
    let globeFrameId = null;
    let globeIsVisible = false;
    const reduceGlobeMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // active Ripples (waves expanding on laser impact)
    const activeRipples = [];
    
    // Bouncing Beams (45 active laser travelers constantly bouncing between connected nodes)
    const activeBeams = [];
    const beamCount = 45;
    
    for (let i = 0; i < beamCount; i++) {
      // Pick a random starting node
      const startNode = data.nodes[Math.floor(Math.random() * data.nodes.length)];
      // Find neighbors
      const connected = data.links.filter(l => l.id1 === startNode.id || l.id2 === startNode.id);
      let targetNode = null;
      let activeLink = null;
      
      if (connected.length > 0) {
        activeLink = connected[Math.floor(Math.random() * connected.length)];
        const nextId = activeLink.id1 === startNode.id ? activeLink.id2 : activeLink.id1;
        targetNode = data.nodes.find(n => n.id === nextId);
      } else {
        targetNode = data.nodes[Math.floor(Math.random() * data.nodes.length)];
      }
      
      activeBeams.push({
        currentNode: startNode,
        targetNode: targetNode,
        link: activeLink,
        lastNodeId: startNode.id,
        progress: Math.random(),
        speed: 0.007 + Math.random() * 0.007
      });
    }
    
    // 3D coordinate rotation & projection helper
    const project = (x_l, y_l, z_l) => {
      // Y-axis rotation (spin)
      const xRot = x_l * Math.cos(theta) - z_l * Math.sin(theta);
      const zRot = x_l * Math.sin(theta) + z_l * Math.cos(theta);
      const y_temp = y_l;
      
      // X-axis tilt (pitch)
      const y3d = cosP * y_temp - sinP * zRot;
      const z3d = sinP * y_temp + cosP * zRot;
      
      const px = cx + xRot;
      const py = cy - y3d;
      return { px, py, z3d };
    };
    
    // Render loop
    const render = () => {
      globeFrameId = null;
      // Increment rotation
      theta += 0.0022;
      if (theta > 2 * Math.PI) theta -= 2 * Math.PI;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 1. Draw Latitudes (14 curves)
      ctx.strokeStyle = 'rgba(120, 200, 255, 0.16)';
      ctx.lineWidth = 0.8 * scale;
      const latitudes = [-72, -60, -48, -36, -24, -12, 0, 12, 24, 36, 48, 60, 72];
      latitudes.forEach(latDeg => {
        const lat = latDeg * Math.PI / 180;
        const r_lat = R * Math.cos(lat);
        const y_lat = R * Math.sin(lat);
        
        ctx.beginPath();
        let first = true;
        for (let deg = 0; deg <= 360; deg += 6) {
          const theta_pt = deg * Math.PI / 180;
          const x_l = r_lat * Math.sin(theta_pt);
          const z_l = r_lat * Math.cos(theta_pt);
          
          const pt = project(x_l, y_lat, z_l);
          if (pt.z3d >= -10) {
            if (first) {
              ctx.moveTo(pt.px * scale, pt.py * scale);
              first = false;
            } else {
              ctx.lineTo(pt.px * scale, pt.py * scale);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      });
      
      // 2. Draw Longitudes (20 curves)
      for (let i = 0; i < 20; i++) {
        const lonDeg = (i * 18);
        const lon = lonDeg * Math.PI / 180;
        
        ctx.beginPath();
        let first = true;
        for (let latDeg = -85; latDeg <= 85; latDeg += 5) {
          const lat = latDeg * Math.PI / 180;
          const x_l = R * Math.cos(lat) * Math.sin(lon);
          const y_l = R * Math.sin(lat);
          const z_l = R * Math.cos(lat) * Math.cos(lon);
          
          const pt = project(x_l, y_l, z_l);
          if (pt.z3d >= -10) {
            if (first) {
              ctx.moveTo(pt.px * scale, pt.py * scale);
              first = false;
            } else {
              ctx.lineTo(pt.px * scale, pt.py * scale);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }
      
      // 3. Draw Continent Particles (32,896 coordinates rendered at 60fps using rects)
      const len = data.particles.length;
      for (let i = 0; i < len; i += 3) {
        const px_val = data.particles[i];
        const py_val = data.particles[i+1];
        const pz_val = data.particles[i+2];
        
        const pt = project(px_val, py_val, pz_val);
        if (pt.z3d >= -5) {
          // Sharp spherical contrast depth-fade
          let alpha = pt.z3d / R;
          if (alpha < 0) alpha = 0;
          if (alpha > 1) alpha = 1;
          alpha = Math.pow(alpha, 3); // cubic falloff for deep volumetric feel
          
          ctx.fillStyle = `rgba(142, 216, 255, ${alpha * 0.85})`;
          // Draw rect for maximum raw drawing performance at 60fps
          ctx.fillRect(pt.px * scale - 0.45 * scale, pt.py * scale - 0.45 * scale, 0.9 * scale, 0.9 * scale);
        }
      }
      
      // 4. Draw Connection Links (Subtle background paths)
      data.links.forEach(link => {
        const n1 = data.nodes.find(n => n.id === link.id1);
        const n2 = data.nodes.find(n => n.id === link.id2);
        if (!n1 || !n2) return;
        
        const xm = (n1.x + n2.x) / 2;
        const ym = (n1.y + n2.y) / 2;
        const zm = (n1.z + n2.z) / 2;
        let length_mid = Math.sqrt(xm*xm + ym*ym + zm*zm);
        if (length_mid < 1) length_mid = 1;
        
        const factor = (156 / length_mid) - 1;
        const xc = xm + xm * factor;
        const yc = ym + ym * factor;
        const zc = zm + zm * factor;
        
        const ptCtrl = project(xc, yc, zc);
        
        // Midpoint depth visibility determines base opacity
        let alpha = (ptCtrl.z3d + R) / (2 * R);
        if (alpha < 0) alpha = 0;
        if (alpha > 1) alpha = 1;
        
        if (alpha > 0.05) {
          ctx.strokeStyle = `rgba(142, 216, 255, ${alpha * 0.12})`;
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          
          const steps = 15;
          let first = true;
          for (let k = 0; k <= steps; k++) {
            const t = k / steps;
            const x_t = (1-t)*(1-t)*n1.x + 2*(1-t)*t*xc + t*t*n2.x;
            const y_t = (1-t)*(1-t)*n1.y + 2*(1-t)*t*yc + t*t*n2.y;
            const z_t = (1-t)*(1-t)*n1.z + 2*(1-t)*t*zc + t*t*n2.z;
            
            const pt = project(x_t, y_t, z_t);
            if (pt.z3d >= -15) { // Visible threshold slightly behind horizon
              if (first) {
                ctx.moveTo(pt.px * scale, pt.py * scale);
                first = false;
              } else {
                ctx.lineTo(pt.px * scale, pt.py * scale);
              }
            } else {
              first = true; // Break path when it goes behind the globe
            }
          }
          ctx.stroke();
        }
      });
      
      // 5. Draw Active Bouncing Beams (Lasers)
      activeBeams.forEach(beam => {
        // Increment progress
        beam.progress += beam.speed;
        if (beam.progress >= 1.0) {
          // Landing node reached! Trigger ripple
          activeRipples.push({
            x: beam.targetNode.x,
            y: beam.targetNode.y,
            z: beam.targetNode.z,
            progress: 0,
            speed: 0.08 // Faster, more punchy impact ripple
          });
          
          const prevId = beam.lastNodeId;
          beam.lastNodeId = beam.currentNode.id;
          beam.currentNode = beam.targetNode;
          
          // Find neighbors
          const connected = data.links.filter(l => l.id1 === beam.currentNode.id || l.id2 === beam.currentNode.id);
          
          // Exclude backtrack path AND avoid traffic (links currently targeted by other active beams)
          let choices = connected.filter(l => {
            const destId = l.id1 === beam.currentNode.id ? l.id2 : l.id1;
            if (destId === prevId) return false;
            
            // Avoid traffic: check if another beam is already heading to this target node
            const isTargeted = activeBeams.some(b => b !== beam && b.targetNode && b.targetNode.id === destId);
            return !isTargeted;
          });
          
          // Fallback 1: If all paths are targeted, just exclude backtracking
          if (choices.length === 0) {
            choices = connected.filter(l => {
              const destId = l.id1 === beam.currentNode.id ? l.id2 : l.id1;
              return destId !== prevId;
            });
          }
          
          // Fallback 2: Choose any choice if blocked completely
          if (choices.length === 0 && connected.length > 0) {
            choices = connected;
          }
          
          if (choices.length > 0) {
            beam.link = choices[Math.floor(Math.random() * choices.length)];
            const nextId = beam.link.id1 === beam.currentNode.id ? beam.link.id2 : beam.link.id1;
            beam.targetNode = data.nodes.find(n => n.id === nextId);
          } else {
            // Safe fallback to random land node
            beam.targetNode = data.nodes[Math.floor(Math.random() * data.nodes.length)];
            beam.link = null;
          }
          
          beam.progress = 0;
          beam.speed = 0.005 + Math.random() * 0.005; // Smooth travel speed
        }
        
        const n1 = beam.currentNode;
        const n2 = beam.targetNode;
        if (!n1 || !n2) return;
        
        // Calculate control point for 3D Arc (peaks strictly hover outside the globe body)
        const xm = (n1.x + n2.x) / 2;
        const ym = (n1.y + n2.y) / 2;
        const zm = (n1.z + n2.z) / 2;
        let length_mid = Math.sqrt(xm*xm + ym*ym + zm*zm);
        if (length_mid < 1) length_mid = 1;
        
        const factor = (156 / length_mid) - 1;
        const xc = xm + xm * factor;
        const yc = ym + ym * factor;
        const zc = zm + zm * factor;
        
        const ptCtrl = project(xc, yc, zc);
        
        // Midpoint depth visibility determines base opacity
        let alpha = (ptCtrl.z3d + R) / (2 * R);
        if (alpha < 0) alpha = 0;
        if (alpha > 1) alpha = 1;
        
        if (alpha > 0.05) {
          // Draw the flowing arc line smoothly with no glow, just a solid clean bold colored segment (5x longer)
          const steps = 25; // More steps for smooth long curve
          const startT = Math.max(0, beam.progress - 0.72); // 5x longer flowing path (72% of link length)
          const endT = Math.min(1.0, beam.progress);
          
          ctx.beginPath();
          let first = true;
          for (let k = 0; k <= steps; k++) {
            const t = startT + (endT - startT) * (k / steps);
            const x_t = (1-t)*(1-t)*n1.x + 2*(1-t)*t*xc + t*t*n2.x;
            const y_t = (1-t)*(1-t)*n1.y + 2*(1-t)*t*yc + t*t*n2.y;
            const z_t = (1-t)*(1-t)*n1.z + 2*(1-t)*t*zc + t*t*n2.z;
            
            const pt = project(x_t, y_t, z_t);
            if (pt.z3d >= -15) {
              if (first) {
                ctx.moveTo(pt.px * scale, pt.py * scale);
                first = false;
              } else {
                ctx.lineTo(pt.px * scale, pt.py * scale);
              }
            } else {
              first = true; // Break path when it goes behind the globe
            }
          }
          ctx.strokeStyle = `rgba(160, 225, 255, ${alpha * 0.95})`;
          ctx.lineWidth = 2.4 * scale; // Increased thickness (bolder visual presence)
          ctx.lineCap = 'round';
          ctx.stroke();
          
          // Add a subtle white hot-core segment on top of it for visual punch!
          ctx.beginPath();
          first = true;
          for (let k = 3; k <= steps - 3; k++) { // tapered white core
            const t = startT + (endT - startT) * (k / steps);
            const x_t = (1-t)*(1-t)*n1.x + 2*(1-t)*t*xc + t*t*n2.x;
            const y_t = (1-t)*(1-t)*n1.y + 2*(1-t)*t*yc + t*t*n2.y;
            const z_t = (1-t)*(1-t)*n1.z + 2*(1-t)*t*zc + t*t*n2.z;
            
            const pt = project(x_t, y_t, z_t);
            if (pt.z3d >= -15) {
              if (first) {
                ctx.moveTo(pt.px * scale, pt.py * scale);
                first = false;
              } else {
                ctx.lineTo(pt.px * scale, pt.py * scale);
              }
            } else {
              first = true; // Break path when it goes behind the globe
            }
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
          ctx.lineWidth = 1.1 * scale; // Increased white core thickness
          ctx.stroke();
        }
      });
      
      // 6. Draw active expanding ripples (impact rings)
      for (let i = activeRipples.length - 1; i >= 0; i--) {
        const rip = activeRipples[i];
        rip.progress += rip.speed;
        if (rip.progress >= 1.0) {
          activeRipples.splice(i, 1);
          continue;
        }
        
        const pt = project(rip.x, rip.y, rip.z);
        if (pt.z3d >= 0) {
          let alpha = pt.z3d / R;
          if (alpha < 0) alpha = 0;
          const opacity = (1.0 - rip.progress) * alpha;
          const radius = (2 + rip.progress * 12) * scale;
          
          ctx.strokeStyle = `rgba(160, 225, 255, ${opacity * 0.6})`;
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.arc(pt.px * scale, pt.py * scale, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
      
      // 7. Draw Nodes (Tiny ring dots ON the globe)
      data.nodes.forEach(node => {
        const pt = project(node.x, node.y, node.z);
        if (pt.z3d >= -5) {
          let alpha = pt.z3d / R;
          if (alpha < 0) alpha = 0;
          if (alpha > 1) alpha = 1;
          
          // Draw base landing ring
          ctx.strokeStyle = `rgba(160, 225, 255, ${alpha * 0.75})`;
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.arc(pt.px * scale, pt.py * scale, 2.2 * scale, 0, 2 * Math.PI);
          ctx.stroke();
          
          // Draw inner center dot
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(pt.px * scale, pt.py * scale, 0.8 * scale, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
      
      if (globeIsVisible && !document.hidden && !reduceGlobeMotion.matches) {
        globeFrameId = requestAnimationFrame(render);
      }
    };

    const startGlobe = () => {
      if (!globeIsVisible || document.hidden || globeFrameId !== null) return;
      globeFrameId = requestAnimationFrame(render);
    };

    const globeObserver = new IntersectionObserver(([entry]) => {
      globeIsVisible = entry.isIntersecting;
      if (!globeIsVisible && globeFrameId !== null) {
        cancelAnimationFrame(globeFrameId);
        globeFrameId = null;
      } else if (globeIsVisible) {
        startGlobe();
      }
    }, { rootMargin: '120px 0px', threshold: 0.01 });

    globeObserver.observe(canvas);
    document.addEventListener('visibilitychange', startGlobe);
    reduceGlobeMotion.addEventListener?.('change', () => {
      if (reduceGlobeMotion.matches && globeFrameId !== null) {
        cancelAnimationFrame(globeFrameId);
        globeFrameId = null;
        render();
      } else {
        startGlobe();
      }
    });
  };
  
  initGlobeCanvas();
});
