const puppeteer = require("puppeteer");

(async () => {
  const url = process.argv[2] || "https://example.com";

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const results = await page.evaluate(() => {
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

    const misleadingRoles = ["textbox", "button", "region"];
    const elements = Array.from(
      document.querySelectorAll('[aria-live], [role], [aria-describedby], [aria-label], svg[aria-label]')
    );

    const scored = elements.map((el) => {
      const hidden = isHidden(el);
      const tag = el.tagName;
      const role = el.getAttribute("role");
      const ariaLabel = el.getAttribute("aria-label");
      const ariaLive = el.getAttribute("aria-live");
      const ariaDescribedby = el.getAttribute("aria-describedby");
      const text = el.textContent.trim();

      // Risk scoring logic
      let score = 0;
      if (hidden && role) score += 3;
      if (hidden && ariaLabel) score += 2;
      if (tag === "DIV" && misleadingRoles.includes(role)) score += 2;
      if (hidden && text.length > 100) score += 2;

      return {
        tag,
        role,
        ariaLive,
        ariaLabel,
        ariaDescribedby,
        text: text.slice(0, 200), // cap for display
        hidden,
        score,
      };
    });

    return scored.filter(el => el.score > 0); // only return suspicious
  });

  console.log(`\n🔍 Whisper Crawler v2: Suspicious ARIA/Role Scan — ${url}`);
  console.log(`🧿 ${results.length} suspicious elements found:\n`);

  results.forEach((el, i) => {
    console.log(`[${i + 1}] ${el.tag} | Risk: ${el.score}/10 | Hidden: ${el.hidden}`);
    if (el.ariaLabel) console.log(`   ✏️ aria-label: ${el.ariaLabel}`);
    if (el.ariaDescribedby) console.log(`   ↪️ describedby: ${el.ariaDescribedby}`);
    if (el.role) console.log(`   🎭 role: ${el.role}`);
    if (el.ariaLive) console.log(`   📢 aria-live: ${el.ariaLive}`);
    if (el.text) console.log(`   🗣️ "${el.text}"`);
    console.log();
  });

  await browser.close();
})();
