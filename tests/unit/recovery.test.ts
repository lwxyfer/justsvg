import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { engine } from '../../src/editor/document/engine';
import {
  currentRecord,
  preservePrevious,
  previousRecovery,
  readRecovery,
  readWorkspaceRecovery,
  recoveryKey,
  saveRecovery,
} from '../../src/app/recovery';
import { importDocument } from '../../src/app/actions';
import { fixtures } from '../../src/fixtures';
import { useUI } from '../../src/store/ui';
import { documents } from '../../src/app/documents';
beforeEach(() => {
  localStorage.clear();
  documents.items = [];
  documents.activeId = '';
  engine.importSvg(fixtures.architecture);
  useUI.getState().set({ pendingImport: null });
});
afterEach(() => vi.restoreAllMocks());
describe('local document protection', () => {
  it('reads legacy records conservatively and rejects malformed or unknown versions', () => {
    localStorage.setItem(
      recoveryKey,
      JSON.stringify({ xml: fixtures.architecture, name: 'old.svg' }),
    );
    expect(readRecovery()).toMatchObject({
      version: 1,
      name: 'old.svg',
      unexported: true,
      savedAt: 0,
    });
    for (const raw of [
      '{broken',
      'null',
      JSON.stringify({ version: 9, xml: '', name: 'future' }),
    ]) {
      localStorage.setItem(recoveryKey, raw);
      expect(() => readRecovery()).toThrow();
    }
  });
  it('persists revision status and preserves the previous document before replacing it', () => {
    engine.transaction('change', () => engine.root!.setAttribute('opacity', '.5'));
    const edited = engine.exportSvg();
    saveRecovery();
    expect(readRecovery()).toMatchObject({ xml: edited, unexported: true });
    preservePrevious();
    engine.importSvg(fixtures.flowchart);
    expect(previousRecovery()).toMatchObject({ xml: edited, unexported: true });
    engine.markRecovered(true);
    expect(engine.dirty).toBe(true);
    engine.markExported();
    expect(currentRecord().unexported).toBe(false);
  });
  it('opens another tab without replacing unsaved work when the legacy backup fails', () => {
    engine.transaction('change', () => engine.root!.setAttribute('opacity', '.4'));
    const original = engine.exportSvg();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    expect(importDocument(fixtures.flowchart)).toBe(true);
    expect(documents.items).toHaveLength(2);
    documents.activate(documents.items[0].id);
    expect(engine.exportSvg()).toBe(original);
  });
  it('failed local writes leave the last valid recovery record intact', () => {
    saveRecovery();
    const original = localStorage.getItem(recoveryKey);
    engine.transaction('change', () => engine.root!.setAttribute('opacity', '.4'));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    expect(saveRecovery).toThrow();
    expect(localStorage.getItem(recoveryKey)).toBe(original);
  });
  it('reviews destructive cleaning before the working document is changed', () => {
    const original = engine.exportSvg();
    expect(importDocument(fixtures.security)).toBe(false);
    expect(engine.exportSvg()).toBe(original);
    expect(useUI.getState().pendingImport?.warnings.length).toBeGreaterThan(0);
    expect(() => importDocument('<svg><broken></svg>')).toThrow();
    expect(engine.exportSvg()).toBe(original);
  });
  it('migrates a legacy single document to one atomic workspace record', () => {
    localStorage.setItem(
      recoveryKey,
      JSON.stringify({
        version: 1,
        xml: fixtures.architecture,
        name: 'legacy.svg',
        unexported: true,
      }),
    );
    expect(readWorkspaceRecovery()).toBeNull();
    const legacy = readRecovery()!;
    engine.importSvg(legacy.xml, legacy.name);
    engine.markRecovered(legacy.unexported);
    saveRecovery();
    expect(readWorkspaceRecovery()?.documents).toHaveLength(1);
    expect(readRecovery()).toMatchObject({ name: 'legacy.svg', unexported: true });
    expect(JSON.parse(localStorage.getItem(recoveryKey)!).version).toBe(2);
  });
  it('saves every tab and the active view, including inactive unexported work', () => {
    engine.transaction('A', () => engine.root!.setAttribute('opacity', '.5'));
    documents.ensure();
    const a = documents.activeId;
    documents.open(fixtures.flowchart, 'B.svg');
    useUI.getState().set({ zoom: 0.5, pan: { x: -9, y: 17 } });
    saveRecovery();
    const saved = readWorkspaceRecovery()!;
    expect(saved.documents).toHaveLength(2);
    expect(saved.activeId).toBe(documents.activeId);
    expect(saved.documents.find((d) => d.id === a)).toMatchObject({ unexported: true });
    expect(saved.documents[0].xml).toContain('opacity=".5"');
    expect(saved.documents[1].view).toMatchObject({ zoom: 0.5, pan: { x: -9, y: 17 } });
    expect(readRecovery()).toMatchObject({ name: 'B.svg', unexported: false });
  });
  it('rejects duplicate IDs, invalid active tabs and unsafe viewport values', () => {
    documents.ensure();
    saveRecovery();
    const saved = readWorkspaceRecovery()!;
    for (const invalid of [
      { ...saved, activeId: 'missing' },
      { ...saved, documents: [saved.documents[0], saved.documents[0]] },
      {
        ...saved,
        documents: [
          { ...saved.documents[0], view: { zoom: -1, pan: { x: 0, y: 0 }, aspectLocked: false } },
        ],
      },
      { ...saved, documents: [{ ...saved.documents[0], unexported: 'false' }] },
    ]) {
      localStorage.setItem(recoveryKey, JSON.stringify(invalid));
      expect(readWorkspaceRecovery).toThrow();
    }
  });
});
