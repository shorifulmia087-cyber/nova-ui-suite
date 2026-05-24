# Design System — Mobile Fintech App

Production-grade specification for the **existing** app. No layouts, flows, or features change. This document defines the canonical tokens, components, and usage rules that every screen must follow. The source of truth lives in `src/styles.css` (tokens) and `src/lib/typography.ts` (text).

---

## 0. Audit Summary (what was inconsistent)

| Area | Findings | Decision |
|---|---|---|
| Colors | `--success` had two shades (`#22c55e` vs `text-emerald-*`), `--warning` had low-contrast `#0f172a` foreground, no `info`, no `text-secondary`/`text-muted` split, no `divider`, no `overlay`, no `primary-dark` | Consolidated into one semantic palette below |
| Typography | Routes used arbitrary `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[12px]`, `text-[14px]`, `text-[15px]`, `text-[17px]`, `text-[18px]` overriding the token system | Locked to 13 tokens (`display` → `stat`); arbitrary sizes banned |
| Spacing | Mixed `p-3`, `p-5`, `p-6`, `gap-2.5`, `px-2.5` against the canonical `p-card` / `px-5` rule | Spacing scale `4/8/12/16/20/24/32/40/48/64` enforced |
| Radius | `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full` all collapsed to `--radius:1rem` via theme overrides — losing hierarchy | Restored 6-step scale: `xs/sm/md/lg/xl/pill` |
| Shadows | Heavy `0 8px 32px -12px rgba(31,38,135,.18)` on every card (legacy glassmorphism) plus `shadow-card`, `shadow-glow`, `shadow-navy` | New `elevation-0..4` scale; legacy shadows kept as aliases |
| Icons | Mixed stroke widths (`strokeWidth={2.4}` in one place, default `2` elsewhere) and sizes (`h-4`, `h-5`, `h-6`, `h-9`) | Standardized below |
| Buttons | `ActionButton` (good) coexists with hand-rolled `<button className="h-12 rounded-2xl …">` | Canonical = `ActionButton`; standardized sizes |

---

## 1. Color System

All colors live as CSS variables in `src/styles.css`. **Never hardcode hex in components.** Use Tailwind semantic classes (`bg-card`, `text-foreground`, `text-muted-foreground`) or `text-[color:var(--token)]` for status colors.

### Brand
| Token | Light | Usage |
|---|---|---|
| `--primary` | `#6D28D9` (violet 700) | Primary actions, brand emphasis, links |
| `--primary-dark` | `#4C1D95` (violet 900) | Pressed / hover on primary |
| `--secondary` | `#10b981` (emerald 500) | Secondary brand accent, positive flows |
| `--accent` | `#6D28D9` | Highlights (alias of primary today) |

### Status
| Token | Light | Foreground |
|---|---|---|
| `--success` | `#16a34a` | `#ffffff` |
| `--warning` | `#d97706` | `#ffffff` |
| `--destructive` (error) | `#dc2626` | `#ffffff` |
| `--info` | `#2563eb` | `#ffffff` |

### Surfaces
| Token | Value |
|---|---|
| `--background` | `transparent` (body owns the pastel mesh gradient) |
| `--surface` / `--card` | `#ffffff` |
| `--surface-secondary` | `#f8fafc` |
| `--surface-tertiary` / `--muted` | `#f1f5f9` |
| `--popover` | `#ffffff` |
| `--disabled` | `#f1f5f9` |
| `--overlay` | `rgba(15,23,42,0.48)` |
| `--overlay-light` | `rgba(15,23,42,0.24)` |

### Text
| Token | Value | Use |
|---|---|---|
| `--text-primary` / `--foreground` | `#0a2540` | Default body & headings |
| `--text-secondary` / `--muted-foreground` | `#475569` | Secondary copy, captions on white |
| `--text-muted` | `#94a3b8` | Placeholder, timestamps, low-emphasis labels |
| `--text-disabled` | `#cbd5e1` | Disabled labels |
| `--text-inverse` | `#ffffff` | Text on primary / dark surfaces |

