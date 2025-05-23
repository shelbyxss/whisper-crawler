# 🕵️ Whisper Crawler

> A Puppeteer-based accessibility scanner that detects hidden ARIA traps, misleading roles, and potential whisper exploits across web pages.

---

## 🔍 What It Does

Whisper Crawler scans a given URL and flags suspicious DOM patterns that may be used for:

- 🎭 Misleading screen reader behavior
- 👻 Whisper traps (`aria-live`, `role="alert"`, etc.)
- 🧼 Accessibility-layer phishing
- 🔇 Invisible speech prompts or hidden CTA overlays

---

## 🧠 What It Detects

- Elements with:
  - `aria-label`, `aria-live`, `role`, or `aria-describedby`
  - Hidden status (`display: none`, `clip`, `opacity: 0`, etc.)
- Fake roles on non-semantic tags (`DIV` with `role="textbox"`)
- Long invisible content meant only for screen readers
- Assigns each element a **risk score (0–10)**

---

## 📦 Usage

### 🔧 Install dependencies

```bash
npm install puppeteer


🚀 Run the crawler
bash
Copy
Edit
node index.js https://target-site.com
📊 Output Example
yaml
Copy
Edit
🔍 Whisper Crawler v2: Suspicious ARIA/Role Scan — https://target-site.com
🧿 3 suspicious elements found:

[1] DIV | Risk: 7/10 | Hidden: true
   ✏️ aria-label: Close panel
   🎭 role: button

[2] DIV | Risk: 6/10 | Hidden: true
   ✏️ aria-label: Side Peek
   🎭 role: region

[3] DIV | Risk: 5/10 | Hidden: false
   ✏️ aria-label: Start typing to edit text
   🎭 role: textbox
   🗣️ "Join our DAO... tap here..."
🔮 Coming Soon (v3+)
🔗 Internal link crawling (recursive on same domain)

📝 Export results to Markdown / JSON

🧠 Keyword bait detection (e.g., "verify", "secure", "2FA")

📸 Screenshot capture of flagged elements

☠️ Red flag scoring matrix

⚠️ Ethical Use Notice
This tool is designed for educational and accessibility auditing purposes. Use it responsibly and only on domains you have permission to scan.
