import re

with open('styles.css', 'r') as f:
    css = f.read()

new_css = """
.svc-card {
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 400ms ease, border-color 400ms ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
}

.svc-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);
  border-color: #CBD5E1;
}

/* Light theme overrides for text inside cards */
.svc-card .svc-title {
  color: #1a3a5c; /* Fosem Navy */
  margin-top: auto;
  font-size: 1.25rem;
  margin-bottom: 8px;
  font-weight: 700;
}
.svc-card .svc-desc {
  color: #475569; /* Slate 600 */
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
  color: rgba(26, 58, 92, 0.08); /* Light mode watermark */
  pointer-events: none;
  transition: color 400ms ease;
}
.svc-card:hover::after {
  color: rgba(26, 58, 92, 0.15);
}

/* Remove old modifiers */
.svc-card--wide {
  flex-direction: column; /* Reset to normal */
  align-items: flex-start;
  text-align: left;
}
"""

pattern = re.compile(r'\.svc-card \{.*?\.svc-card--wide \{.*?\}', re.DOTALL)
css = pattern.sub(new_css, css)

with open('styles.css', 'w') as f:
    f.write(css)