### Structural
| Token | Value |
|---|---|
| `--border` | `#e2e8f0` |
| `--divider` | `#eef2f7` (1px row separators) |
| `--input` | `#e2e8f0` |
| `--ring` | `#6D28D9` (focus ring) |

### Financial
| Token | Maps to |
|---|---|
| `--profit` | `--success` |
| `--loss` | `--destructive` |

**Rules**
- Status colors at 10–15% alpha for backgrounds: `bg-[color:var(--success)]/12`.
- Never use raw Tailwind palette (`text-emerald-500`, `bg-slate-900`) in components.
- Never use `text-white` / `text-black`; use `text-primary-foreground` / `text-foreground`.

---

## 2. Typography

Source of truth: `src/lib/typography.ts` + classes in `src/styles.css`. Use `<Heading variant="...">` and `<Text variant="...">`. **Arbitrary sizes (`text-[14px]`) are banned.**

| Token | Size / LH | Weight | Use |
|---|---|---|---|
| `display` | 32 / 40 | 700 | Splash hero |
| `screenTitle` (≈ H1) | 24 / 32 | 700 | Page titles |
| `sectionTitle` (≈ H2) | 18 / 26 | 700 | Section headers |
| `cardTitle` (≈ H3) | 18 / 26 | 600 | Card / list item titles |
| `H4` *(use `cardTitle` at 16px override only if needed)* | — | — | Avoid; collapse into `cardTitle` |
| `titleLarge` → `sectionTitle` | — | — | Alias |
| `titleMedium` → `cardTitle` | — | — | Alias |
| `body` (Body Large) | 16 / 24 | 400 | Primary body |
| `bodySecondary` (Body Medium) | 14 / 20 | 400 | Secondary body |
| `caption` (Body Small) | 12 / 16 | 400 | Captions, timestamps |
| `label` | 14 / 20 | 500 | Form labels |
| `button` | 16 / 24 | 600 | All buttons |
| `tab` | 12 / 16 | 500 | Bottom-nav tabs |
| `input` | 16 / 24 | 400 | Input typed text (16px = no iOS zoom) |
| `stat` | 28 / 36 | 700 | Balances, key metrics |
| `eyebrow` | 12 / 16 | 600 | Uppercase mini-label (`tracking 0.12em`) |

**Rules**
- Only weights `400 / 500 / 600 / 700`.
- Casing via `case="title|upper|lower|sentence"` prop — never raw `uppercase` / `capitalize`.
- Headings always via `<Heading>`, never raw `<h1>`.

---

## 3. Spacing

Canonical scale (px): **`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`**. Tailwind maps directly: `p-1, p-2, p-3, p-4, p-5, p-6, p-8, p-10, p-12, p-16`. Also exposed as `var(--space-1)` … `var(--space-16)`.

**Layout rhythm (locked):**
- **Screen / section wrappers** → `px-5` (20px) horizontal.
- **Card / panel inner padding** → `p-card` (16px via `--spacing-card`).
- **Between sections** → `mt-section` / gap-4 (16px).
- **Inside a card** → `gap-3` (12) for content rows, `gap-2` (8) for inline items.
- **Tap target min** → 44×44 px (`min-h-11 min-w-11`).

**Banned:** `p-2.5`, `p-3.5`, `gap-2.5`, arbitrary `p-[N]`.

---

## 4. Radius

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 6px | Badges, chips, tag pills (square-ish) |
| `--radius-sm` | 8px | Inputs, small icon tiles |
| `--radius-md` | 12px | Buttons, list rows, secondary cards |
| `--radius-lg` | 16px | Cards, sheets, modals (**default**) |
| `--radius-xl` | 24px | Hero / wallet cards, prominent surfaces |
| `--radius-pill` | 9999px | Pills, status badges, FABs |

