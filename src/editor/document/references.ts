import * as css from 'css-tree';

/** Update only parsed SVG/CSS reference nodes; a color such as #fff is never an ID selector. */
export function rewriteReferences(root: Element, remap: Map<string, string>, scope: string) {
  for (const el of [root, ...root.querySelectorAll('*')]) {
    if (el.localName === 'style' && el.hasAttribute('data-sf-motion-style')) {
      el.remove();
      continue;
    }
    for (const attr of [...el.attributes]) {
      let value = attr.value;
      if (
        ['data-sf-start-node', 'data-sf-end-node', 'data-sf-label-for'].includes(attr.name) &&
        value.startsWith('#')
      ) {
        const target = remap.get(value.slice(1));
        if (target) value = `#${target}`;
        else {
          el.removeAttribute(attr.name);
          if (attr.name !== 'data-sf-label-for')
            el.removeAttribute(attr.name.replace('-node', '-anchor'));
          continue;
        }
      }
      if (attr.localName === 'href' && value.startsWith('#') && remap.has(value.slice(1)))
        value = `#${remap.get(value.slice(1))}`;
      if (attr.localName === 'style') {
        const ast = css.parse(value, { context: 'declarationList' });
        rewriteUrls(ast, remap);
        value = css.generate(ast);
      } else if (value.includes('url(')) {
        const ast = css.parse(value, { context: 'value' });
        rewriteUrls(ast, remap);
        value = css.generate(ast);
      }
      if (value !== attr.value) el.setAttributeNS(attr.namespaceURI, attr.name, value);
    }
    if (el.localName === 'style' && el.textContent) {
      const ast = css.parse(el.textContent);
      rewriteUrls(ast, remap);
      css.walk(ast, {
        visit: 'IdSelector',
        enter(node) {
          if (remap.has(node.name)) node.name = remap.get(node.name)!;
        },
      });
      css.walk(ast, {
        visit: 'Rule',
        enter(node) {
          if (node.prelude?.type === 'SelectorList') {
            const parsed = css.parse(
              node.prelude.children
                .toArray()
                .map((s) => `#${scope} ${css.generate(s)}`)
                .join(','),
              { context: 'selectorList' },
            );
            if (parsed.type === 'SelectorList') node.prelude = parsed;
          }
        },
      });
      el.textContent = css.generate(ast);
    }
  }
}
function rewriteUrls(ast: css.CssNode, remap: Map<string, string>) {
  css.walk(ast, {
    visit: 'Url',
    enter(node) {
      if (node.value.startsWith('#') && remap.has(node.value.slice(1)))
        node.value = `#${remap.get(node.value.slice(1))}`;
    },
  });
}
