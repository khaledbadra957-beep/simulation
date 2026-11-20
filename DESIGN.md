# Science Simulations · Design plan

One set of rules for every page, so 26 labs look like one site.
Based on the 20 Nov 2026 review (PhET's interview research, PhET, Brilliant, CK-12, oPhysics, Physics Classroom, Gizmos).

**The rule behind all the others: the scene can be anything; everything around it is the same on every lab.**

---

## 1 · The lab screen ("stage")

```
┌──────────────────────────────────────────────────────────────┐
│ ←  Pulse at a Boundary   Physics · G11        ⛶ Full  ◐ Dark │  top bar, 56 px
├───────────────────────────────────────────┬──────────────────┤
│                                           │ Group 1          │
│                SCENE                      │  · · ·           │
│    (fills the space, any style)           │ Group 2          │  control panel
│                                           │  · · ·           │  300–340 px
│                                           │ Group 3          │  (scrolls only if
│ ▶ Pause   ↺ Again   ───●──────  1.62 s    │  · · ·           │   it must)
├───────────────────────────────────────────┴──────────────────┤
│ ⌂  [▢ Intro] [▢ Lab] [▢ Predict]                 ⟲ Reset  ? Guide │  bottom bar, 64 px
└──────────────────────────────────────────────────────────────┘
```

- **One screen, no page scroll** on a laptop (1440×900) or a smartboard (1920×1080).
- **Scene on the left**, as big as possible. It owns its look (carbon well, glassware bench, space…).
- **Play / pause / step along the bottom of the scene**, always in that order, always there.
- **Control panel on the right**, a different background from the scene (PhET: students must tell them apart).
- **Bottom bar = the only navigation.** One level of screens, each with a real thumbnail. No second row of tabs.
- **Reset is the same round orange button, bottom right, on every lab.**
- **Phones (< 860 px wide):** top bar (one line), scene, play controls, then the panel; the page scrolls.

Opt in with `<html class="stage-ui">` and the markup in §6. Labs not yet converted keep working as before.

## 2 · Screens

| Screen | What it has |
|---|---|
| **Intro** | The main idea. At most **one group** of controls. Nothing marked `data-adv`. |
| **Lab** (one or more) | Everything, in **about 3 groups of about 3 controls**. Extras go in a closed "More" section. |
| **Challenge / Predict** | Questions, the sketch, the game. |

Each screen **adds** to the one before (PhET video: each screen introduces new representations).
Screens are listed in `window.LAB.screens`; thumbnails live in `thumbs/<lab>-<screen>.jpg` (made by `tools/thumbs.py`).

## 3 · Words

- Labels are **1–3 words**, sentence case. Students read 1–3 words at a time (PhET).
- **No paragraphs on the lab screen.** Explanations, questions and lesson notes go in the Guide.
- No UPPERCASE typewriter labels. Monospace is **only for numbers and readings**.
- Results say what happened in a few words ("Reflected · upright"), the maths stays behind "Show the maths".

## 4 · Colour (about 20 tokens, in `site.css`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F4F5F1` | `#0E161A` | page behind everything |
| `--surface` | `#FFFFFF` | `#152229` | panels, cards, bars |
| `--sunk` | `#EEF1EC` | `#0F1A1F` | inputs, segmented controls, wells |
| `--stage` | `#FFFFFF` | `#0F1B20` | default scene background |
| `--ink` | `#13232B` | `#E6EEF0` | text |
| `--muted` | `#55666E` | `#9AB0B8` | secondary text |
| `--line` | `#D9DED7` | `#263840` | borders, dividers |
| `--accent` | `#0A6A88` | `#56C3DF` | anything you press; selected state |
| `--on-accent` | `#FFFFFF` | `#06222B` | text on accent |
| `--reset` | `#E2632B` | `#F0844F` | Reset only |
| `--focus` | `#E2632B` | `#F59E5B` | keyboard focus ring |
| `--ok` / `--bad` | `#1E8A55` / `#C0392B` | `#4ACB8A` / `#FF8A7A` | right / wrong |
| `--c-teal` `--c-terra` `--c-green` `--c-ochre` `--c-violet` `--c-rose` | | | data and roles |

**Role colours mean the same thing on every lab** (colour is read before labels):
teal = the main object / spring 2 / transmitted · terra = reflected / force / heat out · green = incident / spring 1 / products ·
ochre = the thing you change (the knob, the ratio) · violet = chemistry particles · rose = the bead or point you are watching.

No grid paper on lab pages; a grid appears only inside a scene where it measures something.

## 5 · Type, spacing, shape

- **Bricolage Grotesque 800**: lab title (20 px in the top bar), homepage titles. Nothing else.
- **Atkinson Hyperlegible**: everything you read. Body 15–16 px, labels 14–15 px bold, never under 13 px.
- **IBM Plex Mono 600**: numbers, readings, units.
- Spacing steps: 4 · 8 · 12 · 16 · 24 · 32.
- Radius: 8 px for controls, 12 px for panels and scenes, round only for the Reset button and small tags.
- Touch targets ≥ 44 px on touch screens.

## 6 · Components (markup)

```html
<html class="stage-ui">
<header class="topbar">
  <a class="tb-back" href="index.html" aria-label="All simulations">…</a>
  <h1>Lab name</h1><span class="tb-tag">Physics · G11</span>
  <span class="tb-space"></span>
  <button class="tb-btn" data-tool="fs">Full screen</button>
  <button class="tb-btn" data-tool="theme">Dark</button>
</header>
<main class="screens">
  <section class="screen" data-screens="intro lab">
    <div class="play">
      <div class="scene"><canvas></canvas></div>
      <div class="transport">…play / pause / step…</div>
    </div>
    <aside class="panel">
      <section class="group"><h2>Group name</h2> … </section>
      <section class="group" data-adv>…only in Lab…</section>
    </aside>
  </section>
  <section class="screen solo" data-screens="predict">…</section>
</main>
<script>window.LAB = { screens: [ {id:'intro',name:'Intro'}, {id:'lab',name:'Lab'}, {id:'predict',name:'Predict'} ], reset: function(){…} };</script>
<script src="lab-guide.js"></script>
```

- **Buttons:** `.btn` (outline), `.btn.primary` (filled accent), `.btn-reset` (round orange, bar only).
- **Choice of one:** segmented control `.seg` (radio behaviour). **On/off:** checkbox, at most 3–4 per group (students turn them on, rarely off).
- **Number to change:** slider + a value pill in mono; the object in the scene is draggable whenever possible (students touch the object first).
- **Group:** `.group` with an `h2` of 1–2 words. Advanced groups get `data-adv` (hidden on Intro).

## 7 · Homepage

- One filter row: search · Grade (All, 7, 10, 11, 12) · Physics / Chemistry.
- A grade picked → labs in **textbook order** (Module, Lesson). All grades → about six topic groups.
- **One card per experiment**: real screenshot, title, grade tag. A camera version is a small "Also with camera" link on the same card.
- No SIM numbers, no cut-off descriptions.

## 8 · Before publishing any change

Test at 1440×900, 1920×1080 and 390×844, in light and dark. Check: no page scroll on the first two; nothing overlaps; every control reachable; text ≥ 13 px.
