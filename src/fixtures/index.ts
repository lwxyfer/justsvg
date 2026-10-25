import architecture from './architecture.svg?raw';
import flowchart from './flowchart.svg?raw';
import infographic from './infographic.svg?raw';
import complex from './complex.svg?raw';
import security from './security.svg?raw';
export const fixtures = { architecture, flowchart, infographic, complex, security };
export const fixtureNames: Record<keyof typeof fixtures, string> = {
  architecture: '技术架构图',
  flowchart: '简单流程图',
  infographic: '渐变信息图',
  complex: '嵌套 Transform / Defs',
  security: '安全边界测试',
};
