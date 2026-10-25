import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { icons } from 'lucide-react';
import { describeIcon } from './icon-metadata.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const entries = [
  ['Database', '数据库', '存储', 'database storage sql 数据'],
  ['Server', '服务器', '计算', 'server backend 主机 后端'],
  ['Monitor', '电脑', '计算', 'monitor desktop computer 桌面'],
  ['Laptop', '笔记本', '计算', 'laptop computer mac 电脑'],
  ['Cpu', '处理器', '计算', 'cpu chip processor 芯片'],
  ['Cloud', '云', '网络', 'cloud 云服务'],
  ['Network', '网络', '网络', 'network nodes 拓扑'],
  ['Globe', '互联网', '网络', 'globe internet world 地球'],
  ['Wifi', '无线网络', '网络', 'wifi wireless 无线'],
  ['Router', '路由器', '网络', 'router gateway 网关'],
  ['User', '用户', '人物', 'user person 人物'],
  ['Users', '用户组', '人物', 'users team group 团队'],
  ['FileText', '文档', '文件', 'file document text 文本'],
  ['Folder', '文件夹', '文件', 'folder directory 目录'],
  ['HardDrive', '硬盘', '存储', 'disk hard drive 存储'],
  ['Archive', '归档', '存储', 'archive box 备份'],
  ['Settings', '设置', '工具', 'settings gear configuration 配置'],
  ['Wrench', '工具', '工具', 'wrench tool 扳手'],
  ['Code', '代码', '工具', 'code programming 开发'],
  ['Terminal', '终端', '工具', 'terminal console shell 控制台'],
  ['ShieldCheck', '安全', '状态', 'shield security check 防护'],
  ['LockKeyhole', '锁', '状态', 'lock secure 密码'],
  ['CircleCheck', '完成', '状态', 'check success done 成功'],
  ['TriangleAlert', '警告', '状态', 'warning alert error 提醒'],
  ['Info', '信息', '状态', 'info information 帮助'],
  ['CircleX', '错误', '状态', 'error failed cancel 失败'],
  ['ArrowRight', '向右', '方向', 'arrow right 右箭头'],
  ['ArrowDown', '向下', '方向', 'arrow down 下箭头'],
  ['RefreshCw', '同步', '方向', 'refresh sync cycle 刷新'],
  ['Workflow', '工作流', '工具', 'workflow flow process 流程'],
  ['Bot', '机器人', '计算', 'bot ai robot 人工智能'],
  ['Brain', '智能', '计算', 'brain ai model 模型'],
  ['Mail', '邮件', '文件', 'mail email 邮箱'],
  ['Search', '搜索', '工具', 'search find 查找'],
  ['ChartColumn', '图表', '工具', 'chart graph stats 柱状图'],
  ['Layers', '图层', '工具', 'layers stack 层级'],
  ['Image', '图片', '文件', 'image picture photo 图像'],
  ['Smartphone', '手机', '计算', 'smartphone mobile phone 移动'],
  ['Zap', '闪电', '状态', 'zap bolt fast 快速'],
  ['Clock', '时钟', '状态', 'clock time schedule 时间'],
];
const license = await readFile('node_modules/lucide-react/LICENSE', 'utf8');
const curated = new Map(
  entries.map(([name, label, category, keywords]) => [name, { label, category, keywords }]),
);
const names = [
  ...entries.map(([name]) => name),
  ...Object.keys(icons)
    .filter((name) => !curated.has(name))
    .sort(),
];
const data = names.map((name) => {
  const meta = curated.get(name) || describeIcon(name);
  if (!icons[name]) throw new Error(`Missing Lucide icon: ${name}`);
  return {
    id: `icon-${name.toLowerCase()}`,
    label: meta.label,
    category: describeIcon(name).category,
    keywords: `${name} ${meta.keywords} ${curated.has(name) ? describeIcon(name).keywords : ''}`,
    featured: curated.has(name),
    svg: renderToStaticMarkup(
      createElement(icons[name], { size: 32, color: '#334155', strokeWidth: 1.75 }),
    ),
    width: 32,
    height: 32,
  };
});
await writeFile(
  'src/assets/icons.json',
  JSON.stringify(data.map(({ id, svg }) => ({ id, svg }))) + '\n',
);
await writeFile(
  'src/assets/icon-index.json',
  JSON.stringify(
    data.map(({ id, label, category, keywords, featured, width, height }) => ({
      id,
      label,
      category,
      keywords,
      featured,
      width,
      height,
    })),
  ) + '\n',
);
await writeFile('src/assets/lucide-license.txt', license);
await mkdir('docs/licenses', { recursive: true });
await writeFile(
  'docs/licenses/LUCIDE.txt',
  await readFile('node_modules/lucide-react/LICENSE', 'utf8'),
);
console.log(`Generated ${data.length} native SVG icons from installed Lucide; license copied.`);
