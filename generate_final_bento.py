import re
import sys
from pathlib import Path

# Helper to read paths from SVGs
def get_svg_path(svg_path):
    with open(svg_path, 'r') as f:
        content = f.read()
    # Extract path elements
    paths = re.findall(r'<path[^>]*d="[^"]+"[^>]*>', content)
    # Return all paths concatenated
    return "\n            ".join(paths)

svg_dir = Path("tmp/custom-icons/fosem")

# Extract paths for traced icons
design_paths = get_svg_path(svg_dir / "design.svg")
procurement_paths = get_svg_path(svg_dir / "procurement.svg")
installation_paths = get_svg_path(svg_dir / "installation.svg")
programming_paths = get_svg_path(svg_dir / "programming.svg")
commissioning_paths = get_svg_path(svg_dir / "commissioning.svg")
integration_paths = get_svg_path(svg_dir / "integration.svg")

# Manual SVGs content
with open(svg_dir / "maintenance.svg", 'r') as f:
    maintenance_svg = f.read()

with open(svg_dir / "consulting.svg", 'r') as f:
    consulting_svg = f.read()

with open(svg_dir / "pm.svg", 'r') as f:
    pm_svg = f.read()

with open(svg_dir / "training.svg", 'r') as f:
    training_svg = f.read()

# Build the HTML
html = f"""
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
            <svg viewBox="0 0 687 718" xmlns="http://www.w3.org/2000/svg">
              <circle cx="340" cy="360" r="160" fill="rgba(14, 165, 233, 0.08)" />
              <g fill="#1a3a5c">
                {design_paths}
              </g>
            </svg>
          </div>
          <h3 class="svc-title">End-to-End System Design</h3>
          <p class="svc-desc">Integrated control solutions designed for seamless performance and long-term scalability.</p>
        </div>

        <!-- 2. Procurement (Wide) -->
        <div class="svc-card fade-up" style="--stagger:200ms" role="gridcell" data-index="02">
          <div class="svc-icon">
            <svg viewBox="0 0 850 835" xmlns="http://www.w3.org/2000/svg">
              <circle cx="425" cy="417" r="180" fill="rgba(14, 165, 233, 0.08)" />
              <g fill="#1a3a5c">
                {procurement_paths}
              </g>
            </svg>
          </div>
          <h3 class="svc-title">Procurement</h3>
          <p class="svc-desc">Reliable sourcing of quality components aligned with project needs and timelines.</p>
        </div>

        <!-- 3. Installation -->
        <div class="svc-card fade-up" style="--stagger:300ms" role="gridcell" data-index="03">
          <div class="svc-icon">
            <svg viewBox="0 0 712 772" xmlns="http://www.w3.org/2000/svg">
              <circle cx="356" cy="386" r="160" fill="rgba(14, 165, 233, 0.08)" />
              <g fill="#1a3a5c">
                {installation_paths}
              </g>
            </svg>
          </div>
          <h3 class="svc-title">Installation</h3>
          <p class="svc-desc">Professional system installation carried out with precision, safety, and efficiency.</p>
        </div>

        <!-- 4. Programming -->
        <div class="svc-card fade-up" style="--stagger:400ms" role="gridcell" data-index="04">
          <div class="svc-icon">
            <svg viewBox="0 0 766 818" xmlns="http://www.w3.org/2000/svg">
              <circle cx="383" cy="409" r="180" fill="rgba(14, 165, 233, 0.08)" />
              <g fill="#1a3a5c">
                {programming_paths}
              </g>
            </svg>
          </div>
          <h3 class="svc-title">Programming &amp; Config</h3>
          <p class="svc-desc">Customized programming and system setup optimized for smooth operation and control.</p>
        </div>

        <!-- 5. Commissioning (Wide) -->
        <div class="svc-card fade-up" style="--stagger:500ms" role="gridcell" data-index="05">
          <div class="svc-icon">
            <svg viewBox="0 0 526 752" xmlns="http://www.w3.org/2000/svg">
              <circle cx="263" cy="376" r="150" fill="rgba(14, 165, 233, 0.08)" />
              <g fill="#1a3a5c">
                {commissioning_paths}
              </g>
            </svg>
          </div>
          <h3 class="svc-title">Project Commissioning</h3>
          <p class="svc-desc">Detailed testing and system verification to ensure everything performs as intended.</p>
        </div>

        <!-- 6. Integration (Wide) -->
        <div class="svc-card fade-up" style="--stagger:600ms" role="gridcell" data-index="06">
          <div class="svc-icon">
            <svg viewBox="0 0 640 558" xmlns="http://www.w3.org/2000/svg">
              <circle cx="320" cy="279" r="140" fill="rgba(14, 165, 233, 0.08)" />
              <g fill="#1a3a5c">
                {integration_paths}
              </g>
            </svg>
          </div>
          <h3 class="svc-title">Systems Integration</h3>
          <p class="svc-desc">Connected technologies unified into one intelligent and efficient operating system.</p>
        </div>

        <!-- 7. Maintenance -->
        <div class="svc-card fade-up" style="--stagger:700ms" role="gridcell" data-index="07">
          <div class="svc-icon">
            {maintenance_svg}
          </div>
          <h3 class="svc-title">Maintenance</h3>
          <p class="svc-desc">Ongoing technical support and servicing to maintain consistent system reliability.</p>
        </div>

        <!-- 8. Consulting -->
        <div class="svc-card fade-up" style="--stagger:800ms" role="gridcell" data-index="08">
          <div class="svc-icon">
            {consulting_svg}
          </div>
          <h3 class="svc-title">Consulting</h3>
          <p class="svc-desc">Expert technical guidance focused on practical solutions and smarter planning.</p>
        </div>

        <!-- 9. Project Management (Big Square) -->
        <div class="svc-card fade-up" style="--stagger:900ms" role="gridcell" data-index="09">
          <div class="svc-icon">
            {pm_svg}
          </div>
          <h3 class="svc-title">Project Management &amp; Oversight</h3>
          <p class="svc-desc">Coordinated execution and supervision to keep projects efficient and on schedule.</p>
        </div>

        <!-- 10. Training (Wide) -->
        <div class="svc-card fade-up" style="--stagger:1000ms" role="gridcell" data-index="10">
          <div class="svc-icon">
            {training_svg}
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

# Clean up namespace/duplicate xml declarations in inline SVGs if present
text = text.replace('<?xml version="1.0" standalone="no"?>', '')

with open('index.html', 'w') as f:
    f.write(text)

print("HTML successfully updated with final premium icons!")
