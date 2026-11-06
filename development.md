# JustSVG development

[English README](README.md) · [简体中文 README](README.zh-CN.md)

[本地启动](#local-development) · [测试](#checks) · [静态部署](#static-hosting) · [Vercel](#vercel) · [贡献](#contributing)

## Local development

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

## Checks

```sh
npm run lint
npm test
npm run build
npm run test:e2e
```

End-to-end tests default to an installed Google Chrome. To use Playwright Chromium:

```sh
npx playwright install chromium
PW_CHANNEL=chromium npm run test:e2e
```

In PowerShell, set `$env:PW_CHANNEL="chromium"` before running `npm run test:e2e`.

The E2E runner starts or reuses the local Vite server on port 5173. Failures retain screenshots and traces in `test-results/`. The HTML report is in `playwright-report/`. Lint, unit tests, the production build and Chromium E2E also run in [CI](.github/workflows/ci.yml).

## Repository structure

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

## Static hosting

```sh
npm run build
npm run preview
```

The build outputs `dist/`. Use `npm run preview` to inspect that output locally. On the static host, serve existing files directly and rewrite `/editor` and `/examples` to `/index.html`. Set the Vite `base` before building if the app is deployed under a subdirectory. The app runs in the browser. SVG generation runs in a separate AI tool.

Build from the intended commit in a clean checkout. Confirm the output excludes local brand proposals, then open the public homepage, editor and a deep-linked example in a fresh browser session. Edit, export and re-import an SVG. Check that the Skill ZIP downloads. Before shipping offline support, verify that the app reopens offline after the first online visit, updates across deployments and preserves other same-origin caches.

### Vercel

Import the GitHub repository in Vercel and use the repository root. The [Vercel configuration](vercel.json) selects Vite, builds to `dist` and rewrites direct visits to the editor and example library. Check the Node.js version in the build log. Vercel resolves the range in `package.json`, and local CI uses Node.js 24. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) · [Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

The Vercel build sets `VITE_DISABLE_OFFLINE=1` to serve an online beta while the service worker fixes are pending.

## Contributing

Bug reports, SVG compatibility cases, diagram examples and documentation improvements are welcome.

- Include a small reproducing SVG, steps, browser version and expected behavior when you [report a bug](https://github.com/lwxyfer/justsvg/issues/new).
- Use [GitHub Issues](https://github.com/lwxyfer/justsvg/issues) to discuss changes to the SVG contract or editing model before a large implementation.
- Submit a pull request with focused changes and relevant checks. Include screenshots for UI changes. Diagram examples should include editable SVG, a complete prompt and source references where applicable.

For example contributions, start with the [example library maintenance guide](docs/EXAMPLES.md).

## Maintainer references

- [1.0 requirements](docs/V1.0_REQUIREMENTS.md) and [implementation progress](docs/V1.0_PROGRESS.md)
- [Validation notes](docs/VALIDATION.md), including browser coverage and acceptance checks
- [Skill validation and dependencies](skills/svg-diagram/references/validation.md)
