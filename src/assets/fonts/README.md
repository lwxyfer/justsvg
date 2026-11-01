# JustSVG homepage display font

## Current sans display face

`justsvg-sans.woff` is a renamed variable character subset of **Noto Sans SC**, used for the approved A/B four-screen homepage's heavy headings and page text. Source: https://github.com/google/fonts/tree/main/ofl/notosanssc ; source file `NotoSansSC[wght].ttf`, downloaded 2026-10-28. Original SHA-256: `a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da`. It is renamed **JustSVG Sans**, retains weights 100–900 and is 147540 bytes. Character coverage was subset with fontTools from homepage source plus printable ASCII. OFL 1.1 notice: `OFL-NotoSansSC.txt`, also shipped as `public/licenses/NotoSansSC-OFL.txt`. No runtime font service. SVG exports retain portable system fallbacks rather than embedding this display font. Regenerate the subset for new page copy.

The identity wordmark and editor retain their existing faces. The earlier serif subset below is retained as an unused historical asset; it is not imported by the current homepage.

## Earlier serif display face

`justsvg-display.woff` is a character subset of Noto Serif SC, sourced from the official Google Fonts repository:

- Source: https://github.com/google/fonts/tree/main/ofl/notoserifsc
- Font: https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf
- License: `OFL-NotoSerifSC.txt` (SIL Open Font License 1.1).
- Original source SHA-256: 050080d9255a86808f2945bffac582b31ef32bc36411ce29563b4961670c66f9

The local subset is renamed **JustSVG Display**. It retains variable weights and contains the current homepage components and featured-brand copy characters. It is bundled with the site; no runtime font service is used. Regenerate the subset when adding display text with new characters. The editor, example artworks, body text and identity wordmark retain their own fonts.
