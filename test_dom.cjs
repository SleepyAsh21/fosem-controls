const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

const industriesSpan = Array.from(document.querySelectorAll('.nav-link')).find(el => el.textContent.includes('Industries'));
if (!industriesSpan) {
  console.log("Industries link not found");
} else {
  const dropdown = industriesSpan.nextElementSibling;
  console.log("Industries dropdown classes:", dropdown ? dropdown.className : "No dropdown found");
}
