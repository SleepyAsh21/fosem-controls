import re

html = """
      <div class="svc-grid" role="grid">

        <!-- SVG Defs block shared across cards -->
        <svg width="0" height="0" style="position:absolute">
          <defs>
            <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F8FAFC" />
              <stop offset="50%" stop-color="#94A3B8" />
              <stop offset="100%" stop-color="#334155" />
            </linearGradient>
            <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FBBF24" />
              <stop offset="100%" stop-color="#B45309" />
            </linearGradient>
            <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="rgba(255,255,255,0.1)" />
              <stop offset="100%" stop-color="rgba(255,255,255,0.01)" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>

        <!-- 1. Design (Big Square) -->
        <div class="svc-card fade-up" style="--stagger:100ms" role="gridcell" data-index="01">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Grid base -->
              <path d="M50 85 L10 65 L50 45 L90 65 Z" fill="url(#glass)" stroke="url(#metal)" stroke-width="1" stroke-dasharray="2 2" />
              <!-- Cube body -->
              <path d="M50 20 L20 35 L20 65 L50 80 L80 65 L80 35 Z" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" />
              <!-- Top face -->
              <path d="M50 20 L20 35 L50 50 L80 35 Z" fill="rgba(255,255,255,0.05)" stroke="url(#metal)" stroke-width="2" />
              <!-- Left face lines -->
              <path d="M50 50 L20 65 M50 50 L50 80" stroke="url(#metal)" stroke-width="2" />
              <!-- Glowing core -->
              <circle cx="50" cy="50" r="4" fill="url(#gold)" filter="url(#glow)" />
              <line x1="50" y1="50" x2="80" y2="65" stroke="url(#gold)" stroke-width="2" />
              <!-- Blueprint floating elements -->
              <path d="M50 10 L30 20 M50 10 L70 20" stroke="url(#metal)" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
          <h3 class="svc-title">End-to-End System Design</h3>
          <p class="svc-desc">Integrated control solutions designed for seamless performance and long-term scalability.</p>
        </div>

        <!-- 2. Procurement (Wide) -->
        <div class="svc-card fade-up" style="--stagger:200ms" role="gridcell" data-index="02">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Left node -->
              <polygon points="25,45 15,50 15,60 25,65 35,60 35,50" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" />
              <polyline points="15,50 25,55 35,50" stroke="url(#metal)" stroke-width="2" />
              <line x1="25" y1="55" x2="25" y2="65" stroke="url(#metal)" stroke-width="2" />
              
              <!-- Right node -->
              <polygon points="75,45 65,50 65,60 75,65 85,60 85,50" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" />
              <polyline points="65,50 75,55 85,50" stroke="url(#metal)" stroke-width="2" />
              <line x1="75" y1="55" x2="75" y2="65" stroke="url(#metal)" stroke-width="2" />
              
              <!-- Center prominent node -->
              <polygon points="50,25 35,35 35,55 50,65 65,55 65,35" fill="rgba(255,255,255,0.02)" stroke="url(#gold)" stroke-width="2.5" filter="url(#glow)"/>
              <polyline points="35,35 50,45 65,35" stroke="url(#gold)" stroke-width="2.5" />
              <line x1="50" y1="45" x2="50" y2="65" stroke="url(#gold)" stroke-width="2.5" />
              
              <!-- Connecting paths -->
              <path d="M35 55 L25 50 M65 55 L75 50" stroke="url(#metal)" stroke-width="2" stroke-dasharray="4 4" />
            </svg>
          </div>
          <h3 class="svc-title">Procurement</h3>
          <p class="svc-desc">Reliable sourcing of quality components aligned with project needs and timelines.</p>
        </div>

        <!-- 3. Installation -->
        <div class="svc-card fade-up" style="--stagger:300ms" role="gridcell" data-index="03">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(50, 50) rotate(45) translate(-50, -50)">
                <rect x="20" y="20" width="60" height="20" rx="4" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" />
                <rect x="20" y="60" width="60" height="20" rx="4" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" />
                <rect x="40" y="10" width="20" height="80" rx="4" fill="rgba(255,255,255,0.05)" stroke="url(#gold)" stroke-width="2" filter="url(#glow)"/>
                <circle cx="50" cy="50" r="5" fill="url(#metal)" />
              </g>
            </svg>
          </div>
          <h3 class="svc-title">Installation</h3>
          <p class="svc-desc">Professional system installation carried out with precision, safety, and efficiency.</p>
        </div>

        <!-- 4. Programming -->
        <div class="svc-card fade-up" style="--stagger:400ms" role="gridcell" data-index="04">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Data streams -->
              <path d="M20 30 Q 50 10, 80 30 T 20 70" stroke="url(#glass)" stroke-width="4" stroke-linecap="round" />
              <path d="M20 50 Q 50 30, 80 50 T 20 90" stroke="url(#glass)" stroke-width="4" stroke-linecap="round" />
              <!-- Nodes -->
              <rect x="30" y="35" width="40" height="30" rx="6" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" />
              <circle cx="45" cy="50" r="4" fill="url(#gold)" filter="url(#glow)" />
              <circle cx="60" cy="50" r="4" fill="url(#metal)" />
              <line x1="35" y1="40" x2="65" y2="40" stroke="url(#metal)" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <h3 class="svc-title">Programming &amp; Config</h3>
          <p class="svc-desc">Customized programming and system setup optimized for smooth operation.</p>
        </div>

        <!-- 5. Commissioning (Wide) -->
        <div class="svc-card fade-up" style="--stagger:500ms" role="gridcell" data-index="05">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="50" cy="50" rx="40" ry="20" fill="url(#glass)" stroke="url(#metal)" stroke-width="1.5" stroke-dasharray="4 4" />
              <ellipse cx="50" cy="50" rx="25" ry="12" fill="none" stroke="url(#metal)" stroke-width="2" />
              <!-- Core -->
              <path d="M50 20 L60 50 L50 80 L40 50 Z" fill="rgba(255,255,255,0.05)" stroke="url(#gold)" stroke-width="2" filter="url(#glow)" />
              <!-- Crosshairs -->
              <line x1="50" y1="5" x2="50" y2="15" stroke="url(#metal)" stroke-width="2" stroke-linecap="round"/>
              <line x1="50" y1="85" x2="50" y2="95" stroke="url(#metal)" stroke-width="2" stroke-linecap="round"/>
              <line x1="5" y1="50" x2="15" y2="50" stroke="url(#metal)" stroke-width="2" stroke-linecap="round"/>
              <line x1="85" y1="50" x2="95" y2="50" stroke="url(#metal)" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 class="svc-title">Project Commissioning</h3>
          <p class="svc-desc">Detailed testing and system verification to ensure everything performs as intended.</p>
        </div>

        <!-- 6. Integration (Wide) -->
        <div class="svc-card fade-up" style="--stagger:600ms" role="gridcell" data-index="06">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="30" fill="url(#glass)" stroke="url(#metal)" stroke-width="1" stroke-dasharray="2 4" />
              <!-- Satellites -->
              <circle cx="20" cy="50" r="8" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" />
              <circle cx="80" cy="50" r="8" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" />
              <circle cx="50" cy="20" r="8" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" />
              <circle cx="50" cy="80" r="8" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" />
              <!-- Core Hub -->
              <circle cx="50" cy="50" r="14" fill="rgba(255,255,255,0.05)" stroke="url(#gold)" stroke-width="2.5" filter="url(#glow)" />
              <!-- Connections -->
              <line x1="28" y1="50" x2="36" y2="50" stroke="url(#gold)" stroke-width="2" />
              <line x1="72" y1="50" x2="64" y2="50" stroke="url(#gold)" stroke-width="2" />
              <line x1="50" y1="28" x2="50" y2="36" stroke="url(#gold)" stroke-width="2" />
              <line x1="50" y1="72" x2="50" y2="64" stroke="url(#gold)" stroke-width="2" />
            </svg>
          </div>
          <h3 class="svc-title">Systems Integration</h3>
          <p class="svc-desc">Connected technologies unified into one intelligent and efficient operating system.</p>
        </div>

        <!-- 7. Maintenance -->
        <div class="svc-card fade-up" style="--stagger:700ms" role="gridcell" data-index="07">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Gear shape -->
              <path d="M50 20 L55 10 L65 15 L60 25 A25 25 0 0 1 75 40 L85 35 L90 45 L80 50 A25 25 0 0 1 75 60 L85 65 L80 75 L70 70 A25 25 0 0 1 55 78 L50 88 L40 85 L45 75 A25 25 0 0 1 25 60 L15 65 L10 55 L20 50 A25 25 0 0 1 25 40 L15 35 L20 25 L30 30 A25 25 0 0 1 45 22 Z" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" stroke-linejoin="round" />
              <circle cx="50" cy="50" r="12" fill="none" stroke="url(#gold)" stroke-width="2.5" filter="url(#glow)" />
              <!-- Scan line -->
              <line x1="20" y1="50" x2="80" y2="50" stroke="url(#metal)" stroke-width="1.5" stroke-dasharray="5 5" />
            </svg>
          </div>
          <h3 class="svc-title">Maintenance</h3>
          <p class="svc-desc">Ongoing technical support to maintain consistent system reliability.</p>
        </div>

        <!-- 8. Consulting -->
        <div class="svc-card fade-up" style="--stagger:800ms" role="gridcell" data-index="08">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Plane 1 -->
              <path d="M20 70 L50 30 L80 70 Z" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" stroke-linejoin="round"/>
              <!-- Plane 2 -->
              <path d="M20 45 L50 85 L80 45 Z" fill="rgba(255,255,255,0.02)" stroke="url(#gold)" stroke-width="2" stroke-linejoin="round" filter="url(#glow)" />
              <!-- Center line -->
              <line x1="50" y1="30" x2="50" y2="85" stroke="url(#metal)" stroke-width="2" />
            </svg>
          </div>
          <h3 class="svc-title">Consulting</h3>
          <p class="svc-desc">Expert technical guidance focused on practical solutions and planning.</p>
        </div>

        <!-- 9. Project Management (Big Square) -->
        <div class="svc-card fade-up" style="--stagger:900ms" role="gridcell" data-index="09">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Tier 1 (Base) -->
              <path d="M50 90 L10 70 L50 50 L90 70 Z" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" />
              <!-- Tier 2 -->
              <path d="M50 70 L25 57.5 L50 45 L75 57.5 Z" fill="rgba(255,255,255,0.02)" stroke="url(#metal)" stroke-width="2" />
              <path d="M25 57.5 L25 45 M75 57.5 L75 45" stroke="url(#metal)" stroke-width="2" />
              <!-- Tier 3 (Top) -->
              <path d="M50 50 L35 42.5 L50 35 L65 42.5 Z" fill="rgba(255,255,255,0.05)" stroke="url(#gold)" stroke-width="2.5" filter="url(#glow)" />
              <path d="M35 42.5 L35 30 M65 42.5 L65 30 M50 50 L50 35" stroke="url(#gold)" stroke-width="2" />
              <!-- Apex line -->
              <line x1="50" y1="35" x2="50" y2="10" stroke="url(#metal)" stroke-width="1.5" stroke-dasharray="2 2" />
              <circle cx="50" cy="10" r="3" fill="url(#gold)" />
            </svg>
          </div>
          <h3 class="svc-title">Project Management &amp; Oversight</h3>
          <p class="svc-desc">Coordinated execution and supervision to keep projects efficient and on schedule.</p>
        </div>

        <!-- 10. Training (Wide) -->
        <div class="svc-card fade-up" style="--stagger:1000ms" role="gridcell" data-index="10">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Projection base -->
              <ellipse cx="50" cy="80" rx="30" ry="10" fill="url(#glass)" stroke="url(#metal)" stroke-width="2" />
              <!-- Projection rays -->
              <path d="M30 75 L20 30 M70 75 L80 30" stroke="url(#glass)" stroke-width="1.5" stroke-dasharray="3 3" />
              <!-- Hologram Data planes -->
              <path d="M50 20 L20 35 L50 50 L80 35 Z" fill="rgba(255,255,255,0.02)" stroke="url(#gold)" stroke-width="2" filter="url(#glow)" />
              <path d="M50 35 L30 45 L50 55 L70 45 Z" fill="none" stroke="url(#metal)" stroke-width="1.5" />
              <!-- Floating UI elements -->
              <circle cx="20" cy="35" r="2" fill="url(#gold)" />
              <circle cx="80" cy="35" r="2" fill="url(#metal)" />
              <line x1="50" y1="10" x2="50" y2="20" stroke="url(#metal)" stroke-width="2" />
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

