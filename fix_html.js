const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /(<div id="service-[^"]+" class="service-new-card reveal-\w+)(" role="gridcell">)/g;
html = html.replace(regex, "$1 expandable-card\" role=\"gridcell\" onclick=\"this.classList.toggle('expanded')\">");

const descRegex = /(<p class="service-card-desc line-clamp-3">.*?<\/p>)(?!\s*<div class="read-more-label">)/gs;
html = html.replace(descRegex, "$1\n            <div class=\"read-more-label\">Tap to read more</div>");

fs.writeFileSync('index.html', html);
console.log("HTML fixed.");
