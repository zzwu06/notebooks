# Validation scope

Numerical tests cover the Gaussian spatial integral against its closed form,
180-degree periodicity, normalization, threshold suppression and silent
edge cases, all offered recurrent gains, steady-state residuals, kernel eigenmodes,
zero-coupling equivalence, Euler step refinement, and intervention continuity.
Structural checks cover English-only source, unique IDs, anchors, and figures.

Browser review checks desktop and mobile layout, keyboard-operated range controls,
normalization, resets, intervention switching, and source/trajectory downloads.
The archive is independently opened and its checksums verified before publication.

Limits: deterministic teaching models; no experimental fitting, uncertainty model,
spiking mechanism, plasticity, explicit E/I cell types, or original-paper replication.
Long formulas use responsive wrapping; code examples may scroll horizontally.

Verified 2026-11-02: 9 tests passed. Desktop (1280 px) and mobile (390 px) had no document overflow or console errors. Range limits, normalization, reset, and both interventions were exercised. Both downloads completed through the browser. The downloaded ZIP passed CRC and SHA-256 checks; its extracted source independently passed all tests and built without dependencies. The CSV contained 501 rows with the selected parameters.


## Mathematics revision

All 14 numbered equations and the inline notation are pre-rendered by pinned
KaTeX 0.19.1, with strict parsing and HTML + MathML output. Fonts and license are
served from the same site. A chart SVG rule was scoped to the labs so it cannot
distort radical bars or other math SVG glyphs. Equations have stable links and
compact layouts, with no font-size scaling to force overly long lines to fit.

Visual review covered 320, 390, 768 and 1280 px viewports: no document or display-
equation horizontal overflow. Fractions, integrals, radicals, aligned derivations,
and inline symbols were inspected. Browser console reported no errors. Threshold
controls still worked. Print CSS was added; paper/PDF output has not been visually
reviewed. The earlier dependency-free build statement applies to the previous
release; this version uses npm ci for the pinned build-time math dependency.

Figure refinement: equations now use a white background without framing and black, vertically centered numbers. All five plots use left/bottom axes, outward ticks, rounded tick intervals, Arial labels, and no horizontal gridlines. Analytic input and coupling curves are evaluated at one-degree resolution; numerical population curves preserve their sampled values. Checked 320/390 px equation fit, desktop plot appearance, gain and normalization controls, and console errors. Design reference: https://research-figure-guide.nature.com/figures/preparing-figures-our-specifications/
