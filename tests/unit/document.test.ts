import { beforeEach, describe, it, expect } from 'vitest';
import { DocumentEngine } from '../../src/editor/document/engine';
import { fixtures } from '../../src/fixtures';
import { textValue } from '../../src/editor/document/textContent';
let engine: DocumentEngine;
beforeEach(() => {
  engine = new DocumentEngine();
  engine.importSvg(fixtures.architecture);
});
describe('document operations and transactions', () => {
  it('edits restored text with title/desc without including or losing the descriptions', () => {
    engine.importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><text x="20" y="30"><title>旧标签名称</title><desc>说明</desc>文字标签</text></svg>',
    );
    let el = engine.root!.querySelector('text') as SVGGraphicsElement;
    const original = engine.exportSvg();
    expect(engine.textStructure(el).editable).toBe(true);
    expect(textValue(el)).toBe('文字标签');
    expect(engine.exportSvg()).toBe(original);
    engine.updateText(el, ['修改成功']);
    expect(textValue(el)).toBe('修改成功');
    expect(el.querySelector('title')?.textContent).toBe('旧标签名称');
    expect(el.querySelector('desc')?.textContent).toBe('说明');
    engine.undo();
    expect(engine.exportSvg()).toBe(original);
    engine.redo();
    el = engine.root!.querySelector('text') as SVGGraphicsElement;
    engine.multiline(el, '第一行\n第二行', 32);
    expect(engine.textStructure(el).parts.map(textValue)).toEqual(['第一行', '第二行']);
    expect(el.querySelector('title')?.textContent).toBe('旧标签名称');
    expect(el.querySelector('desc')?.textContent).toBe('说明');
  });
  it('edits positioned spans with descriptions while retaining positions and styles', () => {
    engine.importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><text><title>标题</title><desc>说明</desc><tspan x="20" y="30" fill="red">第一行</tspan><tspan x="20" dy="32">第二行</tspan></text></svg>',
    );
    const el = engine.root!.querySelector('text') as SVGGraphicsElement;
    expect(engine.textStructure(el).parts.map(textValue)).toEqual(['第一行', '第二行']);
    engine.updateText(el, ['新第一行', '新第二行']);
    expect(el.querySelector('tspan')?.getAttribute('fill')).toBe('red');
    expect(el.querySelector('tspan')?.getAttribute('x')).toBe('20');
    expect(el.querySelector('title')?.textContent).toBe('标题');
    expect(el.querySelector('desc')?.textContent).toBe('说明');
  });
  it.each([
    '<title>标题</title><textPath href="#path">曲线文字</textPath>',
    '<title>标题</title><tspan><tspan>嵌套文字</tspan></tspan>',
    '<desc>说明</desc>混合<tspan>样式</tspan>',
  ])('still rejects unsafe text structures with descriptions: %s', (content) => {
    engine.importSvg(`<svg xmlns="http://www.w3.org/2000/svg"><text>${content}</text></svg>`);
    expect(
      engine.textStructure(engine.root!.querySelector('text') as SVGGraphicsElement).editable,
    ).toBe(false);
  });
  it('changes one tspan without changing siblings or positions', () => {
    const el = engine.root!.querySelector('#client-card text:last-child') as SVGGraphicsElement;
    const spans = [...el.children],
      attrs = spans.map((e) => e.getAttribute('x'));
    engine.updateText(el, ['Refined', 'Prompts, files & live previews']);
    expect(el.children).toHaveLength(2);
    expect(el.children[1].textContent).toBe('Prompts, files & live previews');
    expect([...el.children].map((e) => e.getAttribute('x'))).toEqual(attrs);
    engine.undo();
    expect(engine.root!.querySelector('#client-card tspan')?.textContent).toBe('Web interface');
    engine.redo();
    expect(engine.root!.querySelector('#client-card tspan')?.textContent).toBe('Refined');
  });
  it('rejects complex mixed text editing', () => {
    engine.importSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><text>Hello <tspan x="20">world</tspan></text></svg>',
    );
    const el = engine.root!.querySelector('text') as SVGGraphicsElement;
    expect(() => engine.updateText(el, ['lost'])).toThrow(/混合/);
    expect(el.textContent).toBe('Hello world');
  });
  it('records one history item per transaction and supports rollback', () => {
    const rect = engine.root!.querySelector('#client-card rect') as SVGGraphicsElement;
    engine.begin('drag');
    for (let i = 0; i < 20; i++) rect.setAttribute('x', String(i));
    engine.commit();
    expect(engine.past).toHaveLength(1);
    engine.undo();
    expect(engine.root!.querySelector('#client-card rect')?.hasAttribute('x')).toBe(false);
    engine.begin('failed');
    engine.root!.setAttribute('opacity', '.1');
    engine.cancel();
    expect(engine.root!.hasAttribute('opacity')).toBe(false);
  });
  it('does not record empty transactions and limits history', () => {
    engine.begin('no-op');
    engine.commit();
    expect(engine.past).toHaveLength(0);
    for (let i = 0; i < 95; i++)
      engine.transaction('change', () => engine.root!.setAttribute('opacity', String(i)));
    expect(engine.past).toHaveLength(80);
    engine.undo();
    expect(engine.future).toHaveLength(1);
    engine.transaction('new branch', () => engine.root!.setAttribute('opacity', '.2'));
    expect(engine.future).toHaveLength(0);
  });
  it('rejects unrelated or unsafe attribute updates', () => {
    const rect = engine.root!.querySelector('#client-card rect') as SVGGraphicsElement;
    engine.select([rect]);
    expect(() => engine.updateAttributes({ onload: 'alert(1)' })).toThrow();
    expect(() => engine.updateAttributes({ fill: 'url(https://evil.test/a)' })).toThrow();
    engine.updateAttributes({ fill: '#123456' });
    expect(rect.getAttribute('fill')).toBe('#123456');
    expect(engine.root!.querySelector('#model-card rect')?.getAttribute('fill')).toBe('#fff');
  });
  it('normalizes unitless font sizes for CSS overrides and supports history', () => {
    const text = engine.root!.querySelector('#client-card text') as SVGGraphicsElement;
    const sibling = engine.root!.querySelector('#model-card text')!;
    const siblingXml = new XMLSerializer().serializeToString(sibling);
    engine.select([text]);
    engine.updateAttributes({ 'font-size': ' 24.5 ' });
    expect(text.getAttribute('font-size')).toBe('24.5px');
    expect(text.style.getPropertyValue('font-size')).toBe('24.5px');
    expect(text.style.getPropertyPriority('font-size')).toBe('important');
    expect(new XMLSerializer().serializeToString(sibling)).toBe(siblingXml);
    expect(engine.past).toHaveLength(1);
    engine.undo();
    expect(engine.root!.querySelector('#client-card text')?.getAttribute('font-size')).toBe('16');
    engine.redo();
    expect(engine.root!.querySelector('#client-card text')?.getAttribute('font-size')).toBe(
      '24.5px',
    );
  });
  it.each(['0', '-5', '1e999'])(
    'rejects invalid numeric font size %s before modifying the document',
    (size) => {
      engine.select([engine.root!.querySelector('#client-card text') as SVGGraphicsElement]);
      const original = engine.exportSvg();
      expect(() => engine.updateAttributes({ 'font-size': size })).toThrow('字号必须大于 0');
      expect(engine.exportSvg()).toBe(original);
      expect(engine.past).toHaveLength(0);
    },
  );
  it('selects the whole group, supports deep selection and honors ancestor locks', () => {
    const text = engine.root!.querySelector('#client-card text')!;
    const g = engine.root!.querySelector('#client-card') as SVGGraphicsElement;
    expect(engine.hit(text)).toBe(g);
    expect(engine.hit(text, true)).toBe(text);
    engine.lock(g);
    engine.select([text as SVGGraphicsElement]);
    expect(engine.selection).toHaveLength(0);
  });
  it('keeps session locks and stable editor keys across undo and redo', () => {
    const el = engine.root!.querySelector('#client-card') as SVGGraphicsElement;
    const key = engine.key(el);
    engine.lock(el);
    engine.transaction('change', () => engine.root!.setAttribute('opacity', '.8'));
    engine.undo();
    const restored = engine.root!.querySelector('#client-card')!;
    expect(engine.key(restored)).toBe(key);
    expect(engine.isLocked(restored)).toBe(true);
    engine.redo();
    expect(engine.isLocked(engine.root!.querySelector('#client-card')!)).toBe(true);
  });
  it('exports only document content and preserves viewBox', () => {
    expect(engine.exportSvg()).not.toContain('selection-box');
    expect(engine.viewBox()).toEqual({ x: 0, y: 0, width: 960, height: 640 });
  });
});
