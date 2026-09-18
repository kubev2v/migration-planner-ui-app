# Plan: PNG chart export — library selection

**Status:** Spike implemented (`PngExportService` + per-card PNG + Export → PNG ZIP)  
**Scope:** Assessment report dashboard — download each chart card as PNG, plus download all charts as a ZIP

## Goal

Consultants need to take charts from an assessment report and drop them into customer-facing documents. The UI should offer two download paths:

1. **Per chart** — a download icon on each chart card (see attached design).
2. **All charts** — Export menu option: PNG → ZIP of every chart on the current report.

Both paths snapshot the **rendered DOM of the chart card** (title, legend, chart, and surrounding card chrome), not a rebuilt canvas drawing of the data.

## Context in this codebase

Report charts live in PatternFly 6 `Card`s (`src/ui/report/views/assessment-report/`). They wrap:

- **Victory / PatternFly Charts** (`@patternfly/react-charts`, `victory`) — SVG
- **Shared chart components** (for example `MigrationDonutChart`, `OSDistribution`)
- **PatternFly design tokens** as CSS custom properties, for example `var(--pf-t--global--text--color--subtle)`

PDF export already exists (`PdfExportService` + `html2canvas-pro`). That path captures a large off-screen report and slices it into PDF pages. It is the wrong tool for crisp per-card PNG files (see comparison below).

The current Export dropdown offers **PDF** and **HTML**. The PNG design adds a third option (or replaces HTML in that menu — product decision, out of scope for this document). ZIP packaging will need a new dependency (for example `jszip`); that is separate from the snapshot library.

## What the snapshot library must get right

| Requirement                            | Why it matters here                                                        |
| -------------------------------------- | -------------------------------------------------------------------------- |
| SVG chart fidelity                     | Donuts, bars, legends, and centre labels are SVG, not bitmap               |
| CSS custom properties                  | PatternFly 6 tokens colour text, fills, and axes                           |
| Capture a `Card`, not only the `<svg>` | Consultants want the titled card as it appears on screen                   |
| Exclude chrome from the image          | Per-card download icon (and view-mode dropdown) must not appear in the PNG |
| Retina output                          | `scale: 2` (or equivalent) for slide decks and print                       |
| Theme background                       | Light and dark mode; use the card’s computed `backgroundColor`             |
| Batch capture                          | ZIP of ~8–15 cards must stay responsive, with optional progress            |
| Filter API                             | Hide `[data-chart-download]` (or similar) nodes during clone               |

Hardest visual cases to prove in a spike: **VM Migration Status** (donut + centre label + legend) and **Operating Systems** (horizontal bars + tokens), in both light and dark theme.

## Candidates

All serious options clone or redraw the live DOM in the browser. Server-side / headless screenshotting is out of scope.

### 1. `html2canvas-pro` (already a dependency)

- **How it works:** Walks computed styles and **repaints** the subtree onto a `<canvas>`.
- **Used today:** `PdfExportService.generate()` — one large canvas, then page slices.
- **Verdict:** Keep for PDF. Do **not** reuse for per-card PNG.

Repainting is a poor match for PatternFly + Victory SVG. It is also slow for many sequential captures (Monday.com measured ~21s for 10 dashboard widgets with classic `html2canvas`). PDF needs that one giant canvas; PNG export does not.

### 2. `html-to-image`

- **How it works:** Clones the DOM into an SVG `<foreignObject>`, then rasterises. Same family as `dom-to-image`.
- **Ecosystem:** Very widely used (~5M weekly npm downloads). TypeScript. `toPng` / `toBlob` / `filter`.
- **Maintenance:** Last useful publish around **1.11.13** (Feb 2025).
- **Verdict:** Do **not** adopt.

From 1.11.12 onward there are open regressions that hit **this exact UI**:

