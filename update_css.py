import re

with open('styles.css', 'r') as f:
    css = f.read()

# Replace the svc-grid CSS section
new_css = """
.svc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 240px;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.svc-card {
  background: linear-gradient(145deg, #121D2F, #090E17);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 400ms ease, border-color 400ms ease;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 4px 12px rgba(0,0,0,0.2);
}

.svc-card:hover {
  transform: translateY(-4px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 12px 30px rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.15);
}

/* Dark theme overrides for text inside cards */
.svc-card .svc-title {
  color: #ffffff;
  margin-top: auto; /* Push text to bottom */
  font-size: 1.25rem;
  margin-bottom: 8px;
}
.svc-card .svc-desc {
  color: #94A3B8;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.svc-card .svc-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
}

/* Large square cards get bigger icons */
.svc-card:nth-child(1) .svc-icon,
.svc-card:nth-child(9) .svc-icon {
  width: 140px;
  height: 140px;
}

/* Bento Grid Placement */
.svc-card:nth-child(1) { grid-column: span 2; grid-row: span 2; }
.svc-card:nth-child(2) { grid-column: span 2; }
.svc-card:nth-child(3) { grid-column: span 1; }
.svc-card:nth-child(4) { grid-column: span 1; }
.svc-card:nth-child(5) { grid-column: span 2; }
.svc-card:nth-child(6) { grid-column: span 2; }
.svc-card:nth-child(7) { grid-column: span 1; }
.svc-card:nth-child(8) { grid-column: span 1; }
.svc-card:nth-child(9) { grid-column: span 2; grid-row: span 2; }
.svc-card:nth-child(10) { grid-column: span 2; }

/* Architectural watermark */
.svc-card::after {
  content: attr(data-index);
  position: absolute;
  top: 24px;
  right: 24px;
  font-family: var(--font-heading);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.1);
  pointer-events: none;
  transition: color 400ms ease;
}
.svc-card:hover::after {
  color: rgba(255, 255, 255, 0.3);
}

/* Remove old modifiers */
.svc-card--wide {
  flex-direction: column; /* Reset to normal */
  align-items: flex-start;
  text-align: left;
}
"""

pattern = re.compile(r'\.svc-grid \{.*?\.svc-card--wide \{.*?\}', re.DOTALL)
css = pattern.sub(new_css, css)

with open('styles.css', 'w') as f:
    f.write(css)

