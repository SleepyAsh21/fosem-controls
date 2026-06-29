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
    const mobileBtnCallback = () => {
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

  // Logo tagline toggle & goHome
  if (logoContainer) {
    logoContainer.style.cursor = 'pointer';
    let taglineVisible = false;
    logoContainer.addEventListener('click', (e) => {
      const solView = document.getElementById('solutions-view');
      if (solView && !solView.classList.contains('view-hidden')) {
        e.preventDefault();
        window.fosemApp.goHome();
      } else if (logoTagline) {
        taglineVisible = !taglineVisible;
        logoTagline.classList.toggle('visible', taglineVisible);
      }
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





/* ============================================
   FOSEM CONTROLS — SPA Navigation & Content Logic
   ============================================ */

const svgIcons = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
  server: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line><line x1="9" y1="6" x2="9.01" y2="6"></line><line x1="15" y1="6" x2="15.01" y2="6"></line><line x1="9" y1="10" x2="9.01" y2="10"></line><line x1="15" y1="10" x2="15.01" y2="10"></line><line x1="9" y1="14" x2="9.01" y2="14"></line><line x1="15" y1="14" x2="15.01" y2="14"></line><line x1="9" y1="18" x2="9.01" y2="18"></line><line x1="15" y1="18" x2="15.01" y2="18"></line></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
};

const solutionsData = {
  'security-solutions': {
    title: 'Security Solutions',
    desc: 'Fosem Controls engineers and deploys enterprise-grade security architecture. From perimeter intrusion detection to unified surveillance command centers, we provide uncompromising operational visibility and control.',
    heroImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1600&q=80',
    how: 'Every security deployment begins with a rigorous threat and vulnerability assessment of your facility. Fosem engineers then design a heavily redundant, micro-segmented network topology specifically for your surveillance and access control hardware. We seamlessly integrate globally trusted OEM equipment, ensuring zero blind spots and absolute data integrity. Our internationally certified teams handle the entire installation process, from complex civil works and structured cabling to the final software commissioning. Following handover, our Network Operations Center provides continuous remote monitoring, ensuring rapid field response and preventative maintenance to keep your high-risk environments secure around the clock.',
    deliverables: [
      { icon: svgIcons.eye, title: 'Video Surveillance', desc: 'High-definition IP camera networks with AI-driven analytics.' },
      { icon: svgIcons.shield, title: 'Access Control', desc: 'Biometric and credential-based physical access management.' },
      { icon: svgIcons.activity, title: 'Intrusion Detection', desc: 'Perimeter and interior sensors linked to central command.' },
      { icon: svgIcons.target, title: 'Visitor Management', desc: 'Automated tracking and auditing for facility guests.' },
      { icon: svgIcons.server, title: 'Command Centre Integration', desc: 'Single-pane-of-glass platforms aggregating all security data.' },
      { icon: svgIcons.check, title: 'Preventive Maintenance', desc: 'Scheduled servicing and immediate incident response SLA.' }
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
      { icon: svgIcons.building, title: 'Building Management Systems', desc: 'Centralized platforms for complete facility oversight.' },
      { icon: svgIcons.zap, title: 'HVAC Automation', desc: 'Dynamic climate control based on live occupancy metrics.' },
      { icon: svgIcons.settings, title: 'Lighting Control', desc: 'Automated daylight harvesting and scheduled illumination.' },
      { icon: svgIcons.activity, title: 'Energy Monitoring', desc: 'Granular tracking of power consumption across all zones.' },
      { icon: svgIcons.target, title: 'Environmental Controls', desc: 'Precision temperature and humidity regulation for critical areas.' },
      { icon: svgIcons.server, title: 'Centralised Monitoring', desc: 'Real-time alerting for mechanical faults and inefficiencies.' }
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
      { icon: svgIcons.server, title: 'Data Center Buildouts', desc: 'Complete facility engineering including power and cooling.' },
      { icon: svgIcons.target, title: 'Structured Cabling', desc: 'Certified copper and fiber-optic backbone installations.' },
      { icon: svgIcons.activity, title: 'Core Switching', desc: 'High-throughput, redundant enterprise network distribution.' },
      { icon: svgIcons.shield, title: 'Secure Architecture', desc: 'Micro-segmented networks designed with zero-trust principles.' },
      { icon: svgIcons.zap, title: 'Wireless LAN', desc: 'High-density, low-latency wireless coverage for large campuses.' },
      { icon: svgIcons.check, title: 'Performance Certification', desc: 'Rigorous testing and documentation of all physical links.' }
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
      { icon: svgIcons.zap, title: 'Hybrid Power Integration', desc: 'Seamless synchronization of grid, solar, and generator power.' },
      { icon: svgIcons.server, title: 'Battery Storage (BESS)', desc: 'Industrial-scale energy storage for peak shaving and backup.' },
      { icon: svgIcons.target, title: 'Solar PV Arrays', desc: 'Commercial solar generation designed for maximum yield.' },
      { icon: svgIcons.shield, title: 'Uninterruptible Power', desc: 'Enterprise UPS systems protecting mission-critical assets.' },
      { icon: svgIcons.activity, title: 'Load Profiling', desc: 'Precision engineering based on exact facility power draw.' },
      { icon: svgIcons.settings, title: 'Remote Telemetry', desc: 'Live monitoring of generation, storage, and consumption.' }
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
      { icon: svgIcons.building, title: 'Mechanical Systems', desc: 'Centralized heating, cooling, and ventilation designs.' },
      { icon: svgIcons.zap, title: 'Electrical Engineering', desc: 'Secure power distribution, wiring, and safety grids.' },
      { icon: svgIcons.settings, title: 'Plumbing & Sanitation', desc: 'Efficient water supply, drainage, and waste management.' },
      { icon: svgIcons.shield, title: 'Code Compliance', desc: 'Strict adherence to local building and safety codes.' },
      { icon: svgIcons.check, title: 'Preventive Maintenance', desc: 'Regular inspections and servicing of mechanical units.' },
      { icon: svgIcons.server, title: 'Facility Management Integration', desc: 'Connecting mechanical systems to building automation.' }
    ],
    gallery: [
      'assets/images/service-installation.webp',
      'assets/images/service-commissioning.webp'
    ]
  },
  'access-control': {
    title: 'Access Control',
    desc: 'Enterprise-grade credentialing, identity verification, and physical access barrier management designed to safeguard critical assets and facilities.',
    heroImage: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1600&q=80',
    how: 'Fosem engineers design access control systems with safety, security, and traceability in mind. We assess entry and exit points across your facilities, designing a secure topology bridging RFID readers, biometric scanning, and mobile credentials. We handle the complete electrical and mechanical integration, installing turnstiles, electromagnetic locks, and barrier gates linked with emergency fire override controls. Our software deployments centralize management, offering real-time auditing and automated directory sync.',
    deliverables: [
      { icon: svgIcons.shield, title: 'Biometric Readers', desc: 'Fingerprint, facial recognition, and iris credential scanners.' },
      { icon: svgIcons.settings, title: 'Mobile Credentials', desc: 'Secure smartphone-based Bluetooth and NFC access.' },
      { icon: svgIcons.target, title: 'Physical Barriers', desc: 'High-throughput optical turnstiles and security speed gates.' },
      { icon: svgIcons.server, title: 'Visitor Management', desc: 'Self-service kiosks and automated digital guest badging.' },
      { icon: svgIcons.activity, title: 'Unified Control Software', desc: 'Centralized management dashboards with instant activity logs.' },
      { icon: svgIcons.check, title: 'Compliance & Audits', desc: 'Ensuring life safety, ADA compliance, and data privacy audits.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  'fire-safety': {
    title: 'Fire Safety',
    desc: 'Code-compliant addressable fire detection networks, automated suppression integration, and rapid-response life safety notification systems.',
    heroImage: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1600&q=80',
    how: "Fosem approaches fire protection with zero compromise. We perform code validation and draft cause-and-effect matrix plans for complex facilities. Our certified teams install addressable alarm systems and VESDA early warning smoke detection in high-value environments. We execute the integrations with HVAC dampers, elevator recall, and access control overrides to guarantee automatic containment during emergency triggers.",
    deliverables: [
      { icon: svgIcons.target, title: 'Addressable Panels', desc: 'Pinpoint device location mapping for fast hazard response.' },
      { icon: svgIcons.activity, title: 'Aspirating Detection', desc: 'VESDA air sampling networks for ultra-early warning.' },
      { icon: svgIcons.settings, title: 'HVAC & Vent Control', desc: 'Automatic fan and smoke damper actuation controls.' },
      { icon: svgIcons.server, title: 'Suppression Integration', desc: 'Clean agent gaseous fire extinguishing triggers.' },
      { icon: svgIcons.shield, title: 'Emergency Audio Evac', desc: 'Voice evacuation and public address announcement feeds.' },
      { icon: svgIcons.check, title: 'SLA Inspections', desc: 'Routine preventative testing conforming to local regulations.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1620023647180-60b13d50f7ff?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  'automation-systems': {
    title: 'Automation Systems',
    desc: 'Programmable Logic Controller (PLC) systems, SCADA telemetry platforms, and centralized mechanical-electrical coordination frameworks.',
    heroImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
    how: 'We streamline facility operations by integrating mechanical-electrical components under high-availability automation logic. Our engineers program rugged PLCs and design intuitive SCADA HMI interfaces to map all mechanical, power, and thermal assets. We deploy edge-gateway routers to gather and analyze fieldbus telemetry (Modbus, BACnet, Profibus), giving operators unified oversight of critical systems.',
    deliverables: [
      { icon: svgIcons.settings, title: 'PLC Development', desc: 'Custom logic control scripts engineered for industrial hardware.' },
      { icon: svgIcons.activity, title: 'SCADA Telemetry', desc: 'Rich visualization screens mapping facility sensor nodes.' },
      { icon: svgIcons.zap, title: 'Motor & Drive Control', desc: 'VFD calibration to balance motor loads and save power.' },
      { icon: svgIcons.server, title: 'Industrial Gateways', desc: 'Secure communication conversion bridging legacy protocols.' },
      { icon: svgIcons.target, title: 'Process Optimisation', desc: 'Tuning feedback loops (PID) to reduce system wear.' },
      { icon: svgIcons.check, title: 'Routine Diagnostics', desc: 'Periodic firmware updates and input-output loop validation.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80'
    ]
  },
  'cctv-surveillance': {
    title: 'CCTV & Surveillance',
    desc: 'High-definition network IP video architectures combined with edge AI analytics and centralized storage command structures.',
    heroImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80',
    how: 'Our surveillance team engineers systems tailored for high-risk and high-density areas. We analyze lens focal lengths and coverage zones to design IP camera distributions with zero blind spots. We configure robust network storage arrays (NVR/SAN), set up automated failovers, and integrate advanced edge-analytics like path-intrusion detection, facial matching, and automated license-plate recognition (LPR).',
    deliverables: [
      { icon: svgIcons.eye, title: 'Ultra-HD IP Cameras', desc: 'Low-light, 4K, and thermal cameras for extreme conditions.' },
      { icon: svgIcons.activity, title: 'Edge AI Analytics', desc: 'Intelligent filters for motion, intrusion, and facial logs.' },
      { icon: svgIcons.server, title: 'Network Recording', desc: 'Redundant high-capacity storage servers with hot-swaps.' },
      { icon: svgIcons.target, title: 'Control Room Video Walls', desc: 'High-density displays integrated into central desks.' },
      { icon: svgIcons.shield, title: 'Video Encription', desc: 'Zero-trust stream encryption preventing stream hijacking.' },
      { icon: svgIcons.check, title: 'SLA Support', desc: 'Immediate lens cleaning, re-focus checks, and storage health audits.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80'
    ]
  }
};
if (!window.fosemApp) window.fosemApp = {};
Object.assign(window.fosemApp, {
  renderContent: function(data, isInitialLoad) {
    const container = document.getElementById('solutions-content');
    
    const applyHtml = () => {
      let html = `
        <!-- 1. Hero -->
        <section class="sol-hero fade-up">
          <div class="sol-hero-text fade-left" style="--stagger: 100ms">
            <h1 class="sol-hero-title">${data.title}</h1>
            <p class="sol-hero-desc">${data.desc}</p>
          </div>
          <div class="sol-hero-image-wrapper scale-in" style="--stagger: 200ms">
            <img src="${data.heroImage}" alt="${data.title}" class="sol-hero-image" decoding="async">
          </div>
        </section>

        <!-- 2. How Fosem Delivers -->
        <section class="sol-section fade-up">
          <h2 class="sol-section-title">How Fosem Delivers This Solution</h2>
          <div class="sol-how">
            <p>${data.how}</p>
          </div>
        </section>

        <!-- 3. What We Deliver -->
        <section class="sol-section fade-up">
          <h2 class="sol-section-title">What We Deliver</h2>
          <div class="sol-deliverables-grid">
            ${data.deliverables.map((d, index) => `
              <div class="sol-deliverable fade-up" style="--stagger: ${(index % 3 + 1) * 100}ms">
                <div class="sol-deliverable-icon">${d.icon}</div>
                <h3>${d.title}</h3>
                <p>${d.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- 4. Project Gallery -->
        <section class="sol-section fade-up">
          <h2 class="sol-section-title">Project Gallery</h2>
          <div class="sol-gallery-grid">
            ${data.gallery.map((img, index) => `
              <img src="${img}" alt="Project installation" class="sol-gallery-image scale-in" style="--stagger: ${(index + 1) * 100}ms" decoding="async">
            `).join('')}
          </div>
        </section>

        <!-- 5. Consultation -->
        <section class="sol-consultation fade-up">
          <h2 class="sol-consultation-title">Ready to discuss your project?</h2>
          <p>Talk with our engineering team to design a solution tailored to your requirements.</p>
          <div class="sol-consultation-actions">
            <a href="mailto:engineering@fosemcontrols.com" class="sol-btn-primary">Request Consultation</a>
            <a href="#" class="sol-btn-secondary">Download Company Profile</a>
          </div>
        </section>
      `;

      container.innerHTML = html;
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
  },

  goHome: function() {
    const homeView = document.getElementById('home-view');
    const solView = document.getElementById('solutions-view');
    
    // Clear hash silently
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
    
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
    document.querySelectorAll('.focus-highlight-pop, .focus-highlight-nudge').forEach(el => {
      el.classList.remove('focus-highlight-pop', 'focus-highlight-nudge');
    });

    const isPrefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isPrefersReduced) return;

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
      duration = 1000;
    } else {
      animClass = 'focus-highlight-pop';
      duration = 1200;
    }

    targetEl.classList.add(animClass);
    
    // Store the timeout ID so we can cancel it if another card is focused
    window.fosemApp.focusTimeoutId = setTimeout(() => {
      targetEl.classList.remove('focus-highlight-pop', 'focus-highlight-nudge');
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
  const closeAllDropdowns = () => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.add('force-closed');
    });
  };

  // Reset force-closed and de-emphasized state when mouse leaves any nav-item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('mouseleave', () => {
      const menu = item.querySelector('.dropdown-menu');
      if (menu) {
        menu.classList.remove('force-closed', 'de-emphasized');
      }
    });
  });

  // Close menus on Escape press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  // Close menus on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      closeAllDropdowns();
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

        // Find parent dropdown menu and de-emphasize it instantly on click
        const parentMenu = link.closest('.dropdown-menu');
        if (parentMenu) {
          parentMenu.classList.remove('force-closed');
          parentMenu.classList.add('de-emphasized');
          // Restore dropdown after the scroll and card focus animations are completely finished
          setTimeout(() => {
            parentMenu.classList.remove('de-emphasized');
          }, 1850);
        }

        // Case A: Products & Solutions key
        if (solutionsData[slug]) {
          if (homeView && solView) {
            e.preventDefault();

            // Load solution if it's different from current
            if (window.fosemApp.currentSolution !== slug) {
              window.fosemApp.loadSolution(slug);
            }

            if (isNavigating) return;
            isNavigating = true;
            setTimeout(() => { isNavigating = false; }, 400);

            // Always scroll window to the top of solutions view (no highlights)
            setTimeout(() => {
              const rect = solView.getBoundingClientRect();
              const navbar = document.querySelector('.site-header');
              const navHeight = navbar ? navbar.offsetHeight : 80;
              
              // Retrieve the actual de-emphasized dropdown height if active
              const deEmphasizedMenu = document.querySelector('.dropdown-menu.de-emphasized');
              const dropdownHeight = deEmphasizedMenu ? deEmphasizedMenu.offsetHeight : 0;
              
              const targetOffset = rect.top + window.pageYOffset - navHeight - dropdownHeight - 24;
              window.scrollTo({
                top: targetOffset,
                behavior: 'smooth'
              });
            }, 150); // Wait 150ms for dropdown to begin fading first
          }
        }
        // Case B: Services & Support key
        else if (slug.startsWith('service-')) {
          if (homeView && solView) {
            e.preventDefault();

            if (isNavigating) return;
            isNavigating = true;
            setTimeout(() => { isNavigating = false; }, 400);

            const performScrollAndFocus = () => {
              // Wait 150ms for dropdown to begin fading before starting scroll
              setTimeout(() => {
                const targetEl = document.getElementById(slug);
                if (!targetEl) return;

                const header = document.querySelector('.site-header');
                window.fosemApp.scrollTargetIntoSafeView(targetEl, parentMenu, header);
              }, 150);
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
        if (solutionsData[slug] || slug.startsWith('service-')) {
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

  // Deep linking: load solution or scroll to service if hash is present on load
  const loadHashSolution = () => {
    const hash = window.location.hash;
    if (hash) {
      const solutionKey = hash.substring(1);
      if (solutionsData[solutionKey]) {
        window.fosemApp.loadSolution(solutionKey);
      } else if (solutionKey.startsWith('service-')) {
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
      if (solutionsData[solutionKey]) {
        window.fosemApp.loadSolution(solutionKey);
      } else if (solutionKey.startsWith('service-')) {
        window.fosemApp.scrollToAndFocus(solutionKey);
      }
    } else {
      window.fosemApp.goHome();
    }
  });

  /* --- Footer Enquiry Form Handler --- */
  const footerEnquiryForm = document.getElementById('footer-enquiry-form');
  if (footerEnquiryForm) {
    footerEnquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you for your enquiry. We will get back to you shortly.');
      footerEnquiryForm.reset();
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
        speed: 0.016 + Math.random() * 0.016
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
        
        const pt1 = project(n1.x, n1.y, n1.z);
        const pt2 = project(n2.x, n2.y, n2.z);
        
        if (pt1.z3d >= -15 && pt2.z3d >= -15) {
          const xm = (n1.x + n2.x) / 2;
          const ym = (n1.y + n2.y) / 2;
          const zm = (n1.z + n2.z) / 2;
          const length_mid = Math.sqrt(xm*xm + ym*ym + zm*zm);
          
          const arcH = link.type === 'global' ? 16 : 10;
          const xc = xm + (xm / length_mid) * arcH;
          const yc = ym + (ym / length_mid) * arcH;
          const zc = zm + (zm / length_mid) * arcH;
          
          const ptCtrl = project(xc, yc, zc);
          
          let alpha = Math.min(pt1.z3d, pt2.z3d) / R;
          if (alpha < 0) alpha = 0;
          if (alpha > 1) alpha = 1;
          
          ctx.strokeStyle = `rgba(142, 216, 255, ${alpha * 0.12})`;
          ctx.lineWidth = 0.5 * scale;
          ctx.beginPath();
          ctx.moveTo(pt1.px * scale, pt1.py * scale);
          ctx.quadraticCurveTo(ptCtrl.px * scale, ptCtrl.py * scale, pt2.px * scale, pt2.py * scale);
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
          // Exclude previous link to keep traveling forward to new nodes
          let choices = connected.filter(l => {
            const destId = l.id1 === beam.currentNode.id ? l.id2 : l.id1;
            return destId !== prevId;
          });
          
          if (choices.length === 0 && connected.length > 0) {
            choices = connected; // Fallback to any choice if blocked
          }
          
          if (choices.length > 0) {
            beam.link = choices[Math.floor(Math.random() * choices.length)];
            const nextId = beam.link.id1 === beam.currentNode.id ? beam.link.id2 : beam.link.id1;
            beam.targetNode = data.nodes.find(n => n.id === nextId);
          } else {
            beam.targetNode = data.nodes[Math.floor(Math.random() * data.nodes.length)];
            beam.link = null;
          }
          
          beam.progress = 0;
          beam.speed = 0.02 + Math.random() * 0.022; // Aggressive, snappy speed range
        }
        
        const n1 = beam.currentNode;
        const n2 = beam.targetNode;
        if (!n1 || !n2) return;
        
        // Calculate control point for 3D Arc
        const xm = (n1.x + n2.x) / 2;
        const ym = (n1.y + n2.y) / 2;
        const zm = (n1.z + n2.z) / 2;
        const length_mid = Math.sqrt(xm*xm + ym*ym + zm*zm);
        const arcH = (beam.link && beam.link.type === 'global') ? 16 : 10;
        const xc = xm + (xm / length_mid) * arcH;
        const yc = ym + (ym / length_mid) * arcH;
        const zc = zm + (zm / length_mid) * arcH;
        
        const pt1 = project(n1.x, n1.y, n1.z);
        const pt2 = project(n2.x, n2.y, n2.z);
        const ptCtrl = project(xc, yc, zc);
        
        // If both nodes are visible on the front of the sphere
        if (pt1.z3d >= -15 && pt2.z3d >= -15) {
          let alpha = Math.min(pt1.z3d, pt2.z3d) / R;
          if (alpha < 0) alpha = 0;
          if (alpha > 1) alpha = 1;
          
          // Draw active link with high-contrast dual strokes to create a bold, clean lighted arc
          // Base thicker blue path
          ctx.strokeStyle = `rgba(160, 225, 255, ${alpha * 0.85})`;
          ctx.lineWidth = 1.6 * scale;
          ctx.beginPath();
          ctx.moveTo(pt1.px * scale, pt1.py * scale);
          ctx.quadraticCurveTo(ptCtrl.px * scale, ptCtrl.py * scale, pt2.px * scale, pt2.py * scale);
          ctx.stroke();
          
          // Top thinner white hot core path
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
          ctx.lineWidth = 0.7 * scale;
          ctx.beginPath();
          ctx.moveTo(pt1.px * scale, pt1.py * scale);
          ctx.quadraticCurveTo(ptCtrl.px * scale, ptCtrl.py * scale, pt2.px * scale, pt2.py * scale);
          ctx.stroke();
          
          // Draw the traveling head (comet) along the arc
          const t = beam.progress;
          const x_t = (1-t)*(1-t)*n1.x + 2*(1-t)*t*xc + t*t*n2.x;
          const y_t = (1-t)*(1-t)*n1.y + 2*(1-t)*t*yc + t*t*n2.y;
          const z_t = (1-t)*(1-t)*n1.z + 2*(1-t)*t*zc + t*t*n2.z;
          
          const ptHead = project(x_t, y_t, z_t);
          
          // Bold solid white head dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ptHead.px * scale, ptHead.py * scale, 2.5 * scale, 0, 2 * Math.PI);
          ctx.fill();
          
          // Outer semi-transparent glow ring
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.45})`;
          ctx.beginPath();
          ctx.arc(ptHead.px * scale, ptHead.py * scale, 4.2 * scale, 0, 2 * Math.PI);
          ctx.fill();
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
      
      requestAnimationFrame(render);
    };
    
    requestAnimationFrame(render);
  };
  
  initGlobeCanvas();
});
