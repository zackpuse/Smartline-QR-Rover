# Audit Report – Smartline QR Rover Web App (GitHub Pages)

---

## 1️⃣ Overview
The project consists of a single‑page web‑app that simulates an ADAS‑type rover with:
- **Canvas visualiser** for a moving rover on an oval track.
- **AI Vision QR controls**, **Ultrasonic AEB obstacle slider**, **Motor speed slider**.
- **AEB logic** that now includes reaction‑time delay (≈300 ms) and braking inertia.
- **Dashboard charts** (Chart.js) that summarise diagnostic scores.
- **GitHub Pages** deployment (index.html + app.js) with versioned cache‑busting.

The current codebase (≈450 JS lines, 633 HTML lines) works, but there are several areas that can be hardened, cleaned up, or improved for maintainability, performance, and accessibility.

---

## 2️⃣ Code Quality & Maintainability
| Area | Findings | Recommendation |
|------|----------|----------------|
| **Variable naming** | `simState.maxSpeed` is multiplied by 10 to obtain `speedCmS`. This conversion is hidden in multiple places. | Rename to `maxSpeedCmS` (store speed directly in cm/s) or add a small helper `getSpeedCmS()` to avoid magic *10* factor. |
| **Magic numbers** | Hard‑coded values: `0.015 / 2.2`, `0.1` acceleration step, `0.15` deceleration step, `300` ms reaction time, chart dataset numbers. | Extract them into a `config` object at the top of `app.js` (e.g., `const CONFIG = { SPEED_FACTOR: 2.2, ACCEL_STEP: 0.1, BRAKE_STEP: 0.15, REACTION_MS: 300, ... }`). |
| **Repeated DOM look‑ups** | `document.getElementById('aeb-alert')`, `document.querySelector('#aeb-alert span')` are called each frame inside `updateState()`. | Cache these elements once during initialisation (e.g., `const aebAlert = document.getElementById('aeb-alert');`). |
| **Commented dead code** | No obvious dead code, but there are leftover comments from earlier implementations (e.g., old TTC‑<20 cm logic). | Clean up old comments or keep them in a separate `CHANGELOG.md` for reference. |
| **Error handling** | Functions like `updateObstacle()` assume the element exists. If the DOM changes, a missing element will silently fail. | Add a simple guard (`if (!el) return;`). |
| **Global state** | All simulation state lives in a single `simState` object, which is fine for this scale but tightly couples UI and physics. | Consider separating *model* (`simState`) from *view* (render functions) – useful if you later add a unit‑test harness. |
| **Linter compliance** | The code runs but some lines exceed 80 characters and there are missing `;` in a few places. | Run ESLint with `eslint --fix` to enforce consistency. |

---

## 3️⃣ UI / UX & Accessibility
| Issue | Detail | Fix |
|-------|--------|-----|
| **Contrast** | Text on the dark HUD uses `#94A3B8` (light gray) on a semi‑transparent dark overlay – borderline WCAG AA. | Increase contrast (e.g., `#E5E7EB`). |
| **Keyboard accessibility** | Sliders (`input type="range"`) are mouse‑only by default. Users can focus them with Tab, but there is no ARIA label. | Add `aria-label="Speed control"` and `aria-label="Obstacle distance"`. |
| **Responsive layout** | The sidebar width is fixed; on very narrow screens the canvas overflows. | Wrap the sidebar and canvas in a flex container with `flex-wrap: wrap` and set a max‑width for the sidebar (`max-width: 320px`). |
| **Chart colours** | The chart uses a muted palette that blends with the background. | Use the same teal / cyan accent from the UI (`rgba(6,182,212,0.8)`) for better visual harmony. |
| **Loading states** | When the page first loads, the canvas may be empty for a split‑second. | Show a subtle spinner (`<div class="loader" …>`) until the first `drawScene()` call. |
| **Cache‑busting** | `app.js?v=6` works, but the HTML still contains static references to `style.css`. | Add `?v=6` to CSS as well, or use a build step that injects hash‑based filenames. |

---

## 4️⃣ Performance
| Observation | Impact | Recommendation |
|-------------|--------|----------------|
| **Chart.js re‑creation** | The chart is instantiated inside `initAnalyticsChart()` only once – good. | Ensure you’re not recreating it on every resize (check event listeners). |
| **Canvas redraw** | `drawScene()` clears and redraws the entire canvas each frame (~60 fps). This is fine for a simple oval track, but the canvas size is 700 × 380 – modest. | No urgent change needed. |
| **Throttle UI updates** | UI badge updates (`document.getElementById(...).innerText`) happen every frame. | Throttle to 10 fps using `requestAnimationFrame` timestamp check, reducing DOM writes. |
| **Asset size** | The page loads ~200 KB (HTML + JS + Chart.js). | Minify JS (`terser`) and enable gzip on GitHub Pages (already automatic). |

---

## 5️⃣ Security & Privacy
| Aspect | Status | Recommendation |
|--------|--------|----------------|
| **Inline script** | All logic lives in `app.js`; no inline `eval`. | Good. |
| **External resources** | Uses Font Awesome CDN and Google Fonts – both served over HTTPS. | Good. |
| **User data** | No personal data is collected. | No actions required. |
| **GitHub token exposure** | The temporary token used for API calls was never written to any file, only executed in‑memory. | Ensure you never commit such tokens to the repo. |

---

## 6️⃣ GitHub Pages Configuration
- The repository is now **Public** and the *Pages* source is set to **main / (root)**.
- A manual API call was required because the UI UI‑toggle left the deployment flag in a stale state after the repo visibility change.
- **Future changes**: after each push, GitHub Pages will automatically rebuild. No further API calls are needed.

---

## 7️⃣ Recommendations & Next Steps
1. **Refactor magic numbers** into a `CONFIG` object (speed factor, reaction time, acceleration/braking steps). This makes tuning the ADAS model easier for demos.
2. **Add ARIA labels** and improve colour contrast for WCAG compliance.
3. **Cache‑bust CSS** as well (`style.css?v=6`).
4. **Throttle UI badge updates** to improve rendering performance on slower devices.
5. **Create a small unit‑test harness** (e.g., using Jest) for the `updateState()` physics – useful for educational settings.
6. **Document the AEB physics** in a `README.md` with the equations (TTC = d / v, reaction‑time delay, deceleration step). This helps trainees understand the underlying model.
7. **Optional**: Add a **dark‑mode toggle** (CSS variable switch) to showcase UI flexibility.

---

### 🎉 Bottom line
The app is functional and now includes realistic reaction‑time & inertia behaviour. By cleaning up the code, improving accessibility, and extracting configuration constants, you’ll make the simulator more maintainable, extensible, and pedagogically robust for the TVET competition.

Feel free to let me know which of the above items you’d like to implement next, or if you need a specific code change (e.g., adding ARIA attributes or throttling UI updates).
