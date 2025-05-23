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
