#!/usr/bin/env node
/* global document, DOMPoint, DOMParser, XMLSerializer, getComputedStyle */
import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Runs inside Chromium. All measurements are converted into root user units.
export function inspectDocument() {
  const root = document.documentElement;
  const errors = new Set(),
    warnings = new Set();
  const vb = root.viewBox.baseVal;
  const rootInverse = root.getScreenCTM().inverse();
  const matrix = (el) => rootInverse.multiply(el.getScreenCTM());
  const point = (m, x, y) => new DOMPoint(x, y).matrixTransform(m);
  const box = (el, b = el.getBBox()) => {
    const m = matrix(el);
    const pts = [
      [b.x, b.y],
      [b.x + b.width, b.y],
      [b.x, b.y + b.height],
      [b.x + b.width, b.y + b.height],
    ].map(([x, y]) => point(m, x, y));
    const x = Math.min(...pts.map((p) => p.x)),
      y = Math.min(...pts.map((p) => p.y));
    return {
      x,
      y,
      w: Math.max(...pts.map((p) => p.x)) - x,
      h: Math.max(...pts.map((p) => p.y)) - y,
    };
  };
  const overlap = (a, b, pad = 0) =>
    a.x < b.x + b.w - pad &&
    a.x + a.w > b.x + pad &&
    a.y < b.y + b.h - pad &&
    a.y + a.h > b.y + pad;
  const inside = (p, b, pad = 0) =>
    p.x > b.x + pad && p.x < b.x + b.w - pad && p.y > b.y + pad && p.y < b.y + b.h - pad;
  const visible = (el) => {
    if (el.closest('defs,marker,pattern,clipPath,mask,symbol')) return false;
    for (let p = el; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0)
        return false;
    }
    return true;
  };
  const label = (el) => el.id || el.textContent.trim().slice(0, 70) || el.tagName;
  const texts = [...root.querySelectorAll('text')].filter(visible).map((el) => ({
    el,
    label: label(el),
    b: box(el),
    font: getComputedStyle(el).fontFamily,
  }));
  const nodes = [...root.querySelectorAll('[data-node="true"]')].filter(visible).map((el) => {
    const [x, y, width, height] = (el.getAttribute('data-bounds') || el.getAttribute('data-layout'))
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    return { el, id: el.id, b: box(el, { x, y, width, height }) };
  });
  for (const { el, label: name, b } of texts) {
    if (
      b.x < vb.x - 0.5 ||
      b.y < vb.y - 0.5 ||
      b.x + b.w > vb.x + vb.width + 0.5 ||
      b.y + b.h > vb.y + vb.height + 0.5
    )
      errors.add(`text outside canvas: ${name}`);
    if (b.w === 0 || b.h === 0) warnings.add(`zero-size text: ${name}`);
    const owner = nodes.find((n) => n.el === el.closest('[data-node="true"]'));
    if (
      owner &&
      (b.x < owner.b.x + 3 ||
        b.y < owner.b.y + 3 ||
        b.x + b.w > owner.b.x + owner.b.w - 3 ||
        b.y + b.h > owner.b.y + owner.b.h - 3)
    )
      errors.add(`text outside allocated node ${owner.id}: ${name}`);
  }
  for (let i = 0; i < texts.length; i++)
    for (const t of texts.slice(i + 1)) {
      if (overlap(texts[i].b, t.b, 1)) errors.add(`text overlap: ${texts[i].label} / ${t.label}`);
    }
  for (let i = 0; i < nodes.length; i++)
    for (const n of nodes.slice(i + 1)) {
      if (nodes[i].el.contains(n.el) || n.el.contains(nodes[i].el)) continue;
      if (overlap(nodes[i].b, n.b, 0.5)) errors.add(`node overlap: ${nodes[i].id} / ${n.id}`);
    }
  const allNodes = root.querySelectorAll('[data-node="true"]');
  if (allNodes.length !== nodes.length)
    errors.add('semantic node is hidden or stored in a definition');
  const allEdges = [...root.querySelectorAll('[data-edge="true"],[data-sf-start-node]')];
  const edgeEls = allEdges.filter(visible);
  if (allEdges.length !== edgeEls.length)
    errors.add('semantic edge is hidden or stored in a definition');
  for (const edge of edgeEls) {
    const shapes = edge.matches('path,line,polyline')
      ? [edge]
      : [...edge.querySelectorAll('path,line,polyline')];
    if (shapes.length !== 1) {
      warnings.add(`edge needs exactly one route geometry for measurement: ${edge.id}`);
      continue;
    }
    const shape = shapes[0],
      length = shape.getTotalLength(),
      m = matrix(shape);
    if (!Number.isFinite(length) || length <= 0) {
      errors.add(`empty edge: ${edge.id}`);
      continue;
    }
    const scale = Math.max(Math.hypot(m.a, m.b), Math.hypot(m.c, m.d));
    const samples = Math.max(1, Math.min(4000, Math.ceil((length * scale) / 2)));
    if (samples === 4000) warnings.add(`route sample cap reached: ${edge.id}`);
    for (let i = 0; i <= samples; i++) {
      const local = shape.getPointAtLength((length * i) / samples),
        p = point(m, local.x, local.y);
      if (p.x < vb.x || p.y < vb.y || p.x > vb.x + vb.width || p.y > vb.y + vb.height)
        errors.add(`edge outside canvas: ${edge.id}`);
      for (const n of nodes)
        if (inside(p, n.b, 0.75)) errors.add(`edge through node: ${edge.id} / ${n.id}`);
      for (const t of texts)
        if (inside(p, t.b, -1)) errors.add(`edge through text: ${edge.id} / ${t.label}`);
    }
    for (const [side, at] of [
      ['from', 0],
      ['to', length],
    ]) {
      const id =
        edge.getAttribute(`data-${side}`) ||
        edge.getAttribute(`data-sf-${side === 'from' ? 'start' : 'end'}-node`)?.replace(/^#/, '');
      const n = nodes.find((v) => v.id === id);
      const local = shape.getPointAtLength(at),
        p = point(m, local.x, local.y);
      if (n) {
        const dx = Math.max(n.b.x - p.x, 0, p.x - n.b.x - n.b.w);
        const dy = Math.max(n.b.y - p.y, 0, p.y - n.b.y - n.b.h);
        if (Math.hypot(dx, dy) > 16) warnings.add(`distant ${side} endpoint: ${edge.id} / ${id}`);
      }
    }
  }
  if (!nodes.length || !edgeEls.length)
    warnings.add('no helper metadata: node/route coverage incomplete');
  // Exercise a real native text mutation followed by serialize/reparse, in memory only.
  const clone = root.cloneNode(true),
    t = clone.querySelector('text');
  let roundtrip = false;
  if (t) {
    const sentinel = 'Editable roundtrip ✓';
    t.textContent = sentinel;
    const reopened = new DOMParser().parseFromString(
      new XMLSerializer().serializeToString(clone),
      'image/svg+xml',
    );
    roundtrip =
      !reopened.querySelector('parsererror') &&
      reopened.querySelector('text')?.textContent === sentinel &&
      reopened.querySelectorAll('[id]').length === root.querySelectorAll('[id]').length;
    if (!roundtrip) errors.add('text edit/XML roundtrip failed');
  }
  return {
    errors: [...errors],
    warnings: [...warnings],
    counts: { nodes: nodes.length, edges: edgeEls.length, texts: texts.length },
    fonts: [...new Set(texts.map((t) => t.font))],
    textEditXmlRoundtrip: roundtrip,
    limits: [
      'Axis-aligned envelopes; stroke/marker extents and clipping require visual inspection.',
      'Routes sampled at ~2 root units, capped at 4000 samples per edge; narrow collisions can escape.',
      'Font stacks reported, not proof that the first font is installed.',
      'No automated contrast, brand fidelity, editor binding or user acceptance verdict.',
    ],
  };
}

