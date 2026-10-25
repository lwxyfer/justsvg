import DOMPurify from 'dompurify';
import * as css from 'css-tree';
import { prepareMotionImport, refreshMotionStyles } from '../document/motion';

export const SVG_NS = 'http://www.w3.org/2000/svg';
export const MAX_BYTES = 5 * 1024 * 1024;
const MAX_NODES = 15000;
const blockedTags = new Set([
  'script',
  'foreignobject',
  'iframe',
  'object',
  'embed',
  'audio',
  'video',
  'a',
  'animate',
  'animatetransform',
  'animatemotion',
  'set',
  'discard',
  'mpath',
  'feimage',
]);
const styleProps = new Set(
  'fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset opacity color stop-color stop-opacity flood-color flood-opacity lighting-color font font-family font-size font-style font-weight font-variant font-stretch letter-spacing word-spacing text-anchor dominant-baseline alignment-baseline baseline-shift text-decoration white-space overflow x y width height cx cy r rx ry d transform transform-origin transform-box paint-order vector-effect visibility display clip-path clip-rule mask mask-type filter marker marker-start marker-mid marker-end shape-rendering text-rendering image-rendering color-interpolation color-interpolation-filters'.split(
    ' ',
  ),
);
const internal = (value: string) => /^#[^\s"'()<>\\/]+$/u.test(value);
const imageData = (value: string) =>
  /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=\s]+$/i.test(value) && value.length < MAX_BYTES;

/** Parse CSS rather than replacing XML or trying to match CSS grammar with regex. */
export function cleanCss(source: string, inline: boolean, warnings: Set<string>): string {
  if (source.includes('\\')) {
    warnings.add('含转义字符的 CSS 已移除，请使用普通属性值。');
    return '';
  }
  try {
    const ast = css.parse(source, {
      context: inline ? 'declarationList' : 'stylesheet',
      positions: false,
    });
    css.walk(ast, {
      visit: 'Atrule',
      enter(_node, item, list) {
        list.remove(item);
        warnings.add('已移除 CSS @规则（包括外部字体和导入）。');
      },
    });
    css.walk(ast, {
      visit: 'Declaration',
      enter(node, item, list) {
        let safe = styleProps.has(node.property.toLowerCase());
        if (node.property === 'transform')
          warnings.add(
            'CSS Transform 保留显示；带 CSS Transform 的节点仅支持样式编辑，可选择其外层分组进行变换。',
          );
        css.walk(node.value, (part) => {
          if (part.type === 'Url' && !internal(part.value)) safe = false;
          if (part.type === 'Raw') safe = false;
          if (
            part.type === 'Function' &&
            /^(expression|var|env|image|image-set|attr)$/i.test(part.name)
          )
            safe = false;
        });
        if (!safe) {
          list.remove(item);
          warnings.add('已移除不安全或不支持的 CSS 属性。');
        }
      },
    });
    return css.generate(ast);
  } catch {
    warnings.add('无法解析的 CSS 已移除。');
    return '';
  }
}

