import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentEngine } from '../../src/editor/document/engine';
import { lineEditable, setLines, wrapText } from '../../src/editor/document/editing';
import { fixtures } from '../../src/fixtures';
import {
  shapes,
  iconAssets,
  loadIconLibrary,
  assetSource,
  matchesAsset,
} from '../../src/editor/insert/catalog';
import { sanitizeSvg } from '../../src/editor/security/sanitize';
let engine: DocumentEngine;
beforeEach(() => {
  engine = new DocumentEngine();
  engine.importSvg(fixtures.architecture);
});
describe('1.0 document editing', () => {
  it('applies sanitized source in one undoable operation without resetting previous history', () => {
    engine.transaction('original', () => engine.root!.setAttribute('opacity', '.9'));
    const original = engine.exportSvg();
    engine.applySource(original.replace('Client application', 'New title'));
    expect(engine.past).toHaveLength(2);
    expect(engine.root!.querySelector('#client-card text')!.textContent).toBe('New title');
    engine.undo();
    expect(engine.exportSvg()).toBe(original);
    engine.redo();
    expect(engine.root!.querySelector('#client-card text')!.textContent).toBe('New title');
  });
  it('rejects invalid source before changing document and clears unsafe attributes', () => {
    const original = engine.exportSvg();
    expect(() => engine.applySource('<svg><broken></svg>')).toThrow();
    expect(engine.exportSvg()).toBe(original);
    engine.applySource(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" onload="bad()"><rect width="50" height="50"/></svg>',
    );
    expect(engine.root!.hasAttribute('onload')).toBe(false);
    expect(engine.warnings.length).toBeGreaterThan(0);
    engine.undo();
    expect(engine.exportSvg()).toBe(original);
    expect(engine.warnings).toEqual([]);
  });
  it('adds and removes explicit text lines with undo and without losing the baseline', () => {
    const text = engine.root!.querySelector('#client-card text:last-child') as SVGGraphicsElement;
    expect(lineEditable(engine, text)).toBe(true);
    const other = engine.root!.querySelector('#model-card')!.outerHTML;
    setLines(engine, text, ['First', 'Second', 'Third'], 22);
    expect(text.children).toHaveLength(3);
    expect(text.children[1].getAttribute('dy')).toBe('22');
    expect(text.children[0].getAttribute('x')).toBe('18');
    expect(engine.root!.querySelector('#model-card')!.outerHTML).toBe(other);
    engine.undo();
    expect(engine.root!.querySelector('#client-card tspan')!.textContent).toBe('Web interface');
  });
  it('does not flatten mixed-styled tspan structures', () => {
    engine.importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><text><tspan x="0" fill="red">A</tspan><tspan x="0" dy="20">B</tspan></text></svg>',
    );
    const text = engine.root!.querySelector('text') as SVGGraphicsElement;
    expect(lineEditable(engine, text)).toBe(false);
    expect(() => setLines(engine, text, ['Lossy'], 20)).toThrow(/混合样式/);
    expect(text.children).toHaveLength(2);
  });
  it('tracks unexported changes independently from selection and history', () => {
    expect(engine.dirty).toBe(false);
    engine.select([engine.root!.querySelector('#client-card') as SVGGraphicsElement]);
    expect(engine.dirty).toBe(false);
    engine.transaction('edit', () => engine.root!.setAttribute('opacity', '.5'));
    expect(engine.dirty).toBe(true);
    engine.markExported();
    expect(engine.dirty).toBe(false);
    engine.undo();
    expect(engine.dirty).toBe(true);
    engine.redo();
    expect(engine.dirty).toBe(false);
  });
  it('all bundled shapes and icons sanitize as standalone native SVGs', async () => {
    await loadIconLibrary();
    expect(shapes.length).toBe(74);
    expect(iconAssets.length).toBe(1903);
    expect(new Set([...shapes, ...iconAssets].map((asset) => asset.id)).size).toBe(1977);
    for (const asset of [...shapes, ...iconAssets]) {
      const safe = sanitizeSvg(assetSource(asset));
      expect(safe.root.localName).toBe('svg');
      expect(safe.root.querySelector('script,foreignObject')).toBeNull();
      if (asset.id.startsWith('icon-'))
        expect(safe.root.querySelector('desc')?.textContent).toContain('Lucide');
    }
  }, 30000);
  it('supports Chinese compounds, multiword English, category and diagram vocabulary', () => {
    expect(
      matchesAsset(
        iconAssets.find((a) => a.id === 'icon-databasebackup')!,
        '数据库备份',
      ),
    ).toBe(true);
    expect(
      matchesAsset(
        iconAssets.find((a) => a.id === 'icon-gitbranch')!,
        'git branch',
      ),
    ).toBe(true);
    expect(
      matchesAsset(
        iconAssets.find((a) => a.id === 'icon-brain')!,
        '大脑',
      ),
    ).toBe(true);
    expect(
      matchesAsset(
        shapes.find((a) => a.id === 'shape-queue')!,
        'kafka',
      ),
    ).toBe(true);
    expect(shapes.filter((a) => matchesAsset(a, '泳道'))).toHaveLength(2);
    expect(new Set(shapes.map((a) => a.category)).size).toBe(6);
    expect(new Set(iconAssets.map((a) => a.category)).size).toBeGreaterThanOrEqual(18);
  });
  it('keeps measurement probes out of text fitting history, including undo and redo', () => {
    engine.importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><text style="font-size:20px">Long title</text></svg>',
    );
    const text = engine.root!.querySelector('text') as SVGGraphicsElement;
    engine.select([text]);
    // jsdom does not implement native SVG text measurement; test transaction boundaries here.
    Object.defineProperty(SVGElement.prototype, 'getComputedTextLength', {
      configurable: true,
      value() {
        return 100;
      },
    });
    try {
      const original = engine.exportSvg();
      wrapText(engine, text, 60, 24, true, 8);
      expect(text.style.fontSize).toBe('12px');
      expect(engine.root!.querySelectorAll('text')).toHaveLength(1);
      expect(engine.past[0].xml).toBe(original);
      engine.undo();
      expect(engine.exportSvg()).toBe(original);
      engine.redo();
      expect(engine.root!.querySelectorAll('text')).toHaveLength(1);
    } finally {
      Reflect.deleteProperty(SVGElement.prototype, 'getComputedTextLength');
    }
  });
  it('commits continuous attribute previews once, and cancels them without losing original styles', () => {
    const text = engine.root!.querySelector('#client-card text') as SVGGraphicsElement;
    engine.select([text]);
    const original = engine.exportSvg();
    engine.updateAttributes({ fill: '#ff0000' }, true);
    engine.updateAttributes({ fill: '#00ff00' }, true);
    expect(engine.past).toHaveLength(0);
    engine.commit();
    expect(engine.past).toHaveLength(1);
    engine.undo();
    expect(engine.exportSvg()).toBe(original);
    engine.updateAttributes({ fill: '#0000ff' }, true);
    engine.cancel();
    expect(engine.exportSvg()).toBe(original);
    expect(engine.past).toHaveLength(0);
  });
});
