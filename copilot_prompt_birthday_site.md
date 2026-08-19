# Prompt for GitHub Copilot — Upgrade "Happy Birthday Vijaya" Website

Paste everything below into Copilot Chat (or as a comment above the file) while `happy_birthday_vijaya.html` is open.

---

## Context

I have a single-file HTML birthday website (`happy_birthday_vijaya.html`) with this existing structure — **do not remove or break any of it**, only enhance:

1. **Lock screen** — passcode entry with shake-on-wrong-answer
2. **Loading screen** — progress bar transition
3. **Hero section** — title, name, live countdown to next birthday
4. **Gallery** — polaroid photo stack that cycles on click/auto-interval
5. **Letter** — typewriter-effect personal message
6. **Finale** — click-to-blow-out candles on a cake emoji, then canvas confetti burst
7. A floating-hearts background field, a music toggle button using Web Audio oscillator beeps, and reduced-motion support already in place

Color palette in use (keep and build on this, don't replace it):
`--plum:#3a0d3f; --plum-deep:#24072b; --pink:#ff6fa5; --pink-soft:#ffc1dc; --lilac:#c9a4ff; --gold:#f7d78c; --cream:#fff6f9;`
Fonts: `Great Vibes` (script) + `Poppins` (body).

## Overall Direction

Keep the **dreamy/romantic** plum-pink-gold atmosphere, but layer in more **playful, colorful energy** — bounce, sparkle, confetti-style delight — so it feels magical *and* fun, not just elegant. Think: a storybook that's also a little bit of a celebration.

## What to Build

### 1. Scroll-triggered reveals (apply site-wide)
- Replace the current mostly-auto-playing flow (past the lock/loading gate) with **scroll-triggered animations** using `IntersectionObserver`.
- Each section (hero, gallery, letter, finale) should animate its elements in as the user scrolls to it: fade + rise, staggered word/line reveals for headings, scale-in for cards, etc.
- Respect `prefers-reduced-motion` — reveals should become simple fades or instant-appear when that's set.
- Animations should only trigger once per element (don't re-trigger every scroll pass) unless it's a decorative ambient effect.

### 2. Section-by-section animation upgrades (all sections get equal attention)
- **Hero:** more dynamic entrance — staggered letter/word reveal on the title, subtle floating/glow on the name, countdown numbers that flip or pulse on each tick change instead of just swapping text.
- **Gallery:** upgrade the polaroid cycling into something with more depth — e.g. a soft 3D tilt/parallax on hover or drag, smoother stacked transitions, maybe a subtle shadow/glow pulse on the active photo.
- **Letter:** keep the typewriter effect but trigger it on scroll-into-view rather than a fixed timeout, and add a nice reveal for the card itself (e.g. unfolding/rising in) before typing starts.
- **Finale:** make the candle-blow moment and confetti feel bigger — add a few celebratory extras like sparkle bursts, a gentle screen glow pulse, or fireworks-style particles alongside the existing confetti when all candles are out.

### 3. Ambient particle effects throughout
- Add lightweight particle effects beyond the existing floating hearts — sparkles, small gold stars, or drifting petals — layered subtly in the background across sections, not just the hero. Keep it performant (canvas or a small number of absolutely-positioned DOM elements, not hundreds of nodes).

### 4. Real background music
- Replace the Web Audio oscillator beep system with support for an actual **audio file** (e.g. `<audio id="bg-music" src="music.mp3" loop>`), controlled by the existing music toggle button (same icon/UI, just swap the logic to `play()`/`pause()` on a real `<audio>` element). Assume I'll supply my own mp3 file at a relative path — just wire it up cleanly with sensible fallback if the file is missing (no console errors breaking the page).

### 5. Improve the letter's content
- Rewrite/expand the birthday letter text (`letterText` variable) to feel warmer, more specific, and more heartfelt — not generic greeting-card language. Structure it with a natural arc: opening warmth → a specific memory or quality you appreciate about her → a wish for the year ahead → a heartfelt closing line. Keep it personal in tone but leave clear placeholder brackets like `[specific memory]` where I should swap in my own real details. Keep paragraph breaks so the typewriter effect still reads well with pacing.

### 6. Bonus (optional, only if it doesn't compromise performance/simplicity)
- A small interactive element such as a scroll-based memory timeline (a few key dates/moments as timeline nodes that animate in) could be a nice addition between the gallery and letter sections — add this only if it fits naturally without overcomplicating the single-file structure.

## Technical Constraints
- Keep everything in a **single HTML file** (inline CSS/JS), matching the current structure/style.
- No external JS frameworks — vanilla JS only, consistent with the existing code.
- Keep it mobile-responsive; test that animations degrade gracefully on smaller screens.
- Preserve all existing functionality: lock screen passcode logic, loading transition, countdown accuracy, cake candle logic, confetti canvas.
- Keep performance smooth — avoid heavy animation libraries; use CSS transitions/keyframes and lightweight requestAnimationFrame/IntersectionObserver patterns already used in the file.
- Add code comments marking each new enhancement so I can find and tweak things later.

## Deliverable
Modify `happy_birthday_vijaya.html` in place, applying all the above while keeping the existing passcode, photos, and personalization data untouched unless I've asked you to change them (letter text placeholders excepted).
