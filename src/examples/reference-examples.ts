import overview from './assets/reference-sandbox-overview.svg?raw';
import linux from './assets/reference-linux-topology.svg?raw';
import overviewPrompt from './prompts/reference-sandbox-overview.md?raw';
import linuxPrompt from './prompts/reference-linux-topology.md?raw';
import type { SvgExample } from './catalog';

export const referenceExamples: SvgExample[] = [
  {
    id: 'reference-sandbox-overview',
    style: 'base-reference',
    name: '参考复刻 · sandbox-runtime 总体分层架构',
    width: 1648,
    height: 988,
    svg: overview,
    prompt: overviewPrompt,
  },
  {
    id: 'reference-linux-topology',
    style: 'base-reference',
    name: '参考复刻 · Linux 命名空间拓扑',
    width: 1648,
    height: 1048,
    svg: linux,
    prompt: linuxPrompt,
  },
];
