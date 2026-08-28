const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = fs.readFileSync('index.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (e) => {
  console.log("VirtualConsole Error:", e);
});
virtualConsole.on("jsdomError", (e) => {
  console.log("JSDOM Error:", e.message, e.detail);
});

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable", virtualConsole });
setTimeout(() => {
  console.log("Done checking with console!");
}, 1000);
