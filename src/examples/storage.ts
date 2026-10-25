import { sanitizeSvg, needsImportReview } from '../editor/security/sanitize';
export const exampleStorageKey = 'svg-finisher.examples.v1';
export interface ExampleVersion {
  svg: string;
  prompt: string;
  savedAt: number;
}
export function validateExample(svg: string, prompt: string): ExampleVersion {
  if (new TextEncoder().encode(svg).length > 500_000) throw new Error('示例 SVG 不能超过 500 KB。');
  if (!prompt.trim() || prompt.length > 60_000)
    throw new Error('Prompt 不能为空，且不能超过 60,000 个字符。');
  const safe = sanitizeSvg(svg);
  if (needsImportReview(safe.warnings))
    throw new Error(`此 SVG 需要清理，请先修正源码：${safe.warnings.join(' ')}`);
  return { svg: new XMLSerializer().serializeToString(safe.root), prompt, savedAt: Date.now() };
}
export function loadExampleVersions(): Record<string, ExampleVersion> {
  const raw = localStorage.getItem(exampleStorageKey);
  if (!raw) return {};
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('本地示例版本格式无效，原记录已保留。');
  const versions: Record<string, ExampleVersion> = Object.create(null);
  for (const [id, item] of Object.entries(value)) {
    if (!item || typeof item !== 'object') throw new Error('本地示例版本损坏，原记录已保留。');
    const v = item as Record<string, unknown>;
    if (
      typeof v.svg !== 'string' ||
      typeof v.prompt !== 'string' ||
      typeof v.savedAt !== 'number' ||
      !Number.isFinite(v.savedAt)
    )
      throw new Error('本地示例版本损坏，原记录已保留。');
    versions[id] = { ...validateExample(v.svg, v.prompt), savedAt: v.savedAt };
  }
  return versions;
}
export function saveExampleVersion(id: string, version: ExampleVersion | null) {
  const current = loadExampleVersions();
  if (version) current[id] = version;
  else delete current[id];
  // A failed write must leave the last valid local version untouched.
  localStorage.setItem(exampleStorageKey, JSON.stringify(current));
}
