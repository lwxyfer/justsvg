import reference0 from './assets/base-reference-dense-platform.svg?raw';
import referencePrompt0 from './prompts/base-reference-dense-platform.md?raw';
import reference1 from './assets/base-reference-layered-platform.svg?raw';
import referencePrompt1 from './prompts/base-reference-layered-platform.md?raw';
import reference2 from './assets/base-reference-release-flow.svg?raw';
import referencePrompt2 from './prompts/base-reference-release-flow.md?raw';
import reference3 from './assets/base-reference-request-observability.svg?raw';
import referencePrompt3 from './prompts/base-reference-request-observability.md?raw';
import standard0 from './assets/base-dense-platform.svg?raw';
import standardPrompt0 from './prompts/base-dense-platform.md?raw';
import standard1 from './assets/base-layered-platform.svg?raw';
import standardPrompt1 from './prompts/base-layered-platform.md?raw';
import standard2 from './assets/base-release-flow.svg?raw';
import standardPrompt2 from './prompts/base-release-flow.md?raw';
import standard3 from './assets/base-request-observability.svg?raw';
import standardPrompt3 from './prompts/base-request-observability.md?raw';
import wire0 from './assets/base-wire-dense-platform.svg?raw';
import wirePrompt0 from './prompts/base-wire-dense-platform.md?raw';
import wire1 from './assets/base-wire-layered-platform.svg?raw';
import wirePrompt1 from './prompts/base-wire-layered-platform.md?raw';
import wire2 from './assets/base-wire-release-flow.svg?raw';
import wirePrompt2 from './prompts/base-wire-release-flow.md?raw';
import wire3 from './assets/base-wire-request-observability.svg?raw';
import wirePrompt3 from './prompts/base-wire-request-observability.md?raw';
import zone0 from './assets/base-zone-dense-platform.svg?raw';
import zonePrompt0 from './prompts/base-zone-dense-platform.md?raw';
import zone1 from './assets/base-zone-layered-platform.svg?raw';
import zonePrompt1 from './prompts/base-zone-layered-platform.md?raw';
import zone2 from './assets/base-zone-release-flow.svg?raw';
import zonePrompt2 from './prompts/base-zone-release-flow.md?raw';
import zone3 from './assets/base-zone-request-observability.svg?raw';
import zonePrompt3 from './prompts/base-zone-request-observability.md?raw';
import night0 from './assets/base-night-dense-platform.svg?raw';
import nightPrompt0 from './prompts/base-night-dense-platform.md?raw';
import night1 from './assets/base-night-layered-platform.svg?raw';
import nightPrompt1 from './prompts/base-night-layered-platform.md?raw';
import night2 from './assets/base-night-release-flow.svg?raw';
import nightPrompt2 from './prompts/base-night-release-flow.md?raw';
import night3 from './assets/base-night-request-observability.svg?raw';
import nightPrompt3 from './prompts/base-night-request-observability.md?raw';
import type { ExampleStyle, SvgExample } from './catalog';

export const baseVariationStyles: ExampleStyle[] = [
  {
    id: 'base-reference',
    name: '基础·技术文档',
    summary: '居中黑字 · 彩色描边与虚线边界',
    tags: ['参考复刻', '架构图', '流程图', '拓扑图'],
    palette: ['#f0f1f3', '#edeafd', '#fbead0', '#d2f5ee', '#fde8e5'],
    featured: true,
  },
  {
    id: 'base-wire',
    name: '基础·黑白线框',
    summary: '方角白底 · 石墨轮廓与线型',
    tags: ['基础变体', '架构图', '流程图', '信息图'],
    palette: ['#ffffff', '#182331', '#657181'],
  },
  {
    id: 'base-zone',
    name: '基础·分区白卡',
    summary: '彩色分区 · 白色圆角节点',
    tags: ['基础变体', '架构图', '流程图', '信息图'],
    palette: ['#e5efff', '#eee8fb', '#def3e8', '#ffffff'],
  },
  {
    id: 'base-night',
    name: '基础·深色工程',
    summary: '深色画布 · 实底节点与亮线',
    tags: ['基础变体', '架构图', '流程图', '信息图'],
    palette: ['#0e1728', '#192d48', '#d8cbff', '#77d5b0'],
  },
];

const standardContent = [
  {
    id: 'base-dense-platform',
    sourceId: 'base-dense-platform',
    style: 'base',
    name: '多租户 SaaS 平台 · 高信息密度架构',
    width: 1600,
    height: 1100,
    svg: standard0,
    prompt: standardPrompt0,
  },
  {
    id: 'base-layered-platform',
    sourceId: 'base-layered-platform',
    style: 'base',
    name: '三层业务系统 · 基础架构',
    width: 1200,
    height: 800,
    svg: standard1,
    prompt: standardPrompt1,
  },
  {
    id: 'base-release-flow',
    sourceId: 'base-release-flow',
    style: 'base',
    name: '发布交付流程 · 含失败回路',
    width: 1400,
    height: 900,
    svg: standard2,
    prompt: standardPrompt2,
  },
  {
    id: 'base-request-observability',
    sourceId: 'base-request-observability',
    style: 'base',
    name: '请求生命周期 · 可观测性信息图',
    width: 1400,
    height: 900,
    svg: standard3,
    prompt: standardPrompt3,
  },
];

export const baseVariationExamples: SvgExample[] = [
  ...standardContent,
  ...standardContent.map((content, i) => ({
    ...content,
    id: content.id.replace('base-', 'base-wire-'),
    style: 'base-wire',
    svg: [wire0, wire1, wire2, wire3][i],
    prompt: [wirePrompt0, wirePrompt1, wirePrompt2, wirePrompt3][i],
  })),
  ...standardContent.map((content, i) => ({
    ...content,
    id: content.id.replace('base-', 'base-zone-'),
    style: 'base-zone',
    svg: [zone0, zone1, zone2, zone3][i],
    prompt: [zonePrompt0, zonePrompt1, zonePrompt2, zonePrompt3][i],
  })),
  ...standardContent.map((content, i) => ({
    ...content,
    id: content.id.replace('base-', 'base-night-'),
    style: 'base-night',
    svg: [night0, night1, night2, night3][i],
    prompt: [nightPrompt0, nightPrompt1, nightPrompt2, nightPrompt3][i],
  })),
  ...standardContent.map((content, i) => ({
    ...content,
    id: content.id.replace('base-', 'base-reference-'),
    style: 'base-reference',
    svg: [reference0, reference1, reference2, reference3][i],
    prompt: [referencePrompt0, referencePrompt1, referencePrompt2, referencePrompt3][i],
  })),
];
