import re

html = """
      <div class="svc-grid" role="grid">

        <!-- SVG Defs block shared across cards -->
        <svg width="0" height="0" style="position:absolute">
          <defs>
            <linearGradient id="softBlue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="rgba(14, 165, 233, 0.15)" />
              <stop offset="100%" stop-color="rgba(14, 165, 233, 0.02)" />
            </linearGradient>
          </defs>
        </svg>

        <!-- 1. Design (Big Square) -->
        <div class="svc-card fade-up" style="--stagger:100ms" role="gridcell" data-index="01">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Drafting Desk/Blueprint -->
              <rect x="20" y="30" width="60" height="40" rx="4" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <!-- Blueprint lines -->
              <line x1="30" y1="40" x2="70" y2="40" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round" />
              <line x1="30" y1="50" x2="60" y2="50" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round" />
              <line x1="30" y1="60" x2="50" y2="60" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round" />
              <!-- Pencil/Tools -->
              <path d="M75 25 L65 35 L68 38 L78 28 Z" fill="#ffffff" stroke="#1a3a5c" stroke-width="2" stroke-linejoin="round" />
              <path d="M65 35 L62 42 L68 38 Z" fill="#1a3a5c" />
              <!-- Compass -->
              <path d="M40 70 L50 20 L60 70" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="50" cy="20" r="4" fill="#ffffff" stroke="#1a3a5c" stroke-width="3" />
            </svg>
          </div>
          <h3 class="svc-title">End-to-End System Design</h3>
          <p class="svc-desc">Integrated control solutions designed for seamless performance and long-term scalability.</p>
        </div>

        <!-- 2. Procurement (Wide) -->
        <div class="svc-card fade-up" style="--stagger:200ms" role="gridcell" data-index="02">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Shipping Box -->
              <rect x="30" y="40" width="40" height="35" rx="2" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <path d="M30 40 L45 25 L85 25 L70 40 Z" fill="#ffffff" stroke="#1a3a5c" stroke-width="3" stroke-linejoin="round" />
              <path d="M70 40 L70 75 L85 60 L85 25 Z" fill="#ffffff" stroke="#1a3a5c" stroke-width="3" stroke-linejoin="round" />
              <!-- Tape/Label -->
              <line x1="50" y1="40" x2="50" y2="75" stroke="#1a3a5c" stroke-width="3" />
              <rect x="35" y="50" width="10" height="15" fill="#0EA5E9" rx="1" />
            </svg>
          </div>
          <h3 class="svc-title">Procurement</h3>
          <p class="svc-desc">Reliable sourcing of quality components aligned with project needs and timelines.</p>
        </div>

        <!-- 3. Installation -->
        <div class="svc-card fade-up" style="--stagger:300ms" role="gridcell" data-index="03">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Worker Profile -->
              <path d="M35 80 C35 60 65 60 65 80" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />
              <!-- Face -->
              <circle cx="50" cy="45" r="12" fill="#ffffff" stroke="#1a3a5c" stroke-width="3" />
              <!-- Hardhat -->
              <path d="M36 45 C36 30 64 30 64 45 Z" fill="#0EA5E9" stroke="#1a3a5c" stroke-width="3" stroke-linejoin="round" />
              <line x1="30" y1="45" x2="70" y2="45" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />
              <line x1="50" y1="33" x2="50" y2="45" stroke="#1a3a5c" stroke-width="3" />
            </svg>
          </div>
          <h3 class="svc-title">Installation</h3>
          <p class="svc-desc">Professional system installation carried out with precision, safety, and efficiency.</p>
        </div>

        <!-- 4. Programming -->
        <div class="svc-card fade-up" style="--stagger:400ms" role="gridcell" data-index="04">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Monitors -->
              <rect x="15" y="30" width="30" height="25" rx="2" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <rect x="55" y="30" width="30" height="25" rx="2" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <!-- Code brackets on monitors -->
              <polyline points="25,38 20,42.5 25,47" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <polyline points="75,38 80,42.5 75,47" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <!-- Desk/Person -->
              <line x1="10" y1="80" x2="90" y2="80" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />
              <!-- Person head & shoulders from behind -->
              <circle cx="50" cy="55" r="8" fill="#ffffff" stroke="#1a3a5c" stroke-width="3" />
              <path d="M38 80 C38 65 62 65 62 80" fill="#0EA5E9" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />
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
              <!-- Checkmarks and lines -->
              <line x1="40" y1="40" x2="60" y2="40" stroke="#1a3a5c" stroke-width="2" stroke-linecap="round"/>
              <line x1="40" y1="55" x2="60" y2="55" stroke="#1a3a5c" stroke-width="2" stroke-linecap="round"/>
              <line x1="40" y1="70" x2="50" y2="70" stroke="#1a3a5c" stroke-width="2" stroke-linecap="round"/>
              <!-- Big Check -->
              <path d="M60 50 L75 65 L95 30" stroke="#0EA5E9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3 class="svc-title">Project Commissioning</h3>
          <p class="svc-desc">Detailed testing and system verification to ensure everything performs as intended.</p>
        </div>

        <!-- 6. Integration (Wide) -->
        <div class="svc-card fade-up" style="--stagger:600ms" role="gridcell" data-index="06">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Server Nodes / Arrows -->
              <rect x="15" y="25" width="30" height="50" rx="3" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <rect x="55" y="25" width="30" height="50" rx="3" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <line x1="20" y1="35" x2="40" y2="35" stroke="#1a3a5c" stroke-width="2" stroke-linecap="round" />
              <line x1="60" y1="35" x2="80" y2="35" stroke="#1a3a5c" stroke-width="2" stroke-linecap="round" />
              <!-- Sync Arrows -->
              <path d="M30 60 L70 60" stroke="#0EA5E9" stroke-width="3" stroke-linecap="round" />
              <polygon points="65,55 75,60 65,65" fill="#0EA5E9" />
              
              <path d="M70 45 L30 45" stroke="#0EA5E9" stroke-width="3" stroke-linecap="round" />
              <polygon points="35,40 25,45 35,50" fill="#0EA5E9" />
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
              <path d="M25 45 L75 45 L70 80 L30 80 Z" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" stroke-linejoin="round" />
              <path d="M25 45 L40 25 L60 25 L75 45" fill="none" stroke="#1a3a5c" stroke-width="3" stroke-linejoin="round" />
              <!-- Handle -->
              <rect x="40" y="20" width="20" height="5" fill="#1a3a5c" />
              <!-- Wrench sticking out -->
              <path d="M60 45 L65 30 A5 5 0 0 0 75 35 L70 45" fill="#ffffff" stroke="#0EA5E9" stroke-width="3" stroke-linejoin="round" />
            </svg>
          </div>
          <h3 class="svc-title">Maintenance</h3>
          <p class="svc-desc">Ongoing technical support to maintain consistent system reliability.</p>
        </div>

        <!-- 8. Consulting -->
        <div class="svc-card fade-up" style="--stagger:800ms" role="gridcell" data-index="08">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Desk/Table -->
              <line x1="20" y1="80" x2="80" y2="80" stroke="#1a3a5c" stroke-width="4" stroke-linecap="round" />
              <!-- Left Person -->
              <circle cx="35" cy="45" r="8" fill="#ffffff" stroke="#1a3a5c" stroke-width="3" />
              <path d="M20 80 C20 65 50 65 50 80" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />
              <!-- Right Person (talking) -->
              <circle cx="65" cy="45" r="8" fill="#ffffff" stroke="#1a3a5c" stroke-width="3" />
              <path d="M50 80 C50 65 80 65 80 80" fill="#0EA5E9" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />
              <!-- Speech bubble -->
              <path d="M45 35 Q 50 25 60 25 Q 70 25 75 30 Q 70 35 60 35 L55 40 Z" fill="#ffffff" stroke="#1a3a5c" stroke-width="2" stroke-linejoin="round" />
            </svg>
          </div>
          <h3 class="svc-title">Consulting</h3>
          <p class="svc-desc">Expert technical guidance focused on practical solutions and planning.</p>
        </div>

        <!-- 9. Project Management (Big Square) -->
        <div class="svc-card fade-up" style="--stagger:900ms" role="gridcell" data-index="09">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Presentation Board -->
              <rect x="15" y="20" width="70" height="50" rx="3" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <line x1="30" y1="70" x2="20" y2="90" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />
              <line x1="70" y1="70" x2="80" y2="90" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />
              <!-- Gantt Chart bars -->
              <rect x="25" y="30" width="30" height="6" rx="3" fill="#0EA5E9" />
              <rect x="40" y="45" width="35" height="6" rx="3" fill="#1a3a5c" />
              <rect x="30" y="60" width="40" height="6" rx="3" fill="#0EA5E9" />
            </svg>
          </div>
          <h3 class="svc-title">Project Management &amp; Oversight</h3>
          <p class="svc-desc">Coordinated execution and supervision to keep projects efficient and on schedule.</p>
        </div>

        <!-- 10. Training (Wide) -->
        <div class="svc-card fade-up" style="--stagger:1000ms" role="gridcell" data-index="10">
          <div class="svc-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Screen/Whiteboard -->
              <rect x="45" y="20" width="40" height="30" rx="2" fill="url(#softBlue)" stroke="#1a3a5c" stroke-width="3" />
              <line x1="55" y1="30" x2="75" y2="30" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round" />
              <line x1="55" y1="40" x2="65" y2="40" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round" />
              
              <!-- Instructor -->
              <circle cx="30" cy="40" r="8" fill="#ffffff" stroke="#1a3a5c" stroke-width="3" />
              <path d="M15 75 C15 55 45 55 45 75" fill="#0EA5E9" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />
              <!-- Pointing Arm -->
              <path d="M35 55 L50 45" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />

              <!-- Student -->
              <circle cx="70" cy="55" r="8" fill="#ffffff" stroke="#1a3a5c" stroke-width="3" />
              <path d="M55 85 C55 70 85 70 85 85" fill="#ffffff" stroke="#1a3a5c" stroke-width="3" stroke-linecap="round" />
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

