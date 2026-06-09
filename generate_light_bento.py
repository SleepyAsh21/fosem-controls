import re

html = """
      <div class="svc-grid" role="grid">

        <!-- SVG Defs block shared across cards -->
        <svg width="0" height="0" style="position:absolute">
          <defs>
            <linearGradient id="sky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0EA5E9" />
              <stop offset="100%" stop-color="#38BDF8" />
            </linearGradient>
            <linearGradient id="amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F97316" />
              <stop offset="100%" stop-color="#ea660a" />
            </linearGradient>
            <linearGradient id="softBlue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="rgba(14, 165, 233, 0.15)" />
              <stop offset="100%" stop-color="rgba(14, 165, 233, 0.02)" />
            </linearGradient>
            <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>

        <!-- 1. Design (Big Square) -->
        <div class="svc-card fade-up" style="--stagger:100ms" role="gridcell" data-index="01">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Blueprint paper -->
              <path d="M20 30 L80 30 L80 80 L20 80 Z" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="2" />
              <path d="M30 40 L70 40 M30 50 L70 50 M30 60 L70 60" stroke="#0EA5E9" stroke-width="1.5" stroke-dasharray="4 4"/>
              <!-- Drafting Compass -->
              <path d="M50 20 L35 70 M50 20 L65 70" stroke="#1a3a5c" stroke-width="4" stroke-linecap="round"/>
              <circle cx="50" cy="20" r="4" fill="url(#amber)" filter="url(#glowLight)"/>
              <line x1="40" y1="50" x2="60" y2="50" stroke="#1a3a5c" stroke-width="3"/>
            </svg>
          </div>
          <h3 class="svc-title">End-to-End System Design</h3>
          <p class="svc-desc">Integrated control solutions designed for seamless performance and long-term scalability.</p>
        </div>

        <!-- 2. Procurement (Wide) -->
        <div class="svc-card fade-up" style="--stagger:200ms" role="gridcell" data-index="02">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Shipping Crate / Box -->
              <path d="M50 25 L80 40 L80 70 L50 85 L20 70 L20 40 Z" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" stroke-linejoin="round"/>
              <path d="M50 25 L50 55 M20 40 L50 55 L80 40" stroke="#1a3a5c" stroke-width="3" stroke-linejoin="round"/>
              <path d="M50 55 L50 85" stroke="#1a3a5c" stroke-width="3" />
              <polygon points="50,25 35,32 50,40 65,32" fill="url(#amber)" opacity="0.8"/>
            </svg>
          </div>
          <h3 class="svc-title">Procurement</h3>
          <p class="svc-desc">Reliable sourcing of quality components aligned with project needs and timelines.</p>
        </div>

        <!-- 3. Installation -->
        <div class="svc-card fade-up" style="--stagger:300ms" role="gridcell" data-index="03">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Wrench -->
              <path d="M70 20 A15 15 0 0 0 50 35 L20 65 A8 8 0 0 0 35 80 L65 50 A15 15 0 0 0 80 30 Z" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" stroke-linejoin="round"/>
              <circle cx="70" cy="30" r="5" fill="#ffffff" stroke="#1a3a5c" stroke-width="3"/>
              <!-- Gear -->
              <circle cx="30" cy="70" r="12" fill="url(#amber)" filter="url(#glowLight)"/>
              <circle cx="30" cy="70" r="4" fill="#ffffff" />
            </svg>
          </div>
          <h3 class="svc-title">Installation</h3>
          <p class="svc-desc">Professional system installation carried out with precision, safety, and efficiency.</p>
        </div>

        <!-- 4. Programming -->
        <div class="svc-card fade-up" style="--stagger:400ms" role="gridcell" data-index="04">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Laptop -->
              <rect x="25" y="30" width="50" height="35" rx="2" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <path d="M15 70 L85 70" stroke="#1a3a5c" stroke-width="4" stroke-linecap="round" />
              <!-- Code brackets -->
              <path d="M42 42 L35 47 L42 52 M58 42 L65 47 L58 52" stroke="#0EA5E9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3 class="svc-title">Programming &amp; Config</h3>
          <p class="svc-desc">Customized programming and system setup optimized for smooth operation.</p>
        </div>

        <!-- 5. Commissioning (Wide) -->
        <div class="svc-card fade-up" style="--stagger:500ms" role="gridcell" data-index="05">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Clipboard -->
              <rect x="30" y="25" width="40" height="55" rx="3" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <rect x="40" y="15" width="20" height="10" rx="2" fill="#ffffff" stroke="#1a3a5c" stroke-width="3" />
              <!-- Checkmark -->
              <path d="M40 55 L48 63 L65 40" stroke="url(#amber)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowLight)"/>
            </svg>
          </div>
          <h3 class="svc-title">Project Commissioning</h3>
          <p class="svc-desc">Detailed testing and system verification to ensure everything performs as intended.</p>
        </div>

        <!-- 6. Integration (Wide) -->
        <div class="svc-card fade-up" style="--stagger:600ms" role="gridcell" data-index="06">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Puzzle Piece 1 -->
              <path d="M30 30 L50 30 C50 20 65 20 65 30 L70 30 L70 50 C80 50 80 65 70 65 L70 70 L50 70 C50 60 35 60 35 70 L30 70 L30 50 C20 50 20 35 30 35 Z" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <!-- Puzzle Piece 2 (offset to show connecting) -->
              <circle cx="58" cy="58" r="8" fill="url(#amber)" filter="url(#glowLight)"/>
            </svg>
          </div>
          <h3 class="svc-title">Systems Integration</h3>
          <p class="svc-desc">Connected technologies unified into one intelligent and efficient operating system.</p>
        </div>

        <!-- 7. Maintenance -->
        <div class="svc-card fade-up" style="--stagger:700ms" role="gridcell" data-index="07">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Toolbox -->
              <rect x="25" y="45" width="50" height="30" rx="2" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <path d="M25 55 L75 55" stroke="#1a3a5c" stroke-width="3" />
              <path d="M40 45 L40 30 L60 30 L60 45" fill="none" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round"/>
              <rect x="45" y="52" width="10" height="6" fill="url(#amber)"/>
            </svg>
          </div>
          <h3 class="svc-title">Maintenance</h3>
          <p class="svc-desc">Ongoing technical support to maintain consistent system reliability.</p>
        </div>

        <!-- 8. Consulting -->
        <div class="svc-card fade-up" style="--stagger:800ms" role="gridcell" data-index="08">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Lightbulb -->
              <path d="M50 20 C35 20 25 30 25 45 C25 55 35 60 38 70 L62 70 C65 60 75 55 75 45 C75 30 65 20 50 20 Z" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <rect x="40" y="70" width="20" height="10" rx="2" fill="#ffffff" stroke="#1a3a5c" stroke-width="3" />
              <!-- Filament -->
              <path d="M45 45 L50 35 L55 45" stroke="url(#amber)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowLight)"/>
            </svg>
          </div>
          <h3 class="svc-title">Consulting</h3>
          <p class="svc-desc">Expert technical guidance focused on practical solutions and planning.</p>
        </div>

        <!-- 9. Project Management (Big Square) -->
        <div class="svc-card fade-up" style="--stagger:900ms" role="gridcell" data-index="09">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Calendar / Timeline -->
              <rect x="25" y="30" width="50" height="50" rx="4" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <path d="M25 45 L75 45" stroke="#1a3a5c" stroke-width="3" />
              <!-- Binders -->
              <line x1="35" y1="20" x2="35" y2="35" stroke="#1a3a5c" stroke-width="4" stroke-linecap="round" />
              <line x1="65" y1="20" x2="65" y2="35" stroke="#1a3a5c" stroke-width="4" stroke-linecap="round" />
              <!-- Check marks/Timeline nodes -->
              <circle cx="40" cy="58" r="4" fill="url(#amber)" filter="url(#glowLight)"/>
              <line x1="50" y1="58" x2="65" y2="58" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />
              <circle cx="40" cy="70" r="4" fill="#0EA5E9" />
              <line x1="50" y1="70" x2="65" y2="70" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />
            </svg>
          </div>
          <h3 class="svc-title">Project Management &amp; Oversight</h3>
          <p class="svc-desc">Coordinated execution and supervision to keep projects efficient and on schedule.</p>
        </div>

        <!-- 10. Training (Wide) -->
        <div class="svc-card fade-up" style="--stagger:1000ms" role="gridcell" data-index="10">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Open Book -->
              <path d="M50 75 Q 30 75 15 65 L15 25 Q 30 35 50 35 Q 70 35 85 25 L85 65 Q 70 75 50 75 Z" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" stroke-linejoin="round"/>
              <!-- Book spine/center -->
              <line x1="50" y1="35" x2="50" y2="75" stroke="#1a3a5c" stroke-width="3" />
              <!-- Graduation Cap / Spark -->
              <path d="M30 45 L50 35 L70 45 L50 55 Z" fill="url(#amber)" filter="url(#glowLight)"/>
            </svg>
          </div>
          <h3 class="svc-title">Client / Operator Training</h3>
          <p class="svc-desc">Hands-on training designed to support confident and effective system operation.</p>
        </div>

      </div>
"""

with open('index.html', 'r') as f:
    text = f.read()

pattern = re.compile(r'<div class="svc-grid" role="grid">.*?</div>\s*</section>', re.DOTALL)
new_html = html + '\n  </section>'
text = pattern.sub(new_html, text)

with open('index.html', 'w') as f:
    f.write(text)

