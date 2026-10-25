import paper from './assets/paper.svg?raw';
import swimlane from './assets/swimlane.svg?raw';
import circuit from './assets/circuit.svg?raw';
import bauhaus from './assets/bauhaus.svg?raw';
import notes from './assets/notes.svg?raw';
import metro from './assets/metro.svg?raw';
import rack from './assets/rack.svg?raw';
import deco from './assets/deco.svg?raw';
import pixel from './assets/pixel.svg?raw';
import minimal from './assets/minimal.svg?raw';
import handdrawn from './assets/handdrawn.svg?raw';
import paperPrompt from './prompts/paper.md?raw';
import swimlanePrompt from './prompts/swimlane.md?raw';
import circuitPrompt from './prompts/circuit.md?raw';
import bauhausPrompt from './prompts/bauhaus.md?raw';
import notesPrompt from './prompts/notes.md?raw';
import metroPrompt from './prompts/metro.md?raw';
import rackPrompt from './prompts/rack.md?raw';
import decoPrompt from './prompts/deco.md?raw';
import pixelPrompt from './prompts/pixel.md?raw';
import minimalPrompt from './prompts/minimal.md?raw';
import handdrawnPrompt from './prompts/handdrawn.md?raw';
import type { ExampleStyle, SvgExample } from './catalog';
const entries: (ExampleStyle & Pick<SvgExample, 'svg' | 'prompt'>)[] = [
  {
    id: 'paper',
    name: '黑白论文',
    summary: '学术插图 · 黑白细线',
    tags: ['科研配图', '论文插图'],
    palette: ['#ffffff', '#171717', '#525252'],
    svg: paper,
    prompt: paperPrompt,
  },
  {
    id: 'swimlane',
    name: '流程泳道',
    summary: '阶段泳道 · 横向分区',
    tags: ['流程说明', '业务架构'],
    palette: ['#edf3fa', '#edf6f2', '#245a94'],
    svg: swimlane,
    prompt: swimlanePrompt,
  },
  {
    id: 'circuit',
    name: '电路布线',
    summary: '切角模块 · 焊盘走线',
    tags: ['系统架构', '硬件表达'],
    palette: ['#102330', '#72d4d2', '#e4f5f9'],
    svg: circuit,
    prompt: circuitPrompt,
  },
  {
    id: 'bauhaus',
    name: '包豪斯几何',
    summary: '原色几何 · 平面构成',
    tags: ['概念说明', '信息图'],
    palette: ['#f7f2e5', '#c83d2b', '#e4bc38', '#275a9b'],
    svg: bauhaus,
    prompt: bauhausPrompt,
  },
  {
    id: 'notes',
    name: '便签工作坊',
    summary: '彩色便笺 · 折角分组',
    tags: ['工作坊', '头脑风暴'],
    palette: ['#fff0b7', '#e3f1de', '#fbe0d3', '#ece4f7'],
    svg: notes,
    prompt: notesPrompt,
  },
  {
    id: 'metro',
    name: '地铁线路',
    summary: '站点网络 · 双线路径',
    tags: ['流程导览', '知识路径'],
    palette: ['#fcfcfa', '#245ea8', '#287b65'],
    svg: metro,
    prompt: metroPrompt,
  },
  {
    id: 'rack',
    name: '服务器机架',
    summary: '模块面板 · 冷灰机箱',
    tags: ['运维说明', '基础设施'],
    palette: ['#edf1f4', '#315b7c', '#f8fafb'],
    svg: rack,
    prompt: rackPrompt,
  },
  {
    id: 'deco',
    name: '装饰艺术',
    summary: '黑金线饰 · 对称构图',
    tags: ['技术演示', '概念海报'],
    palette: ['#22272a', '#e2bd72', '#f5ecd4'],
    svg: deco,
    prompt: decoPrompt,
  },
  {
    id: 'pixel',
    name: '复古像素',
    summary: '台阶边框 · 方形标识',
    tags: ['开发者演示', '趣味科普'],
    palette: ['#20213c', '#90e3ad', '#edb468'],
    svg: pixel,
    prompt: pixelPrompt,
  },
  {
    id: 'minimal',
    name: '极简线性',
    summary: '无框节点 · 留白与细线',
    tags: ['文档配图', '极简说明'],
    palette: ['#ffffff', '#202c37', '#80909e'],
    svg: minimal,
    prompt: minimalPrompt,
  },
  {
    id: 'handdrawn',
    name: '手绘草图',
    summary: '不规则双线 · 轻彩手稿',
    tags: ['草图构思', '技术分享'],
    palette: ['#fffdf7', '#555c50', '#fbf0c9', '#e8f1de'],
    svg: handdrawn,
    prompt: handdrawnPrompt,
  },
];
export const moreStyles: ExampleStyle[] = entries.map(({ id, name, summary, tags, palette }) => ({
  id,
  name,
  summary,
  tags,
  palette,
}));
export const moreExamples: SvgExample[] = entries.map(({ id, svg, prompt }) => ({
  id: `${id}-rag`,
  style: id,
  name: 'RAG 检索增强生成架构',
  width: 1200,
  height: 800,
  svg,
  prompt,
}));