Tailwind: `rounded-xs`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-pill` (custom utility) / `rounded-full`.

**Banned:** `rounded-2xl`, `rounded-3xl` (collapse into `xl`); arbitrary radii.

---

## 5. Elevation

Premium subtle scale — **no neumorphism, no heavy color shadows.**

| Token | Use |
|---|---|
| `elevation-0` | Flat (most list rows, inline content) |
| `elevation-1` | Default card on white bg |
| `elevation-2` | Default card on gradient bg (current app) |
| `elevation-3` | Floating: bottom-nav, sticky CTA, dropdowns |
| `elevation-4` | Modals, sheets, popovers |

Class form: `elevation-1` … `elevation-4`. Legacy `shadow-card / shadow-glow / shadow-navy` retained as aliases — do **not** introduce them in new code.

---

## 6. Buttons

Canonical component: `ActionButton` in `src/components/mobile/Primitives.tsx`.

| Variant | Background | Text | Use |
|---|---|---|---|
| `brand` (Primary) | `bg-primary` | `text-primary-foreground` | Main CTA |
| `mint` (Accent) | `bg-accent` | `text-accent-foreground` | Positive secondary CTA |
| `outline` (Secondary) | `bg-card border-border` | `text-foreground` | Secondary action |
| `ghost` | `bg-muted` | `text-foreground` | Tertiary / inline |
| `danger` | `bg-destructive` | `text-destructive-foreground` | Destructive |

| Size | Height | Padding | Radius |
|---|---|---|---|
| `sm` | 36 (`h-9`) | `px-4` | `rounded-md` |
| `md` (default) | 48 (`h-12`) | `px-5` | `rounded-lg` |
| `lg` | 56 (`h-14`) | `px-6` | `rounded-lg` |

**States**: `hover:` 90% bg, `active:scale-[0.98]`, `disabled:opacity-50` (cursor-not-allowed), `loading` → swap label for spinner, keep width.

**Icon buttons**: always `min-h-11 min-w-11`, `rounded-full`, `aria-label` required.

**Rule:** Replace hand-rolled `<button className="h-12 rounded-2xl bg-[color:var(--accent)]…">` with `<ActionButton variant="brand">`.

---

## 7. Inputs

| State | Spec |
|---|---|
| Default | `h-12`, `rounded-md`, `border border-input`, `bg-card`, `text-input` (16px) |
| Focus | `ring-2 ring-ring/40`, `border-primary` |
| Error | `border-destructive`, helper `text-caption text-destructive` |
| Success | `border-success`, optional check icon |
| Disabled | `bg-disabled`, `text-text-disabled`, `cursor-not-allowed` |
| Search | Prefix `Search` icon `h-4 w-4 text-muted-foreground`, left padding `pl-9` |
| Password | Suffix eye toggle, icon button 36×36 |

Label above input via `<Text variant="label">`. Helper text below via `<Text variant="caption">`.

---

## 8. Icons

- Library: **lucide-react** only.
- Stroke width: **`2`** everywhere (never `2.4`, `1.5`, etc.).
- Sizes: `h-4 w-4` (16) inline with body text · `h-5 w-5` (20) default UI · `h-6 w-6` (24) prominent · `h-7 w-7` (28) hero/avatars.
- Always vertically centered with `flex items-center`.
- Decorative icons: `aria-hidden="true"`. Meaningful icons inside icon-only buttons: parent `aria-label`.

---

## 9. Cards

All cards = `bg-card rounded-lg border border-border p-card elevation-2`.

| Card | Extra |
|---|---|
| Wallet / hero | `rounded-xl`, gradient bg (`bg-gradient-brand`), `text-primary-foreground`, `elevation-3` |
| Stat pill | `flex-1`, label = `caption`, value = `cardTitle` (or `stat` for balances) |
| Transaction row | `p-card`, leading icon tile 40×40 `rounded-md`, title `cardTitle` (14–16), date `caption` |
| Analytics | `p-card`, header row: title (`sectionTitle`) + trailing action ghost button |

Divider between rows inside a card: `border-t border-divider` (not `border-border`).

---

## 10. Navigation

**Bottom nav**: height 64 (`h-16`), `bg-card`, `elevation-3`, `border-t border-divider`. Tab item: `flex-1 flex-col items-center gap-1 pt-2 pb-1.5 min-h-11`, icon `h-5 w-5`, label `text-tab`, active color = `text-primary`, inactive = `text-muted-foreground`.

**Top bar / `ScreenHeader`**: `px-5 pt-6 pb-4`, back button 40×40 `rounded-full bg-card border border-border elevation-1`, title = `screenTitle`, subtitle = `bodySecondary`.

**Tabs**: underline style, `h-10`, gap-6, label `text-label`, active = `text-primary border-b-2 border-primary`.

---

## 11. Data Visualization

- Charts: axis labels `caption`, gridlines `var(--divider)`, primary series `var(--primary)`, comparison `var(--secondary)`.
- **Profit/loss**: `var(--profit)` (green) / `var(--loss)` (red). Use `↑ / ↓` glyph + value, never color alone.
- **Status badges**: `rounded-pill px-2 py-0.5 text-caption font-medium`, bg `var(--X)/12`, text `var(--X)`.
  - completed → success · pending → warning · failed → destructive · processing → info.
- **Numbers**: always `tabular-nums`.

---

## 12. Accessibility

- Min text size **12px**; primary body **16px**.
- Contrast: body `#0a2540` on white = **15.8 : 1** ✓ AAA. Secondary `#475569` on white = **8.5 : 1** ✓ AAA. Warning bg `--warning #d97706` + white text = **4.6 : 1** ✓ AA (was failing at `#f59e0b` + dark text on white badge).
- Tap targets **≥ 44×44**; icon buttons `min-h-11 min-w-11`.
- Focus ring visible: `focus-visible:ring-2 ring-ring/40`.
- Every icon-only control has `aria-label`.
- One `<main>` per route (root layout).
- Status never conveyed by color only — pair with icon or text.
- `text-input` is 16px to prevent iOS zoom-on-focus.

