# Prompt for Claude — Ament Home & Tech Services Site Pivot

> Paste this into Claude Code in the project root (it already has repo context: `package.json` shows Next.js 14, React 18, `@anthropic-ai/sdk`, `resend`, `@headlessui/react`). If you're pasting into a fresh Claude.ai chat instead, attach `ament_service_app.html`, `package.json`, and `logo.png` first.

---

## Context

Ament Home & Tech Services (amenttech.com) is repositioning. The current site (`ament_service_app.html`) is a 3-tier "Connect / Secure / Command" service picker with fixed price ranges, a 3-step flow (select services → contact form → confirmation), and no live backend — the Claude SDK and Resend packages are installed but not yet wired into this page.

The new direction:

- **CCTV/security installation is the flagship service** — it should lead the page, not sit as "Tier 2."
- **AI home/business automation** is a new offering to add alongside the existing catalog (Wi-Fi, TV mounting, smart locks, whole-home automation, STR/Airbnb tech packages, etc. — keep all of it).
- **Fixed line-item pricing is going away.** Replace it with a short questionnaire that captures the specifics of the install (property type, number of cameras/rooms, existing equipment, etc.) instead of making the customer guess their own price.
- **The booking flow is too long.** Cut it down — fewer screens, less scrolling, faster to "submit."
- **Claude integration stays and gets a real job to do:** when a customer submits the questionnaire, call the Claude API server-side to turn their answers into a scoped, recommended price range, then email the business owner (via Resend) a full breakdown — what the customer wants, complexity flags, and the recommended quote — so they can follow up informed instead of cold.

## What to build

### 1. Flagship reorder + full catalog

- Lead with **CCTV/Security** as the hero service. AI Automation should be the second most prominent. The rest of the existing catalog (Connect-tier convenience services, Command-tier smart home work, etc.) stays, just demoted below the two leads — don't cut services, just re-prioritize the visual hierarchy.
- Drop the "Tier 1/2/3" framing if it no longer reflects the business — group by **service category** instead (Security & Surveillance, Smart Automation & AI, Connectivity & Setup, etc.), with Security and Automation first.

### 2. Replace fixed pricing with a questionnaire

- Remove the per-line-item price tags (`$120–175` style) from the service cards. Keep **rough "starting at" ranges per category** for orientation (e.g., "CCTV systems typically start around $X") so customers aren't flying blind, but the real number comes from the questionnaire, not a price list.
- When a customer selects a service category, show a short dynamic questionnaire specific to that category instead of a static checkbox list. Examples:
  - **CCTV/Security:** property type (house/business/rental), number of cameras desired, indoor/outdoor mix, existing NVR/DVR or starting fresh, monitoring preference (local storage vs. cloud), approximate square footage or number of entry points.
  - **AI Automation:** what they want automated (lighting, climate, security, voice assistant integration, business workflow), existing smart devices, number of rooms/zones, DIY vs. full white-glove install.
  - Keep each questionnaire to **5–7 questions max**, mostly multiple choice/select, one or two short free-text fields for "anything else we should know."

### 3. Shorten the flow

- Collapse the current 3-step flow (services → form → confirmation) into **2 steps**: (1) pick a service category and answer its questionnaire, (2) contact info + submit. Confirmation can be a simple inline success state, not a separate full screen.
- Eliminate the separate scrolling "cart panel" pattern unless the customer is bundling multiple categories — if they are, keep it lightweight (a collapsed summary, not a running list they have to scroll past).

### 4. Claude integration — make it functional

- Add a server-side API route (e.g. `app/api/quote/route.ts`) that:
  1. Receives the questionnaire answers + contact info from the form.
  2. Calls the Claude API (`@anthropic-ai/sdk`, model `claude-sonnet-4-6` or current default) with a system prompt instructing it to act as an estimator for Ament Home & Tech Services, using the existing service categories and rough pricing logic as guardrails, and return a structured JSON estimate: scope summary, complexity notes, recommended price range, and any follow-up questions the business should ask before quoting firm.
  3. Sends that breakdown via Resend to the business's notification email, formatted clearly (customer info, full questionnaire answers, Claude's scope summary, recommended range, complexity flags).
  4. Optionally sends the customer a friendly "we got your request, here's what's next" confirmation email (no price disclosed to the customer at this stage — let the business follow up).
- Use environment variables for `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, and a `BUSINESS_NOTIFY_EMAIL` — don't hardcode keys. Flag in your output if any of these are missing from `.env.local` so I can add them.
- Handle the obvious failure cases gracefully: Claude API failure shouldn't block the customer's submission from reaching the business (fall back to sending the raw questionnaire answers without the AI summary if the Claude call fails).

### 5. Keep the brand intact

- Preserve the existing visual identity: navy (`#1e2d47`), gold (`#b89b6e`), cream (`#f7f3ed`) palette, Playfair Display + Lato fonts, and the logo. Don't redesign the brand — redesign the flow and content.
- **Do not change the company name, domain, or logo.** "Ament Home & Tech Services" stays exactly as-is — it's broad enough to cover CCTV and AI automation without sounding off. Instead, make the specialization obvious through copy: rewrite the hero headline/subheadline and the page `<title>`/meta description so a first-time visitor immediately understands "CCTV installation and AI home/business automation" without having to scroll, even though the company name itself stays generic. The tagline ("Smarter Living, Made Simple") can stay.

### 6. Fix the scroll-driven frame/video hero

There's a scroll-scrubbed frame sequence (likely a canvas-based animation reading from a `/frames/` directory — referenced in the `Cache-Control` headers in `next.config.js`) that currently takes too long to scroll through, either because there are too many frames, too much pinned scroll distance, or both. Locate that component first and inspect its current frame count and scroll-trigger height before changing anything. Then:

- **Cut the frame count.** If it's sampling at a high rate (e.g. one frame every few pixels of scroll), reduce the total frame count substantially — most scroll-scrub effects read fine at well under half the frames people initially export, especially with a 2-3 frame interpolation/easing pass to smooth the perceived motion. Don't just delete frames evenly; keep more density where the motion is visually important and thin out static/slow segments.
- **Shorten the pinned scroll distance.** The container that locks scroll while the animation plays should resolve in a clearly bounded distance — aim for roughly 1.5–2.5 viewport heights total, not several screens' worth of scrolling. If it's currently locking scroll for longer than that, shrink it.
- **Respect `prefers-reduced-motion`.** Skip straight to the final frame for users with that preference set, both for accessibility and so the page doesn't feel sluggish to anyone who just wants to get past the hero.
- **Confirm preload/caching is still correct** after the frame count changes — the aggressive `Cache-Control: immutable` headers on `/frames/*` are good, just make sure the preload list in the component matches whatever the new, smaller frame set actually is.
- Tell me the original vs. new frame count and scroll distance so I know what changed.

## Deliverables

- Updated page component(s) reflecting the new hierarchy, questionnaire-driven flow, and shortened steps.
- The `/api/quote` route with the Claude + Resend integration described above.
- The shortened scroll-frame hero, with the before/after frame count and scroll distance noted.
- A short note on any new environment variables I need to set, and where to set them.

## Before you start

If anything here is ambiguous — what counts as "the business email," how granular the questionnaire should get per category, or whether this should be one page or multiple routes — ask me before assuming. Otherwise, proceed.
