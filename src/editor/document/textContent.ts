// SVG descriptions name the element; they are not rendered text or editable paragraphs.
export const isTextDescription = (el: Element) => ['title', 'desc'].includes(el.localName);

export function textChildren(el: Element) {
  return [...el.children].filter((child) => !isTextDescription(child));
}

export function textValue(el: Element): string {
  return [...el.childNodes]
    .map((node) =>
      node.nodeType === Node.ELEMENT_NODE
        ? isTextDescription(node as Element)
          ? ''
          : textValue(node as Element)
        : node.nodeType === Node.TEXT_NODE
          ? node.textContent || ''
          : '',
    )
    .join('');
}

export function replaceTextContent(el: Element, ...content: (Node | string)[]) {
  el.replaceChildren(...[...el.children].filter(isTextDescription), ...content);
}