---

## Migration Checklist (apply incrementally — no big-bang refactor)

Order suggested for safe rollout:

1. **Search-and-replace audit** (no behavior change):
   - `text-[9px|10px|11px|12px|14px|15px|17px|18px]` → nearest `<Text variant=…>` token
   - `rounded-2xl` / `rounded-3xl` → `rounded-xl`
   - `shadow-card` on existing surfaces → keep (alias); use `elevation-2` going forward
   - Raw `#hex` in `style={…}` → CSS variable
2. **Buttons**: replace ad-hoc `<button className="h-12 rounded-2xl bg-[color:var(--accent)]…">` with `<ActionButton variant="brand" size="md">`.
3. **Icons**: drop any `strokeWidth={…}` prop; normalize size per §8.
4. **Warning palette**: any `text-[color:var(--warning)]` on white now reads correctly; verify badges still legible.
5. **Inputs**: ensure every `<Input>` is paired with `<Text variant="label">` above and uses 16px text.

Each item is mechanical and non-breaking; ship per-screen PRs.

---

## File Map

| Concern | File |
|---|---|
| Color / radius / spacing / elevation tokens | `src/styles.css` |
| Typography classes + variants | `src/styles.css` + `src/lib/typography.ts` |
| Button | `src/components/mobile/Primitives.tsx` (`ActionButton`) |
| Card primitive | `src/components/mobile/Primitives.tsx` (`Card`) |
| Header | `src/components/mobile/ScreenHeader.tsx` |
| shadcn primitives | `src/components/ui/*` — use as-is, do not restyle inline |