export interface SafeDocument {
  root: SVGSVGElement;
  warnings: string[];
}
export function needsImportReview(warnings: string[]) {
  return warnings.some((w) => /已移除|已限制|已阻止|清理器移除/.test(w));
}
export function sanitizeSvg(source: string): SafeDocument {
  if (new TextEncoder().encode(source).length > MAX_BYTES)
    throw new Error('SVG 超过 5 MB 限制，请先简化文件。');
  if (/<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error('不接受 DTD 或实体声明。');
  const xml = new DOMParser().parseFromString(source, 'image/svg+xml');
  if (xml.querySelector('parsererror') || xml.documentElement.localName !== 'svg')
    throw new Error(
      `SVG XML 无效：${xml.querySelector('parsererror')?.textContent?.trim().slice(0, 220) || '请粘贴完整且格式正确的 <svg> 文档。'}`,
    );
  if (!xml.documentElement.namespaceURI) xml.documentElement.setAttribute('xmlns', SVG_NS);
  else if (xml.documentElement.namespaceURI !== SVG_NS) throw new Error('SVG 命名空间无效。');
  const warnings = new Set<string>();
  prepareMotionImport(xml.documentElement, warnings);
  const viewBox = xml.documentElement.getAttribute('viewBox');
  if (viewBox) {
    const values = viewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (
      values.length !== 4 ||
      !values.every(Number.isFinite) ||
      values[2] <= 0 ||
      values[3] <= 0 ||
      values.some((v) => Math.abs(v) > 100000)
    )
      throw new Error('viewBox 必须包含 4 个有限数值，宽高大于 0，坐标与尺寸不超过 100,000。');
  } else {
    warnings.add('文档没有 viewBox：以显式宽高显示；百分比或缺失尺寸使用 800 × 600 工作视口。');
    for (const attr of ['width', 'height']) {
      const v = xml.documentElement.getAttribute(attr);
      if (
        v &&
        !v.endsWith('%') &&
        (!Number.isFinite(parseFloat(v)) || parseFloat(v) <= 0 || parseFloat(v) > 100000)
      )
        throw new Error('SVG 尺寸必须大于 0 且不超过 100,000。');
    }
  }
  const nodes = [xml.documentElement, ...xml.documentElement.querySelectorAll('*')];
  if (nodes.length > MAX_NODES) throw new Error('SVG 超过 15,000 个节点限制，请拆分后编辑。');
  for (const el of nodes) {
    let depth = 0;
    for (let p = el.parentElement; p; p = p.parentElement) depth++;
    if (depth > 80) throw new Error('SVG 嵌套超过 80 层限制。');
    const tag = el.localName.toLowerCase();
    if ((el.namespaceURI && el.namespaceURI !== SVG_NS) || blockedTags.has(tag)) {
      // Unwrap links so their visible children survive. All other blocked subtrees are removed.
      if (tag === 'a') el.replaceWith(...el.childNodes);
      else el.remove();
      warnings.add(`已限制 <${el.localName}>：可执行、外部资源或暂不支持的内容。`);
      continue;
    }
    if (tag === 'textpath') warnings.add('textPath 保留显示；仅支持整体变换，不支持修改文字。');
    if (tag === 'filter' || tag === 'mask')
      warnings.add('滤镜 / 蒙版保留原生渲染；不提供内部参数编辑。');
    for (const attr of [...el.attributes]) {
      const name = attr.localName.toLowerCase();
      const value = attr.value.trim();
      if (
        name.startsWith('on') ||
        name === 'base' ||
        (attr.namespaceURI &&
          ![
            'http://www.w3.org/1999/xlink',
            'http://www.w3.org/2000/xmlns/',
            'http://www.w3.org/XML/1998/namespace',
          ].includes(attr.namespaceURI))
      ) {
        el.removeAttributeNode(attr);
        warnings.add('已移除事件属性或不受支持的命名空间。');
        continue;
      }
      if (name === 'href' || name === 'src') {
        if (!internal(value) && !(tag === 'image' && imageData(value))) {
          el.removeAttributeNode(attr);
          warnings.add('已阻止外部资源及危险 URL，仅允许内部引用和嵌入 PNG/JPEG/WebP。');
        }
      } else if (name === 'style') el.setAttribute('style', cleanCss(value, true, warnings));
      else if (/url\s*\(/i.test(value) || /[\\]/.test(value)) {
        // Presentation attributes accept CSS values too. Reject malformed / external URL tokens.
        const cleaned = cleanCss(`${name}:${value}`, true, warnings);
        if (!cleaned || !styleProps.has(name)) el.removeAttributeNode(attr);
      }
    }
    if (tag === 'style') el.textContent = cleanCss(el.textContent || '', false, warnings);
  }
  const precleaned = new XMLSerializer().serializeToString(xml.documentElement);
  const purified = DOMPurify.sanitize(precleaned, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['style', 'textPath', 'use'],
    ADD_ATTR: ['xml:space'],
    FORBID_TAGS: [...blockedTags],
    RETURN_DOM_FRAGMENT: true,
    RETURN_TRUSTED_TYPE: false,
  });
  if (
    DOMPurify.removed.some(
      (item) =>
        'attribute' in item ||
        ('element' in item && item.element?.nodeName.toLowerCase() !== 'body'),
    )
  )
    warnings.add('安全清理器移除了额外的不受支持内容。');
  // Serialize the sanitized DOM as XML: HTML serializers can emit literal '<' in attributes.
  const result = new DOMParser().parseFromString(
    new XMLSerializer().serializeToString(purified),
    'image/svg+xml',
  );
  if (result.querySelector('parsererror') || result.documentElement.localName !== 'svg')
    throw new Error('安全清理后没有有效 SVG。');
  const root = document.importNode(result.documentElement, true) as unknown as SVGSVGElement;
  root.setAttribute('xmlns', SVG_NS);
  // Cyclic <use> expansion can lock up a renderer. Reject cycles before attachment.
  const ids = new Map<string, Element>();
  for (const el of [root, ...root.querySelectorAll('[id]')]) {
    if (!el.id) continue;
    if (ids.has(el.id))
      throw new Error(`元素 ID 重复：${el.id}。请先修正引用标识，避免编辑错误的资源。`);
    ids.set(el.id, el);
  }
  const missing = new Set<string>();
  const checkRef = (value: string, el: Element) => {
    if (internal(value) && !ids.has(value.slice(1)) && missing.size < 40)
      missing.add(
        `<${el.localName}>${el.id ? ` #${el.id}` : ''} 引用 ${value}，未找到目标；已保留原引用，请检查源码。`,
      );
  };
  for (const el of [root, ...root.querySelectorAll('*')]) {
    for (const attr of [...el.attributes]) {
      if (attr.localName === 'href') checkRef(attr.value, el);
      else if (attr.localName === 'style' || /url\s*\(/i.test(attr.value)) {
        const ast = css.parse(attr.value, {
          context: attr.localName === 'style' ? 'declarationList' : 'value',
        });
        css.walk(ast, {
          visit: 'Url',
          enter(node) {
            checkRef(node.value, el);
          },
        });
      }
    }
    if (el.localName === 'style' && el.textContent) {
      const ast = css.parse(el.textContent);
      css.walk(ast, {
        visit: 'Url',
        enter(node) {
          checkRef(node.value, el);
        },
      });
    }
  }
  for (const warning of missing) warnings.add(warning);
  let expansions = 0;
  const visit = (el: Element, stack: Set<Element>, depth: number) => {
    if (++expansions > 20000) throw new Error('<use> 引用展开量超出安全限制。');
    if (depth > 40 || stack.has(el)) throw new Error('检测到循环或过深的 <use> 引用。');
    const next = new Set(stack).add(el);
    for (const use of el.localName === 'use' ? [el] : [...el.querySelectorAll('use')]) {
      const ref =
        use.getAttribute('href') || use.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
      const target = ref?.startsWith('#') ? ids.get(ref.slice(1)) : undefined;
      if (target) visit(target, next, depth + 1);
    }
  };
  for (const use of root.querySelectorAll('use')) visit(use, new Set(), 0);
  refreshMotionStyles(root);
  return { root, warnings: [...warnings] };
}
