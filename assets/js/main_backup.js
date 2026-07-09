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

  // Scroll transparency & shadow (Optimized with requestAnimationFrame)
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 20);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // Mobile menu toggle
  if (mobileMenuBtn) {
    const mobileBtnCallback = (e) => {
      e.stopPropagation(); // Prevent bubbling to document click listener
      mainNav.classList.toggle('active');
      mainNav.classList.toggle('open');
      mobileMenuBtn.classList.toggle('active');
    };
    mobileMenuBtn.addEventListener('click', mobileBtnCallback);
  }

  // Mobile dropdown toggles (resize-proof)
  document.querySelectorAll('.nav-item .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        link.parentElement.classList.toggle('active');
        // Reset any open drill-downs inside this nav-item
        const drilldown = link.parentElement.querySelector('.drilldown-container');
        if (drilldown) {
          drilldown.classList.remove('show-level-2');
          drilldown.querySelectorAll('.drilldown-level-2').forEach(p => p.classList.remove('active-panel'));
        }
      }
    });
  });

  // Mobile Drill-Down Logic
  document.querySelectorAll('.drilldown-item-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        const targetId = toggle.getAttribute('data-target');
        const container = toggle.closest('.drilldown-container');
        const targetPanel = container.querySelector('#' + targetId);
        
        container.querySelectorAll('.drilldown-level-2').forEach(panel => {
          panel.classList.remove('active-panel');
        });
        
        if (targetPanel) {
          targetPanel.classList.add('active-panel');
          container.classList.add('show-level-2');
        }
      }
    });
  });

  document.querySelectorAll('.drilldown-back').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        const container = btn.closest('.drilldown-container');
        container.classList.remove('show-level-2');
        setTimeout(() => {
          if (!container.classList.contains('show-level-2')) {
            container.querySelectorAll('.drilldown-level-2').forEach(panel => {
              panel.classList.remove('active-panel');
            });
          }
        }, 300);
      }
    });
  });

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

    // Add detail-active class for mobile master-detail view
    const wrapper = document.querySelector('.sol-layout-wrapper');
    if (wrapper && window.innerWidth <= 1024) {
      wrapper.classList.add('detail-active');
    }

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
      duration = 3500;
    } else {
      animClass = 'focus-highlight-pop';
      duration = 3500;
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

      window.fosemApp.fastScrollTo(targetScrollY, 400);

      // Trigger focus pop precisely as the fast scroll finishes
      setTimeout(() => {
        this.triggerCardFocus(slug);
      }, 400);
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
  /* --- Rebuild Desktop Dropdown Positioning & Interaction System --- */
  let activeDropdown = null;
  let closeTimeoutId = null;

  const closeAllDropdowns = (instant = false) => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.remove('is-open', 'de-emphasized');
      if (instant) {
        menu.classList.add('force-closed');
      } else {
        menu.classList.remove('force-closed');
      }
    });
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('is-open');
      if (window.innerWidth <= 1024) {
        item.classList.remove('active');
      }
    });
    
    // Close entire mobile menu if explicitly requested via argument, NOT by default on every click outside
    if (window.innerWidth <= 1024 && instant === 'closeMainMenu') {
      const mainNav = document.getElementById('main-nav');
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');
      if (mainNav) mainNav.classList.remove('active', 'open');
      if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
    }
    
    activeDropdown = null;
  };

  const positionDropdown = (trigger, dropdown) => {
    if (!dropdown || !trigger || window.innerWidth <= 1024) {
      if (dropdown) {
        dropdown.style.left = '';
        dropdown.style.top = '';
        dropdown.style.transform = '';
      }
      return;
    }

    const viewportWidth = window.innerWidth;
    const triggerRect = trigger.getBoundingClientRect();
    
    // Save current styling to restore
    const originalDisplay = dropdown.style.display;
    const originalVisibility = dropdown.style.visibility;
    const originalTransform = dropdown.style.transform;
    
    // Force visibility to measure dimensions correctly
    dropdown.style.display = 'flex';
    dropdown.style.visibility = 'visible';
    dropdown.style.transform = 'none';
    const dropdownWidth = dropdown.offsetWidth;
    
    // Restore styling
    dropdown.style.display = originalDisplay;
    dropdown.style.visibility = originalVisibility;
    dropdown.style.transform = originalTransform;

    const triggerWidth = triggerRect.width;

    const parentItem = trigger.closest('.nav-item');
    const parentRect = parentItem.getBoundingClientRect();
    const triggerRelativeLeft = triggerRect.left - parentRect.left;

    // Center of dropdown aligned to center of trigger button
    let left = triggerRelativeLeft + (triggerWidth - dropdownWidth) / 2;

    // Absolute screen coordinates of the dropdown to check for viewport overflow
    const absoluteLeft = triggerRect.left + (triggerWidth - dropdownWidth) / 2;
      activeDropdown.style.left = '';
      activeDropdown.style.top = '';
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

        // Close dropdown and main menu instantly on click
        const parentMenu = link.closest('.dropdown-menu');
        if (parentMenu) {
          closeAllDropdowns('closeMainMenu');
        }

        // If it's an industry link, let the specific industry handler below deal with it
        if (link.closest('.mega-menu--industries')) {
          return;
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
        // Case C: Any other internal link (About Us, Footer, etc)
        else {
          const targetEl = document.getElementById(slug);
          if (targetEl) {
            e.preventDefault();
            
            if (isNavigating) return;
            isNavigating = true;
            setTimeout(() => { isNavigating = false; }, 400);

            const performScroll = () => {
              setTimeout(() => {
                const navbar = document.querySelector('.site-header');
                const navHeight = navbar ? navbar.offsetHeight : 80;
                const targetOffset = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                
                window.fosemApp.fastScrollTo(targetOffset, 450);
              }, 150); // Wait for dropdown to begin fading
            };

            // Transition from solutions view back to home first if necessary
            if (homeView && solView && !solView.classList.contains('view-hidden')) {
              window.fosemApp.goHome();
              setTimeout(performScroll, 350);
            } else {
              performScroll();
            }
          }
        }
      }
    });
  });

  // Fast custom ease-out smooth scroll implementation (snappy, highly optimized, 60fps)
  window.fosemApp.fastScrollTo = function(targetY, duration = 450) {
    const startY = window.pageYOffset;
    const difference = targetY - startY;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Snappy ease-out cubic curve: starts very fast, settles smoothly
      const ease = 1 - Math.pow(1 - progress, 3);
      
      window.scrollTo(0, startY + difference * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  // Handle click on Industries mega-menu links (scroll to section + highlight text)
  const industryLinks = document.querySelectorAll('.mega-menu--industries a[href*="expertise"]');
  industryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const industryName = link.textContent.trim();
      
      // If clicking the EXACT same industry that is currently animating, ignore the click
      if (window.fosemApp.currentIndustryHighlight === industryName) {
        return;
      }
      
      closeAllDropdowns();
      
      const performScrollAndHighlight = () => {
        const h4Elements = Array.from(document.querySelectorAll('.expertise-sub-item h4'));
        const matchedH4 = h4Elements.find(h4 => h4.textContent.trim().toLowerCase() === industryName.toLowerCase());
        const targetCard = matchedH4 ? matchedH4.closest('.expertise-sub-item') : document.getElementById('expertise');
        
        if (targetCard) {
          const navbar = document.querySelector('.site-header');
          const navHeight = navbar ? navbar.offsetHeight : 80;
          const targetOffset = targetCard.getBoundingClientRect().top + window.pageYOffset - navHeight - 40;
          
          // Clear any previous highlights instantly
          document.querySelectorAll('.industry-highlight-active').forEach(el => {
            el.classList.remove('industry-highlight-active');
          });
          if (window.fosemApp.industryHighlightTimeoutId) {
            clearTimeout(window.fosemApp.industryHighlightTimeoutId);
          }
          if (window.fosemApp.industryScrollTimeoutId) {
            clearTimeout(window.fosemApp.industryScrollTimeoutId);
          }
          
          window.fosemApp.currentIndustryHighlight = industryName;
          
          // Use high-performance fast custom scroll
          window.fosemApp.fastScrollTo(targetOffset, 400);
          
          if (matchedH4) {
            window.fosemApp.industryScrollTimeoutId = setTimeout(() => {
              matchedH4.classList.add('industry-highlight-active');
              
              // Clean up class after animation so it can be clicked again
              window.fosemApp.industryHighlightTimeoutId = setTimeout(() => {
                matchedH4.classList.remove('industry-highlight-active');
                if (window.fosemApp.currentIndustryHighlight === industryName) {
                  window.fosemApp.currentIndustryHighlight = null;
                }
              }, 2000);
            }, 400); // Fire perfectly in sync as scroll finishes
          } else {
            window.fosemApp.currentIndustryHighlight = null;
          }
        }
      };

      const solView = document.getElementById('solutions-view');
      if (solView && !solView.classList.contains('view-hidden')) {
        window.fosemApp.goHome();
        setTimeout(performScrollAndHighlight, 350);
      } else {
        performScrollAndHighlight();
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
  
  // Handle smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      if(this.getAttribute('href').length === 1) return; // skip #
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Handle service card text truncation for long texts
  const truncateServiceCards = () => {
    document.querySelectorAll('.service-card-desc').forEach(desc => {
      // If already wrapped, skip
      if (desc.parentElement.classList.contains('service-desc-wrapper')) return;
      
      // Assume line height is ~1.5 to 1.7. ~4.6em is ~75px. 
      // If the scrollHeight is more than ~75px, it means it's 4+ lines.
      if (desc.scrollHeight > 80) {
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'service-desc-wrapper';
        desc.parentNode.insertBefore(wrapper, desc);
        wrapper.appendChild(desc);
        
        // Create button
        const btn = document.createElement('button');
        btn.className = 'service-read-more';
        btn.innerText = 'Read more';
        wrapper.parentNode.insertBefore(btn, wrapper.nextSibling);
        
        btn.addEventListener('click', () => {
          wrapper.classList.toggle('expanded');
          btn.innerText = wrapper.classList.contains('expanded') ? 'Read less' : 'Read more';
        });
      }
    });
  };

  // Run on load and after short delay for fonts
  truncateServiceCards();
  setTimeout(truncateServiceCards, 500);

  // Sidebar navigation
  const sidebarButtons = document.querySelectorAll('.sol-nav-btn');
  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const solKey = btn.getAttribute('data-sol');
      window.fosemApp.loadSolution(solKey);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Master-Detail back button logic for mobile
  const mobileBackBtn = document.getElementById('sol-mobile-back');
  if (mobileBackBtn) {
    mobileBackBtn.addEventListener('click', () => {
      const wrapper = document.querySelector('.sol-layout-wrapper');
      if (wrapper) {
        wrapper.classList.remove('detail-active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Back to home button logic in solutions viewbar
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

});
