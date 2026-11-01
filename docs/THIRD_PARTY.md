# Third-party notices

JustSVG is MIT licensed. Third-party components retain their own notices.

- **GitHub navigation mark (Octicons)**: `public/brand/github-mark.svg`, from [primer/octicons](https://github.com/primer/octicons/blob/main/icons/mark-github-16.svg). MIT, Copyright (c) 2026 GitHub Inc. Full notice: [licenses/OCTICONS.txt](licenses/OCTICONS.txt). Used only for the GitHub repository link.
- **Lucide / Feather icons**: bundled UI icons and the offline icon catalog. ISC / MIT notices are in [licenses/LUCIDE.txt](licenses/LUCIDE.txt).
- **Anatomy isometric kit**: `scripts/vendor/iso-kit.mjs`, used by the native knowledge-factory example generator. MIT, Copyright (c) 2026 Ryan. Full notice: [licenses/ANATOMY.txt](licenses/ANATOMY.txt). Upstream: [Anatomy](https://github.com/wheresryan22/anatomy).
- **GSAP 3.15.0 and @gsap/react 2.1.2**: bundled homepage native SVG entry and scroll choreography (no pinned chapters; the quiet hero signal pauses offscreen and in hidden tabs). Both installed packages specify the [GSAP Standard License](https://gsap.com/standard-license); these dependencies are not MIT licensed. Current homepage exports are static native SVG and do not require GSAP; the editor’s separate native-animation capability remains independent.
- Runtime and build dependencies retain the licenses distributed in their npm packages; dependencies are declared in `package.json` and locked in `package-lock.json`.
- Brand-inspired example scenes are non-official studies, with source references and adaptation boundaries in their paired prompts and [BRAND_EXAMPLES.md](BRAND_EXAMPLES.md). These example scenes do not bundle official logos or proprietary font files; the separately licensed GitHub navigation mark is listed above.

- **Noto Sans SC / JustSVG Sans**: the four-screen homepage bundles a renamed variable character subset (147540 bytes) under SIL Open Font License 1.1. The selected D + F identity also uses outlined glyphs at weight 650 from this subset for its shared wordmark and public logo assets. Source and modification notes: [font provenance](../src/assets/fonts/README.md). The static build carries [Noto Sans SC OFL](../public/licenses/NotoSansSC-OFL.txt). The older Noto Serif SC / JustSVG Display asset remains unused by the current homepage; its [OFL notice](../public/licenses/NotoSerifSC-OFL.txt) is retained.
