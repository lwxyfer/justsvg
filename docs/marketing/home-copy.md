# Homepage copy

Updated 2026-10-31. Applies to the bilingual homepage, not the editor or example-library interface.

The homepage addresses people making architecture diagrams, flowcharts and infographics for technical documents, presentations and blogs. It explains the two parts of the product: SVG Skill prepares diagram generation in a supporting AI tool; the editor refines native SVG directly.

| Chapter      | Chinese heading          | English heading                  | What the visitor should understand                                                     |
| ------------ | ------------------------ | -------------------------------- | -------------------------------------------------------------------------------------- |
| Introduction | draw.io 的开源替代。     | Open-source draw.io alternative. | The product category, diagram types and Skill-to-editor workflow.                      |
| Brand styles | 为技术图选一种品牌风格。 | Find a style for your diagram.   | Compare the same architecture diagram in different palettes and compositions.          |
| SVG Skill    | 把画图任务交给 AI。      | Give your AI a diagram task.     | Install the Skill, describe the task, copy the generated instruction into the AI tool. |
| Editor       | 生成之后，直接改图。     | Edit the diagram directly.       | Try real text, color and node edits, then open the diagram in the full editor.         |

The hero retains the existing draw.io-alternative positioning. Supporting copy names architecture diagrams, flowcharts and infographics, and explicitly locates generation in the visitor's AI tool. The three feature captions explain practical uses, editable SVG exports and direct manipulation.

Actions describe their destination or result: “了解 SVG Skill / Explore SVG Skill” scrolls to the Skill chapter; “打开风格示例 / View example” opens the selected example in the library; “下载 SVG Skill / Download SVG Skill” downloads the package; “复制生成指令 / Copy diagram prompt” copies the task with style and SVG requirements. Expanded instructions can be hidden using the corresponding localized label. Successful copying explains where to paste; clipboard fallback retains selection and the copy shortcut.

Use “AI 工具 / AI tool” in visitor-facing explanations. Keep “SVG Skill” as the product name and explain editable SVG through text, shapes and future editing. Keep the fixed-example note so task editing does not imply generation inside the webpage. Keep the brand-inspired, unofficial-template attribution. Preserve the established “Just diagrams. Just SVG.” tagline.

Homepage brand labels and descriptions live in `src/home/home-brand-copy.json`. They describe visible colors, shapes, grouping and reading order. English versions live in `src/home/home-translations.json`. Original SVG artwork, library metadata and the generated English SVG assets remain independent. All 36 brand IDs have copy and English translations.

Default language remains English. Built-in SVG text remains entirely English in English mode, Chinese mode allows mixed technical labels, and language changes preserve user edits. The footer morph retains a localized accessible name; its animation area has no visible text or captions after the 2026-11-01 refinement.

The revised blue footer has a separate right-hand content column: logo/tagline, a factual product description naming architecture diagrams, flowcharts, infographics and the Skill-to-editor workflow, followed by Product and Resources navigation. This copy is ordinary readable HTML, and links use real editor, library, section, package and GitHub destinations. The column can accommodate additional useful content and links later. Do not insert search-only text, invented pages or placeholder links.

Verification includes a complete translation-key check, build, scoped ESLint, all homepage browser cases, and desktop/phone captures in both languages. The fourth chapter retains its single-screen layout at the tested viewport sizes.
