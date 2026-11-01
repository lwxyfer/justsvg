import { beforeEach, describe, expect, it } from 'vitest';
import { DocumentWorkspace, MAX_DOCUMENTS } from '../../src/app/documents';
import { engine } from '../../src/editor/document/engine';
import { fixtures } from '../../src/fixtures';
import { useUI } from '../../src/store/ui';
let workspace: DocumentWorkspace;
beforeEach(() => {
  engine.importSvg(fixtures.architecture, 'architecture.svg');
  useUI.getState().set({ zoom: 1, pan: { x: 60, y: 60 }, aspectLocked: false });
  workspace = new DocumentWorkspace();
  workspace.ensure();
});
describe('independent SVG document sessions', () => {
  it('keeps native DOM identity, selection, group scope, locks, dirty baseline and history per tab', () => {
    const a = workspace.activeId,
      root = engine.root!;
    const card = root.querySelector('#client-card') as SVGGraphicsElement;
    const other = root.querySelector('#model-card') as SVGGraphicsElement;
    engine.scope = card;
    engine.select([card]);
    engine.lock(other);
    const key = engine.key(card);
    engine.updateAttributes({ opacity: '.7' });
    const edited = engine.exportSvg();
    const b = workspace.open(fixtures.flowchart, 'flowchart.svg');
    expect(engine.past).toHaveLength(0);
    expect(engine.dirty).toBe(false);
    engine.transaction('change B', () => engine.root!.setAttribute('opacity', '.3'));
    workspace.activate(a);
    expect(engine.root).toBe(root);
    expect(engine.selection).toEqual([card]);
    expect(engine.scope).toBe(card);
    expect(engine.key(card)).toBe(key);
    expect(engine.locked(other)).toBe(true);
    expect(engine.exportSvg()).toBe(edited);
    expect(engine.past).toHaveLength(1);
    engine.undo();
    expect(engine.dirty).toBe(false);
    workspace.activate(b);
    expect(engine.root!.getAttribute('opacity')).toBe('.3');
    expect(engine.past).toHaveLength(1);
    engine.undo();
    expect(engine.dirty).toBe(false);
    workspace.activate(a);
    expect(engine.future).toHaveLength(1);
    engine.redo();
    expect(engine.exportSvg()).toBe(edited);
  });
  it('retains zoom, pan and aspect lock separately, without changing shared preferences', () => {
    const a = workspace.activeId;
    useUI.getState().set({ zoom: 1.7, pan: { x: -31, y: 48 }, aspectLocked: true, snap: false });
    const b = workspace.create();
    useUI.getState().set({ zoom: 0.4, pan: { x: 2, y: 9 }, aspectLocked: false });
    workspace.activate(a);
    expect(useUI.getState()).toMatchObject({
      zoom: 1.7,
      pan: { x: -31, y: 48 },
      aspectLocked: true,
      snap: false,
    });
    workspace.activate(b);
    expect(useUI.getState()).toMatchObject({ zoom: 0.4, pan: { x: 2, y: 9 }, aspectLocked: false });
  });
  it('closes inactive tabs without changing the current session and protects unsaved tabs', () => {
    const a = workspace.activeId;
    const b = workspace.create();
    engine.transaction('unsaved', () => engine.root!.setAttribute('opacity', '.5'));
    expect(() => workspace.close(b)).toThrow(/未导出/);
    workspace.close(a);
    expect(workspace.activeId).toBe(b);
    expect(engine.dirty).toBe(true);
    workspace.close(b, true);
    expect(workspace.items).toHaveLength(1);
    expect(workspace.activeId).not.toBe(b);
    expect(engine.name).toBe('untitled');
    expect(engine.dirty).toBe(false);
    expect(engine.past).toHaveLength(0);
  });
  it('validates all incoming and recovered tabs before changing the workspace', () => {
    const original = engine.root,
      a = workspace.activeId;
    expect(() => workspace.open('<svg><broken></svg>', 'bad.svg')).toThrow();
    expect(workspace.items).toHaveLength(1);
    const saved = workspace.savedDocuments();
    expect(() =>
      workspace.restore([...saved, { ...saved[0], id: 'bad', xml: '<svg><broken></svg>' }], a),
    ).toThrow();
    expect(engine.root).toBe(original);
    expect(workspace.activeId).toBe(a);
  });
  it('commits an in-progress operation to its original tab exactly once before switching', () => {
    const a = workspace.activeId;
    engine.begin('preview');
    engine.root!.setAttribute('opacity', '.6');
    workspace.create();
    workspace.activate(a);
    expect(engine.past).toHaveLength(1);
    engine.undo();
    expect(engine.root!.hasAttribute('opacity')).toBe(false);
  });
  it('restores all drawings and active view with conservative dirty state; reload starts fresh history', () => {
    const a = workspace.activeId;
    engine.transaction('edit', () => engine.root!.setAttribute('opacity', '.5'));
    workspace.create();
    useUI.getState().set({ zoom: 0.7, pan: { x: 12, y: -90 } });
    const saved = workspace.savedDocuments(),
      active = workspace.activeId;
    workspace.restore(saved, active);
    expect(workspace.activeId).toBe(active);
    expect(useUI.getState().zoom).toBe(0.7);
    workspace.activate(a);
    expect(engine.dirty).toBe(true);
    expect(engine.root!.getAttribute('opacity')).toBe('.5');
    expect(engine.past).toHaveLength(0);
  });
  it('bounds the number of live documents without replacing the active one', () => {
    while (workspace.items.length < MAX_DOCUMENTS) workspace.create();
    const active = workspace.activeId,
      root = engine.root;
    expect(() => workspace.create()).toThrow(/最多同时打开/);
    expect(workspace.activeId).toBe(active);
    expect(engine.root).toBe(root);
  });
});