- CSS variables in SVG charts lost or rendered black ([#500](https://github.com/bubkoo/html-to-image/issues/500))
- SVG background / style cloning broken ([#506](https://github.com/bubkoo/html-to-image/issues/506), [#516](https://github.com/bubkoo/html-to-image/issues/516))
- `foreignObject` missing from PNG ([#520](https://github.com/bubkoo/html-to-image/issues/520))
- Custom fonts dropped inside SVG ([#534](https://github.com/bubkoo/html-to-image/issues/534))

Teams that still use it pin **1.11.11**. That is not a viable long-term dependency for a new feature.

### 3. `modern-screenshot` — **recommended**

- **How it works:** Same SVG `foreignObject` clone as `html-to-image`; it is an actively maintained **fork**.
- **API:** `domToPng`, `domToBlob`, `filter`, `scale`, `backgroundColor`, `progress`, `placeholderImage`, optional workers.
- **Batch:** `createContext` / `destroyContext` reuses work across many cards — fits ZIP-all.
- **Maintenance:** Latest **4.7.0** (Apr 2026), including “fix SVG rendering when directly targeting svg tag”.
- **Production analogue:** Monday.com chose it to snapshot each dashboard widget for customer-facing reports ([engineering write-up](https://engineering.monday.com/capturing-dom-as-image-is-harder-than-you-think-how-we-solved-it-at-monday-com/)).
- **Verdict:** **Use this** for PNG chart export.

Sketch of the capture call:

```ts
import { domToBlob } from "modern-screenshot";

const blob = await domToBlob(cardElement, {
  scale: 2,
  backgroundColor: getComputedStyle(cardElement).backgroundColor,
  filter: (el) => !el.closest?.("[data-chart-download]"),
});
```

`domToBlob` can be fed straight into JSZip for the “download all” path.

### 4. `@zumer/snapdom` — fallback only

- **How it works:** Newer from-scratch clone engine; claims first-class CSS variables, SVG references, and fonts.
- **Ecosystem:** ~300–400k weekly downloads; first published Apr 2025; still moving quickly.
- **Verdict:** Spike **only if** `modern-screenshot` fails PatternFly tokens or Victory SVG on the two hard cards. Too young to pick first for a Red Hat product unless the recommended library fails the spike.

## Comparison

| Criterion             | `html2canvas-pro`    | `html-to-image`           | `modern-screenshot`               | `@zumer/snapdom`                 |
| --------------------- | -------------------- | ------------------------- | --------------------------------- | -------------------------------- |
| Approach              | Canvas repaint       | SVG clone                 | SVG clone (fork of html-to-image) | SVG clone (new)                  |
| SVG + CSS variables   | Weak                 | **Regressed in 1.11.12+** | Actively fixed                    | Claimed first-class              |
| Hide download control | `ignoreElements`     | `filter`                  | `filter`                          | exclude options                  |
| ZIP-all / progress    | Slow, no reuse       | One-shot                  | Context reuse + `progress`        | Fast; capture-once / export-many |
| Fit in this app       | **PDF only**         | Do not use                | **PNG charts**                    | Fallback spike                   |
| Risk                  | Known PDF trade-offs | Pinning an old version    | Moderate; prove on two cards      | Younger ecosystem                |

## Decision

**Adopt `modern-screenshot` for PNG chart snapshots.**

Keep `html2canvas-pro` exclusively for PDF page capture. Do not introduce `html-to-image`. Treat `@zumer/snapdom` as the fallback if the spike below fails.

ZIP packaging is a separate dependency (for example `jszip`); it does not change the snapshot choice.

## Spike (do this before wiring the UI)

Prove visual quality **before** adding Export → PNG and per-card icons.

1. Install `modern-screenshot` in a throwaway branch.
2. Capture these two live cards, light and dark theme:
   - VM Migration Status (`#vm-migration-status`)
   - Operating Systems (`OSDistribution` card)
3. Check: colours (not black/missing fills), fonts, donut hole / centre label, bar lengths, legend, card border/background, no clipped overflow.
4. Confirm `filter` can omit a dummy download control.
5. Capture every dashboard card sequentially and note time / main-thread jank.

**Pass:** implement `PngExportService` + UI.  
**Fail (bad colours / broken SVG):** repeat the same two cards with `@zumer/snapdom`. Pick the library that passes; do not ship a pin of `html-to-image@1.11.11`.

## Implementation notes (after a successful spike)

Align with existing export architecture (`docs/app-architecture.md`):

- **Service** (no React): `src/services/png-export/PngExportService.ts` — `capture` a node to `Blob`, `createArchive` / `addChart` / `downloadArchive` for ZIP. Mirror `PdfExportService` / `HtmlExportService`.
- **View model:** loading label, error, `exportPngZip(run)`, per-card download handler. Views stay render-only.
- **ZIP memory model:** do **not** snapshot the live dashboard or the full PDF off-screen tree (`exportAllViews` stacks views). Sequence:
  1. N dedicated export-mode chart jobs (`PngChartExportJobs`), one PNG per view
  2. `PngChartExportRunner` paints **all** jobs once in `#png-hidden-container` as **graph-only** frames (`ExportGraphFrame`: title + chart, no PatternFly Card)
  3. Yield so Victory/PatternFly can layout
  4. ZIP capture prefers native SVG → PNG (donut + legend), and falls back to `modern-screenshot` only for HTML views (OS table, issues breakdown, infrastructure summary, CPU overcommit)
  5. Capture returns a Blob
  6. Blob is added to the ZIP immediately
  7. Unmount the hidden tree
  8. `zip.generateAsync()` and trigger the download

  Peak DOM is one off-screen graph-only tree. Peak images stay one capture at a time. PDF still uses the full Dashboard `OffScreenRenderer` (warnings/errors/layout); `ExportGraphFrame` is the shared surface to reuse later.

- **Per-card download:** same capture as ZIP for that card (native SVG when present, HTML clone otherwise). Download icon uses `data-chart-download`.
- Cards with a view-mode dropdown: PDF still uses `isExportMode` + `exportAllViews` (all views stacked in one card). PNG ZIP uses `isExportMode` + `exportView` so **each dropdown view is its own PNG**.

## References

- [modern-screenshot](https://github.com/qq15725/modern-screenshot) / npm `modern-screenshot@4.7.0`
- [html-to-image](https://github.com/bubkoo/html-to-image) issues [#500](https://github.com/bubkoo/html-to-image/issues/500), [#506](https://github.com/bubkoo/html-to-image/issues/506), [#516](https://github.com/bubkoo/html-to-image/issues/516), [#520](https://github.com/bubkoo/html-to-image/issues/520), [#534](https://github.com/bubkoo/html-to-image/issues/534)
- [Capturing DOM as Image Is Harder Than You Think](https://engineering.monday.com/capturing-dom-as-image-is-harder-than-you-think-how-we-solved-it-at-monday-com/) (monday.com, 2025)
- Existing PDF path: `src/services/pdf-export/PdfExportService.ts`
