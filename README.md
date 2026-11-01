<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/justsvg-wordmark-inverse.svg" />
    <img src="public/brand/justsvg-wordmark.svg" alt="JustSVG" width="285" height="86" />
  </picture>
</p>

<h1 align="center">JustSVG</h1>

<p align="center">
  <strong>Just diagrams. Just SVG.</strong><br />
  An open-source, SVG-native alternative to draw.io.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2855ee" alt="License: MIT" /></a>
  <img src="https://img.shields.io/badge/status-beta-53627b" alt="Status: beta" />
</p>

<p align="center">
  <a href="#quickstart">Quickstart</a> ·
  <a href="#svg-diagram-skill">SVG Skill</a> ·
  <a href="#style-library">Style library</a> ·
  <a href="#contributing">Contributing</a> ·
  <a href="README.zh-CN.md">简体中文</a>
</p>

JustSVG pairs a browser-based SVG editor with SVG Diagram Skill. Generate architecture diagrams, flowcharts and infographics in your AI tool, or start from an editable example. Refine the result in the editor and export standard SVG with editable text, shapes and groups.

![JustSVG editor with an editable architecture diagram, insertion library and properties panel](docs/images/editor.png)

## SVG Skill + editor

| Component             | What you do                                                                                                            | Start here                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **SVG Diagram Skill** | Give your AI agent a diagram brief and a visual reference. Get native SVG, the generation prompt and validation notes. | [Use the Skill](#svg-diagram-skill) |
| **SVG editor**        | Open the SVG, edit text and shapes, move nodes and refine connections. Save the result as SVG.                         | [Run the editor](#quickstart)       |

The Skill can run independently of the editor. The web app prepares prompts and edits files; generation happens in your AI tool.

## What you can do

- **Edit native SVG.** Work with text, shapes, groups, gradients and internal references. Inspect and edit the SVG source when you need it.
- **Keep connections attached.** Bound lines and arrows follow nodes when you move, resize or align them. Imported connections can be linked to nodes in the editor.
- **Start from a style.** Browse 139 editable examples across 58 styles, including 36 brand-inspired studies. Each example includes a reusable generation prompt.
- **Build with reusable parts.** Insert 24 composition templates, diagram shapes, bundled Lucide icons or your own SVG components.
- **Work locally.** Edit without an account or backend. The editor keeps browser-local recovery copies; export SVG files for storage and sharing.
- **Add SVG motion.** Configure flow effects on connections and opacity effects on objects. Export an animated SVG or a static version for documents.

## Quickstart

Requires **Node.js 22.12+** and npm. CI uses Node.js 24.

```sh
git clone https://github.com/lwxyfer/justsvg.git
cd justsvg
npm ci
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). Vite prints the active address if that port is in use.

| Route       | Purpose                                                                |
| ----------- | ---------------------------------------------------------------------- |
| `/`         | Product overview, interactive style previews and a small editable demo |
| `/editor`   | Full SVG editor                                                        |
| `/examples` | Searchable style and example library                                   |

To edit your first diagram:

1. Open an example, drag in an `.svg` file, or paste SVG source.
2. Double-click text to edit it. Move or resize nodes, adjust colors and refine the layout.
3. Export the SVG. Open it in a browser or import it again to continue editing.

The [editor guide](docs/EDITOR_GUIDE.zh-CN.md) covers shortcuts, grouping, linked connectors, motion and recovery.

## SVG Diagram Skill

Use the Skill in an AI agent that can read local files. From this repository, give it a task such as:

```text
Read skills/svg-diagram/SKILL.md.

Create an editable SVG architecture diagram:
- Client → API → queue → worker
- API → database

Use a clear technical-document style. Keep text and groups editable.
Return the SVG, the complete generation prompt and validation notes.
```

For repeated use, install the entire `skills/svg-diagram/` directory in your agent's supported skills location. Keep its references, scripts, examples and license together. See the [installation and usage guide](skills/svg-diagram/README.md).

The Skill includes a prompt template, an SVG contract, structural checks, browser checks and worked architecture/flowchart examples. Validation scripts have their own dependencies; see the [validation guide](skills/svg-diagram/references/validation.md).

## Style library

Compare how the same RAG architecture reads in different brand-inspired compositions, then open an example to edit it or reuse its prompt.

![Browse brand-inspired SVG diagram styles with the interactive record deck](docs/images/brand-style-flip.gif)

The library also covers system and deployment architecture, swimlanes, sequence diagrams, entity relationships, infographics, data flows and roadmaps. Five base treatments let you compare the same content in different visual styles.

Brand studies are original JustSVG examples inspired by public visual references. They are not official brand templates. Their prompts include references and adaptation notes; see [brand studies](docs/BRAND_EXAMPLES.md).

<details>
<summary>Preview the example library</summary>

![JustSVG example library with searchable SVG previews](docs/images/examples.png)

</details>

## Status and scope

Current version: **1.0.0-beta.1**.

- SVG import, editing, export and re-import are available. `.drawio` project files are not supported.
- The homepage supports English and Chinese. The editor and example-library interface currently use Chinese.
- The editor targets desktop browsers. Chrome automation is in place; Safari and physical trackpad/input-method acceptance remain open.
- Automatic obstacle routing, full-graph layout, pen/path-node drawing and cloud collaboration are outside the current editor's capabilities.
- Browser recovery restores documents and views, but does not preserve undo history across reloads. Export files for lasting copies.
- Imports are sanitized. Scripts, external resources and unsupported SVG features may be removed; complex third-party SVGs can have compatibility limits.

See the [editor compatibility notes](docs/EDITOR_GUIDE.zh-CN.md#安全与兼容性), [1.0 scope](docs/V1.0_REQUIREMENTS.md) and [implementation notes](docs/V1.0_PROGRESS.md) for details.

## Development

```sh
npm run lint
npm test
npm run build
```

End-to-end tests default to an installed Google Chrome. To use Playwright Chromium:

```sh
npx playwright install chromium
PW_CHANNEL=chromium npm run test:e2e
```

In PowerShell, set `$env:PW_CHANNEL="chromium"` before running `npm run test:e2e`.

The E2E runner starts or reuses the local Vite server on port 5173. Failures retain screenshots and traces in `test-results/`; the HTML report is in `playwright-report/`. [CI](.github/workflows/ci.yml) runs lint, unit tests, the production build and Chromium E2E tests.

<details>
<summary>Repository structure</summary>

```text
src/home/              Product homepage and SVG demonstrations
src/app/               Routing, document tabs and local recovery
src/editor/document/   Native SVG editing, transactions and history
src/editor/canvas/     Viewport, pointer interaction and overlays
src/editor/security/   SVG parsing, sanitization and input limits
src/editor/insert/     Shapes, icons and composition templates
src/examples/          SVG examples, styles and paired prompts
skills/svg-diagram/    Standalone SVG Diagram Skill
tests/                 Unit and browser regression tests
```

</details>

## Self-hosting

```sh
npm run build
npm run preview
```

`npm run preview` serves the production build locally. Deploy `dist/` to a static host for sharing. Configure `/editor` and `/examples` to fall back to `index.html`. For a subdirectory deployment, set Vite's `base` in `vite.config.ts` before building.

The app needs no backend or AI API key. AI generation runs in the user's separate AI tool.

## Documentation

Detailed guides are currently in Chinese.

| Guide                                                | Covers                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| [Editor guide](docs/EDITOR_GUIDE.zh-CN.md)           | Editing, shortcuts, document recovery and SVG compatibility |
| [SVG Diagram Skill](skills/svg-diagram/README.md)    | Installation, prompts, examples and validation              |
| [Example library](docs/EXAMPLES.md)                  | SVG/prompt structure and library maintenance                |
| [Composition templates](docs/COMPOSITE_TEMPLATES.md) | Reusable architectures, flows and components                |
| [Brand studies](docs/BRAND_EXAMPLES.md)              | Visual references, compositions and attribution             |
| [Working diagrams](docs/WORKPLACE_EXAMPLES.md)       | Eight diagram types and their base-style variants           |
| [Validation notes](docs/VALIDATION.md)               | Recorded checks and their limits                            |

## Contributing

Bug reports, SVG compatibility cases, diagram examples and documentation improvements are welcome.

- [Report a bug](https://github.com/lwxyfer/justsvg/issues/new): include a small reproducing SVG, steps, browser version and expected behavior.
- [Propose a change](https://github.com/lwxyfer/justsvg/issues): discuss changes to the SVG contract or editing model before a large implementation.
- Submit a pull request with focused changes and relevant checks. Include screenshots for UI changes; diagram examples should include editable SVG, a complete prompt and source references where applicable.

The [development commands](#development) match the repository's CI checks. For example contributions, start with the [library guide](docs/EXAMPLES.md).

## License

JustSVG source code is licensed under [MIT](LICENSE). Icons, fonts and other dependencies retain their own licenses; see [third-party notices](docs/THIRD_PARTY.md).
