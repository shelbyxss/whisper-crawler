const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const URL = require("url").URL;

const KEYWORDS = ["verify", "secure", "password", "token", "login", "continue"];
const MAX_DEPTH = 2;
const visited = new Set();
const results = [];

function containsBait(str) {
  return KEYWORDS.some(kw => str.toLowerCase().includes(kw));
}

function scoreElement(el) {
  let score = 0;
  if (el.hidden && el.role) score += 3;
  if (el.hidden && el.ariaLabel) score += 2;
  if (el.tag === "DIV" && ["textbox", "button", "region"].includes(el.role)) score += 2;
  if (el.hidden && el.text.length > 100) score += 2;
  if (containsBait(el.ariaLabel || "") || containsBait(el.ariaDescribedby || "")) score += 2;
  return score;
}

async function scanPage(browser, url, depth = 0) {
  if (visited.has(url) || depth > MAX_DEPTH) return;
  visited.add(url);
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    const pageResults = await page.evaluate((KEYWORDS) => {
      const isHidden = (el) => {
        const style = window.getComputedStyle(el);
        return (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0" ||
          el.offsetParent === null ||
          el.getClientRects().length === 0
        );
      };

      const elements = Array.from(
        document.querySelectorAll('[aria-live], [role], [aria-describedby], [aria-label], svg[aria-label]')
      );

      return elements.map(el => ({
        tag: el.tagName,
        role: el.getAttribute("role"),
        ariaLive: el.getAttribute("aria-live"),
        ariaLabel: el.getAttribute("aria-label"),
        ariaDescribedby: el.getAttribute("aria-describedby"),
        text: el.textContent.trim().slice(0, 200),
        hidden: isHidden(el)
      }));
    }, KEYWORDS);

    pageResults.forEach(el => {
      el.url = url;
      el.score = scoreElement(el);
      el.bait = containsBait(el.ariaLabel || "") || containsBait(el.ariaDescribedby || "");
    });

    results.push(...pageResults.filter(r => r.score > 0));

    const origin = new URL(url).origin;
    const links = await page.$$eval("a[href]", (anchors) =>
      anchors.map(a => a.href).filter(h => h && typeof h === "string")
    );
    const internalLinks = links.filter(link => link.startsWith(origin));
    await page.close();

    for (const link of internalLinks) {
      await scanPage(browser, link, depth + 1);
    }
  } catch (err) {
    console.error("Error loading page:", url, err.message);
    await page.close();
  }
}

function exportResults() {
  if (!fs.existsSync("output")) fs.mkdirSync("output");

  fs.writeFileSync("output/whispers.json", JSON.stringify(results, null, 2));

  const md = results.map((el, i) => {
    return `### [${i + 1}] ${el.tag} | Risk: ${el.score}/10 | ${el.hidden ? "🔒 Hidden" : "👁️ Visible"}
**URL**: ${el.url}
${el.ariaLabel ? `- ✏️ aria-label: \`${el.ariaLabel}\`` : ""}
${el.ariaDescribedby ? `- ↪️ describedby: \`${el.ariaDescribedby}\`` : ""}
${el.role ? `- 🎭 role: \`${el.role}\`` : ""}
${el.ariaLive ? `- 📢 aria-live: \`${el.ariaLive}\`` : ""}
${el.text ? `- 🗣️ Text: \`${el.text}\`` : ""}
${el.bait ? `- 🚨 Contains keyword bait` : ""}`;
  }).join("\n\n");

  fs.writeFileSync("output/whispers.md", "# Whisper Crawler Report\n\n" + md);
}

(async () => {
  const startUrl = process.argv[2] || "https://example.com";
  const browser = await puppeteer.launch();
  await scanPage(browser, startUrl);
  await browser.close();

  console.log(`\n🔍 Scanned ${visited.size} page(s). Exporting results...`);
  exportResults();
  console.log("✅ Done. Output saved to /output/whispers.json and /output/whispers.md");
})();n
