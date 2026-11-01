# Homepage languages

The homepage defaults to English. The header’s EN / 中文 controls switch all four chapters, navigation, controls, accessibility labels, built-in tasks/prompts, feedback and diagram annotations. Explicit choices are stored under `justsvg.home.language`; unavailable storage falls back to an in-memory choice. Browser language does not override the English default.

English mode uses English text throughout the built-in native SVG scenes, file thumbnails and 36 brand sleeves. Chinese mode retains English technical node names alongside Chinese annotations. User-entered diagram text and task content remain user content: switching languages does not rewrite it or discard diagram edits, colors, positions or undo history.

`home-translations.json` holds homepage and artwork translations. `HomeLocaleProvider` owns locale preference and homepage document language/title. The homepage components consume the shared context. Other application routes retain their existing interface; this change does not claim a complete editor/library translation.

English brand sleeves are derived native SVG files under `public/home/brands-en/`. Originals in `src/examples/assets/` remain unchanged for Chinese mode. Regenerate derivatives after updating an original study or translation:

```sh
python3 scripts/generate-home-brand-locales.py
```

The generator preserves native shapes, semantic node IDs and connections, translates artwork text, and fits expanded English labels to their original text extents where needed. It rejects untranslated Chinese. It adds no raster assets, fonts, dependencies or runtime network service.

English responsive typography keeps the approved visual identity while allowing a three-line hero and balanced section titles. The language selector works by keyboard and touch. Locale-driven layout changes use the existing motion/connection refresh path.

Verification includes default English and English-only SVG, all 36 English sleeves, persistent preference, switching with edits, opening English SVG in the full editor, and English/Chinese desktop, compact and phone layouts. Existing Chinese interaction tests choose Chinese explicitly rather than changing the product default.

Final verification: production build, targeted ESLint and diff checks passed. All 19 homepage browser cases passed in one run (31.2 seconds), including the three language cases. English/Chinese captures at 1600, 816 and 390 pixels are under `.impeccable/review/home-language/`.
