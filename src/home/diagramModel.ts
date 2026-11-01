export type HomeTheme = 'native' | 'vercel' | 'figma' | 'openai';
export type NodeId =
  'docs' | 'chunks' | 'embed' | 'index' | 'query' | 'retrieve' | 'context' | 'llm' | 'answer';
export type Point = { x: number; y: number };
export type DiagramVariant = 'editor' | 'hero' | 'skill';
export type DiagramEdits = {
  labels: Partial<Record<NodeId, string>>;
  colors: Partial<Record<NodeId, string>>;
  offsets: Partial<Record<NodeId, Point>>;
};
export const emptyEdits = (): DiagramEdits => ({ labels: {}, colors: {}, offsets: {} });
export const nodes: { id: NodeId; label: string; detail: string; x: number; y: number }[] = [
  { id: 'docs', label: 'Documents', detail: '文档与知识', x: 35, y: 55 },
  { id: 'chunks', label: 'Chunking', detail: '文本切分', x: 35, y: 180 },
  { id: 'embed', label: 'Embeddings', detail: '向量编码', x: 35, y: 305 },
  { id: 'index', label: 'Vector index', detail: '向量索引', x: 35, y: 430 },
  { id: 'query', label: 'Query', detail: '用户问题', x: 430, y: 55 },
  { id: 'retrieve', label: 'Retriever', detail: '检索相关内容', x: 430, y: 240 },
  { id: 'context', label: 'Context', detail: '上下文构建', x: 430, y: 430 },
  { id: 'llm', label: 'LLM', detail: '生成模型', x: 805, y: 190 },
  { id: 'answer', label: 'Answer', detail: '回答与引用', x: 805, y: 400 },
];
export const nodeWidth = 200,
  nodeHeight = 78;
export const edges: { from: NodeId; to: NodeId; vertical?: boolean }[] = [
  { from: 'docs', to: 'chunks', vertical: true },
  { from: 'chunks', to: 'embed', vertical: true },
  { from: 'embed', to: 'index', vertical: true },
  { from: 'index', to: 'retrieve' },
  { from: 'query', to: 'retrieve', vertical: true },
  { from: 'retrieve', to: 'context', vertical: true },
  { from: 'context', to: 'llm' },
  { from: 'llm', to: 'answer', vertical: true },
];
export const themes = {
  native: {
    name: '原生',
    ink: '#152032',
    line: '#68768c',
    accent: '#2855ee',
    paper: '#f6f7f2',
    surface: '#f3f6fd',
    radius: 7,
  },
  vercel: {
    name: 'Vercel',
    ink: '#f4f4f4',
    line: '#9c9c9c',
    accent: '#a9c8ff',
    paper: '#101112',
    surface: '#191b1e',
    radius: 0,
  },
  figma: {
    name: 'Figma',
    ink: '#191a21',
    line: '#34343b',
    accent: '#2855ee',
    paper: '#fbf7ef',
    surface: '#e1d4ff',
    radius: 12,
  },
  openai: {
    name: 'OpenAI',
    ink: '#4b232d',
    line: '#7e3e47',
    accent: '#8c2f35',
    paper: '#f9d9cd',
    surface: '#fff5ed',
    radius: 15,
  },
} as const;
export function nodePosition(id: NodeId, edits: DiagramEdits): Point {
  const node = nodes.find((n) => n.id === id)!;
  const offset = edits.offsets[id] || { x: 0, y: 0 };
  return { x: node.x + offset.x, y: node.y + offset.y };
}
export function diagramGeometry(id: NodeId, variant: DiagramVariant, edits: DiagramEdits) {
  const base = nodes.find((n) => n.id === id)!;
  const hero: Record<NodeId, [number, number, number, number]> = {
    docs: [55, 65, 180, 66],
    chunks: [55, 205, 180, 66],
    embed: [55, 345, 180, 66],
    index: [55, 485, 180, 66],
    query: [510, 80, 170, 68],
    retrieve: [455, 275, 225, 82],
    context: [455, 495, 210, 70],
    llm: [850, 215, 190, 132],
    answer: [850, 485, 190, 78],
  };
  const skill: Record<NodeId, [number, number, number, number]> = {
    docs: [300, 65, 170, 68],
    chunks: [300, 190, 170, 68],
    embed: [300, 315, 170, 68],
    index: [300, 440, 170, 68],
    query: [665, 80, 170, 68],
    retrieve: [630, 365, 200, 78],
    context: [865, 365, 170, 78],
    llm: [1065, 365, 155, 78],
    answer: [1250, 365, 170, 78],
  };
  const values =
    variant === 'hero'
      ? hero[id]
      : variant === 'skill'
        ? skill[id]
        : [base.x, base.y, nodeWidth, nodeHeight];
  const offset = edits.offsets[id] || { x: 0, y: 0 };
  return { x: values[0] + offset.x, y: values[1] + offset.y, width: values[2], height: values[3] };
}
export function nodeColor(theme: HomeTheme, id: NodeId) {
  if (theme === 'figma')
    return {
      docs: '#b9eecf',
      chunks: '#d6cbfc',
      embed: '#ffa5a3',
      index: '#b9eecf',
      query: '#d6cbfc',
      retrieve: '#fed954',
      context: '#b9eecf',
      llm: '#ffe2d4',
      answer: '#ffed9c',
    }[id];
  if (theme === 'native') return id === 'retrieve' || id === 'answer' ? '#2855ee' : '#f3f6fd';
  return theme === 'vercel' ? '#191b1e' : '#fff5ed';
}
export function serializeDiagram(svg: SVGSVGElement) {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.querySelectorAll('[data-demo-ui]').forEach((el) => el.remove());
  // The animation shell is homepage UI. Export actual shapes as direct node children,
  // matching the editor's connection-node contract without altering its engine.
  copy
    .querySelectorAll('[data-node] > .node-shell')
    .forEach((shell) => shell.replaceWith(...shell.childNodes));
  copy.querySelectorAll('*').forEach((el) => {
    ['class', 'style', 'tabindex', 'role', 'aria-label', 'aria-pressed', 'data-home-node'].forEach(
      (attr) => el.removeAttribute(attr),
    );
  });
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  copy.setAttribute('width', '1040');
  copy.setAttribute('height', '590');
  copy.removeAttribute('class');
  copy.removeAttribute('style');
  copy.removeAttribute('role');
  copy.setAttribute('aria-label', 'RAG architecture · JustSVG');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(copy);
}