export async function loadChromium() {
  const localRequire = createRequire(import.meta.url);
  const cwdRequire = createRequire(join(process.cwd(), 'package.json'));
  for (const req of [localRequire, cwdRequire])
    for (const pkg of ['@playwright/test', 'playwright']) {
      try {
        const loaded = await import(pathToFileURL(req.resolve(pkg)).href);
        const chromium = loaded.chromium || loaded.default?.chromium;
        if (chromium) return chromium;
      } catch (error) {
        if (error.code !== 'MODULE_NOT_FOUND' && error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
      }
    }
  throw new Error(
    'Install playwright in the current project, then install its Chromium browser. See references/validation.md.',
  );
}

async function main() {
  const args = process.argv.slice(2),
    file = args.shift();
  if (!file || file === '--help') {
    console.log(
      'node render_check.mjs diagram.svg --out qa-directory [--graph graph.json] [--channel chrome]',
    );
    return file ? 0 : 2;
  }
  const options = {};
  while (args.length) {
    const flag = args.shift();
    if (
      !['--out', '--graph', '--channel'].includes(flag) ||
      !args.length ||
      args[0].startsWith('--')
    )
      throw new Error(`Invalid argument: ${flag}`);
    options[flag] = args.shift();
  }
  if (!options['--out']) throw new Error('--out is required (source files are never overwritten)');
  const svgPath = resolve(file),
    out = resolve(options['--out']);
  const graphPath = options['--graph'] ? resolve(options['--graph']) : null;
  for (const name of ['native.png', 'fit-960.png', 'fit-390.png', 'report.json']) {
    if ([svgPath, graphPath].includes(join(out, name))) {
      throw new Error('Output artifacts would overwrite an input; choose another --out directory.');
    }
  }
  const preflight = [join(dirname(fileURLToPath(import.meta.url)), 'validate_svg.py'), svgPath];
  if (graphPath) preflight.push('--graph', graphPath);
  let structure;
  try {
    structure = JSON.parse(execFileSync('python3', preflight, { encoding: 'utf8' }));
  } catch (error) {
    if (error.stdout) process.stdout.write(error.stdout);
    throw new Error('Structural preflight failed; SVG was not opened.', { cause: error });
  }
  const xml = await readFile(svgPath, 'utf8');
  const chromium = await loadChromium();
  const browser = await chromium.launch(
    options['--channel'] ? { channel: options['--channel'] } : {},
  );
  try {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      serviceWorkers: 'block',
      deviceScaleFactor: 1,
    });
    const network = [];
    await context.route('**/*', (route) => {
      network.push(route.request().url());
      return route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    await page.goto(`data:image/svg+xml;base64,${Buffer.from(xml).toString('base64')}`);
    const dimensions = await page.evaluate(async () => {
      await document.fonts.ready;
      const r = document.documentElement;
      return { width: r.width.baseVal.value, height: r.height.baseVal.value };
    });
    if (dimensions.width > 8192 || dimensions.height > 8192)
      throw new Error(
        'Native render exceeds 8192px helper limit; use a smaller preview or another browser.',
      );
    await page.setViewportSize({
      width: Math.ceil(dimensions.width),
      height: Math.ceil(dimensions.height),
    });
    const geometry = await page.evaluate(inspectDocument);
    if (network.length)
      geometry.errors.push('SVG attempted resource requests; requests were blocked');
    await mkdir(out, { recursive: true });
    await page.screenshot({ path: join(out, 'native.png') });
    for (const width of [960, 390]) {
      const height = Math.ceil((dimensions.height * width) / dimensions.width);
      const fitXml = await page.evaluate(
        ({ width, height }) => {
          const copy = document.documentElement.cloneNode(true);
          copy.setAttribute('width', String(width));
          copy.setAttribute('height', String(height));
          return new XMLSerializer().serializeToString(copy);
        },
        { width, height },
      );
      // Fresh page at each size avoids Chromium gradient/compositing residue after resize.
      const fitPage = await context.newPage();
      await fitPage.setViewportSize({ width, height });
      await fitPage.goto(`data:image/svg+xml;base64,${Buffer.from(fitXml).toString('base64')}`);
      await fitPage.evaluate(() => document.fonts.ready);
      await fitPage.screenshot({ path: join(out, `fit-${width}.png`) });
      await fitPage.close();
    }
    const editedXml = await page.evaluate(() => {
      const copy = document.documentElement.cloneNode(true);
      copy.querySelector('text').textContent = 'Editable roundtrip ✓';
      return new XMLSerializer().serializeToString(copy);
    });
    await page.goto(`data:image/svg+xml;base64,${Buffer.from(editedXml).toString('base64')}`);
    const textEditBrowserReopen = await page.evaluate(async () => {
      await document.fonts.ready;
      return (
        document.querySelector('text')?.textContent === 'Editable roundtrip ✓' &&
        document.querySelector('text').getBBox().width > 0
      );
    });
    if (!textEditBrowserReopen)
      geometry.errors.push('edited SVG failed to reopen with native text');
    const report = {
      file: svgPath,
      renderer: `Chromium ${browser.version()}`,
      structure,
      geometry,
      textEditBrowserReopen,
      blockedRequests: network,
      status: geometry.errors.length
        ? 'fail'
        : geometry.warnings.length || structure.warnings.length
          ? 'technical-checks-incomplete'
          : 'technical-checks-passed',
      visualReview: 'required',
    };
    await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
    return geometry.errors.length ? 1 : 0;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
