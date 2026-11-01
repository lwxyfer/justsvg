import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import homeTranslations from '../home/home-translations.json';

export type Language = 'en' | 'zh';
export const languageStorageKey = 'justsvg.home.language';

const translations: Record<string, string> = {
  ...(homeTranslations as Record<string, string>),
  编辑器: 'Editor',
  示例库: 'Examples',
  'Example 示例': 'Examples',
  返回编辑器: 'Back to editor',
  '正在打开示例库…': 'Opening examples…',
  切换语言: 'Language',
  切换到中文: 'Switch to Chinese',
  切换到英文: 'Switch to English',
  搜索与筛选: 'Search and filters',
  搜索示例: 'Search examples',
  '搜索图形、场景或品牌，例如：架构、泳道、OpenAI':
    'Search diagrams, scenes or brands, e.g. architecture, swimlane, OpenAI',
  图形类型: 'Diagram type',
  风格系列: 'Style family',
  全部类型: 'All types',
  全部系列: 'All families',
  基础风格: 'Base styles',
  专题风格: 'Special styles',
  筛选图形类型: 'Filter diagram type',
  筛选风格系列: 'Filter style family',
  筛选结果: 'Filter results',
  清除筛选: 'Clear filters',
  图片结果: 'Image results',
  '没有找到匹配的 SVG': 'No matching SVGs found',
  '试试其他关键词，或清除筛选。': 'Try another keyword or clear the filters.',
  显示全部示例: 'Show all examples',
  图片预览: 'Image preview',
  选择视觉风格: 'Choose visual style',
  在编辑器中打开: 'Open in editor',
  关闭预览: 'Close preview',
  示例预览区: 'Example preview',
  全屏预览: 'Full-screen preview',
  退出全屏: 'Exit full-screen preview',
  上一张: 'Previous',
  下一张: 'Next',
  当前图片不在筛选结果中: 'This image is outside the current filters',
  品牌风格依据: 'Brand style rationale',
  品牌参考与设计依据: 'Brand references and rationale',
  非官方: 'Unofficial',
  常用图形: 'Common shapes',
  常用图标: 'Common icons',
  常用组合图: 'Common compositions',
  最近使用: 'Recently used',
  全部图形: 'All shapes',
  全部图标: 'All icons',
  全部组合图: 'All compositions',
  基础图形: 'Basic shapes',
  流程图: 'Flowchart',
  块状箭头: 'Block arrows',
  容器与注释: 'Containers and annotations',
  架构符号: 'Architecture symbols',
  矩形: 'Rectangle',
  圆角矩形: 'Rounded rectangle',
  圆形: 'Circle',
  椭圆: 'Ellipse',
  菱形: 'Diamond',
  三角形: 'Triangle',
  直角三角形: 'Right triangle',
  正方形: 'Square',
  五边形: 'Pentagon',
  六边形: 'Hexagon',
  八边形: 'Octagon',
  五角星: 'Star',
  六角星: 'Six-point star',
  十字形: 'Cross',
  心形: 'Heart',
  闪电形: 'Lightning',
  梯形: 'Trapezoid',
  平行四边形: 'Parallelogram',
  处理过程: 'Process',
  条件判断: 'Decision',
  '输入 / 输出': 'Input / output',
  子流程: 'Subprocess',
  单文档: 'Document',
  多文档: 'Multiple documents',
  数据库圆柱: 'Database cylinder',
  准备: 'Preparation',
  手动输入: 'Manual input',
  手动操作: 'Manual operation',
  延迟: 'Delay',
  存储数据: 'Stored data',
  内部存储: 'Internal storage',
  流程连接点: 'On-page connector',
  跨页连接: 'Off-page connector',
  合并: 'Merge',
  提取: 'Extract',
  排序: 'Sort',
  汇合: 'Summing junction',
  直线: 'Line',
  直角折线: 'Elbow',
  单向箭头: 'Arrow',
  双向箭头: 'Double arrow',
  虚线: 'Dashed line',
  虚线箭头: 'Dashed arrow',
  折线箭头: 'Elbow arrow',
  曲线: 'Curve',
  曲线箭头: 'Curve arrow',
  向左箭头: 'Left arrow',
  文字标签: 'Text label',
  '开始 / 结束': 'Start / end',
  '基础·技术文档': 'Base · technical docs',
  '基础·黑白线框': 'Base · monochrome wireframe',
  '基础·分区白卡': 'Base · zoned cards',
  '基础·深色工程': 'Base · dark engineering',
  黑白论文: 'Monochrome paper',
  流程泳道: 'Process swimlane',
  电路布线: 'Circuit wiring',
  包豪斯几何: 'Bauhaus geometry',
  便签工作坊: 'Sticky-note workshop',
  地铁线路: 'Metro lines',
  服务器机架: 'Server rack',
  装饰艺术: 'Art deco',
  复古像素: 'Retro pixels',
  极简线性: 'Minimal linear',
  手绘草图: 'Hand-drawn sketch',
  'RAG 检索增强生成架构': 'RAG retrieval-augmented generation architecture',
  '多租户 SaaS 平台 · 高信息密度架构': 'Multi-tenant SaaS platform · high-density architecture',
  '三层业务系统 · 基础架构': 'Three-tier business system · base architecture',
  '发布交付流程 · 含失败回路': 'Release delivery flow · failure loop',
  '请求生命周期 · 可观测性信息图': 'Request lifecycle · observability infographic',
  关闭: 'Close',
  选择多个元素: 'Select multiple elements',
  深入分组: 'Enter a group',
  微调位置: 'Nudge position',
  'Shift + 点击': 'Shift-click',
  双击: 'Double-click',
  '连接线坐标不可逆，请先调整父级 Transform。':
    'Connector coordinates cannot be inverted. Adjust the parent Transform first.',
  文档: 'Document',
  分组: 'Group',
  退出分组: 'Exit group',
  连接线控制点: 'Connector control point',
  '缩小 (-)': 'Zoom out (-)',
  '还原 100%': 'Reset to 100%',
  '放大 (+)': 'Zoom in (+)',
  '适应画布 (Shift+1)': 'Fit canvas (Shift+1)',
  拖动背景平移: 'Drag background to pan',
  框选: 'marquee select',
  右键选择下方对象: 'right-click to choose below',
  复用与调试: 'Reuse and debug',
  本页草稿: 'Page draft',
  历史本地版本: 'Saved local version',
  内置示例: 'Built-in example',
  示例内容: 'Example content',
  '生成 Prompt': 'Generation prompt',
  'SVG 源码': 'SVG source',
  '复制 Prompt 到 AI 应用，可替换主题与内容。':
    'Copy the prompt to an AI app and replace the theme or content.',
  '复制 Prompt': 'Copy prompt',
  '修改源码后先预览，再打开编辑器。无效或不安全的 SVG 不会替换当前预览。':
    'Preview source changes before opening the editor. Invalid or unsafe SVG will not replace the current preview.',
  '预览 SVG': 'Preview SVG',
  '源码有未预览的修改，请先预览后再使用。':
    'Source has unpreviewed changes. Preview it before using it.',
  恢复内置: 'Restore built-in',
  '修改仅在本页保留，需要保存时请在编辑器中继续。':
    'Changes stay on this page; continue in the editor when you need to save them.',
  '预览已更新。': 'Preview updated.',
  '已恢复内置示例。': 'Built-in example restored.',
  '此示例需要检查清理报告，请返回编辑器查看。':
    'This example needs an import review. Return to the editor to inspect it.',
  'Prompt 已复制，可粘贴到 AI 应用。': 'Prompt copied. Paste it into an AI app.',
  '剪贴板不可用，已选中 Prompt，请按 ⌘/Ctrl+C 复制。':
    'Clipboard unavailable. The prompt is selected; press ⌘/Ctrl+C to copy it.',
  插入面板: 'Insert panel',
  插入: 'Insert',
  图层: 'Layers',
  属性: 'Properties',
  常见图形: 'Shapes',
  'Icon 图标': 'Icons',
  组合图: 'Compositions',
  搜索素材: 'Search assets',
  '搜索名称或关键词…': 'Search by name or keyword…',
  '搜索名称…': 'Search names…',
  没有匹配的风格: 'No matching styles',
  图标: 'icons',
  图形: 'shapes',
  '导入自己的 SVG 图标': 'Import your own SVG icon',
  '作为新对象插入，不替换当前图稿。':
    'Insert as a new object without replacing the current document.',
  '选择 SVG 文件': 'Choose SVG file',
  '图标超过 5 MB 限制。': 'The icon exceeds the 5 MB limit.',
  '自定义图标 SVG': 'Custom icon SVG',
  插入图标: 'Insert icon',
  '点击或拖入当前图稿；双击组合深入编辑。':
    'Click or drag into the current document; double-click a composition to edit it.',
  '点击插入视口中心，或拖入指定位置。':
    'Click to insert at the viewport center, or drag to a specific position.',
  ' 内置图标：Lucide · ISC / MIT。': ' Built-in icons: Lucide · ISC / MIT.',
  '搜索图层…': 'Search layers…',
  搜索图层: 'Search layers',
  没有匹配的图层: 'No matching layers',
  隐藏所选: 'Hide selected',
  锁定所选: 'Lock selected',
  组合: 'Group',
  文档图层: 'Document layers',
  'Shift 多选 · 双击名称重命名': 'Shift-click to multi-select · Double-click a name to rename',
  '锁定状态为会话设置，不随 SVG 导出': 'Lock state is session-only and is not exported with SVG',
  显示: 'Show',
  隐藏: 'Hide',
  解锁: 'Unlock',
  锁定: 'Lock',
  折叠: 'Collapse',
  展开: 'Expand',
  关闭窗口: 'Close window',
  导入前检查: 'Import review',
  '为安全显示 SVG，需要清理以下内容，图形外观可能发生变化。取消会保留当前图稿。':
    'The following content must be cleaned before this SVG can be displayed safely. Its appearance may change; cancel to keep the current document.',
  取消导入: 'Cancel import',
  清理并继续: 'Clean and continue',
  '导入 SVG': 'Import SVG',
  '把 AI 生成的 SVG 带进来，完成最后一点精修。':
    'Bring in an AI-generated SVG and make the final refinements.',
  '原生 SVG · 本地处理 · 标准格式导出': 'Native SVG · processed locally · standard export',
  '拖入 SVG 文件': 'Drop an SVG file',
  或: 'or',
  选择本地文件: 'choose a local file',
  '或粘贴 SVG XML': 'or paste SVG XML',
  试试示例: 'Try an example',
  '不上传文件。危险内容会被移除并提示。':
    'Files are never uploaded. Risky content is removed and reported.',
  键盘快捷键: 'Keyboard shortcuts',
  知道了: 'Got it',
  'SVG 文档': 'SVG documents',
  关闭有未导出修改的图稿: 'Close document with unsaved changes',
  保留图稿: 'Keep document',
  直接关闭: 'Close anyway',
  下载并关闭: 'Download and close',
  本地编辑: 'Local editing',
  有未导出修改: 'Unsaved changes',
  打开文件: 'Open file',
  '粘贴 SVG': 'Paste SVG',
  '快捷键 (?)': 'Keyboard shortcuts (?)',
  '导出 SVG': 'Export SVG',
  下载: 'Download',
  '下载 SVG': 'Download SVG',
  复制完整源码: 'Copy full source',
  下载静态SVG: 'Download static SVG',
  恢复上一份文档: 'Restore previous document',
  查看源码: 'View source',
  撤销: 'Undo',
  重做: 'Redo',
  取消分组: 'Ungroup',
  更多排列操作: 'More arrangement actions',
  相同宽度: 'Same width',
  相同高度: 'Same height',
  置顶: 'Bring to front',
  置底: 'Send to back',
  上移一层: 'Move forward',
  下移一层: 'Move backward',
  复制元素: 'Copy elements',
  粘贴元素: 'Paste elements',
  重复元素: 'Duplicate elements',
  删除元素: 'Delete elements',
  暂停全部动效预览: 'Pause all motion previews',
  播放全部动效预览: 'Play all motion previews',
  智能吸附: 'Smart snap',
  显示网格: 'Show grid',
  更多导出格式: 'More export formats',
  源码: 'Source',
  导入: 'Import',
  '工作区网格仅辅助编辑，不参与导出。': 'Workspace grid is an editing aid and is not exported.',
  '背景随 SVG 和图片一起导出。': 'Background is included in SVG and image exports.',
  无网格: 'None',
  工作区底色: 'Workspace color',
  工作区: 'Workspace',
  图案间距: 'Pattern spacing',
  渐变角度: 'Gradient angle',
  图案颜色: 'Pattern color',
  辅助颜色: 'Secondary color',
  结束颜色: 'End color',
  起始颜色: 'Start color',
  背景颜色: 'Background color',
  网格: 'Grid',
  点阵: 'Dots',
  渐变: 'Gradient',
  纯色: 'Solid',
  透明: 'Transparent',
  背景类型: 'Background type',
  交换宽高: 'Swap dimensions',
  画布高度: 'Canvas height',
  画布宽度: 'Canvas width',
  自定义: 'Custom',
  尺寸预设: 'Size preset',
  画布尺寸: 'Canvas size',
  元素属性: 'Element properties',
  说明: 'Details',
  分组样式: 'Group styles',
  '可多选，每个文件最大 5 MB': 'Multiple files, up to 5 MB each',
  设置: 'Settings',
  界面语言: 'Interface language',
  '语言切换立即生效，并保存在此浏览器。':
    'Language changes apply immediately and are saved in this browser.',
  完成: 'Done',
  '在 GitHub 查看源码': 'View source on GitHub',
  填充颜色选择器: 'Fill color picker',
  描边颜色选择器: 'Stroke color picker',
  拖动空白处框选: 'Drag empty space to select',
  'Space + 拖动平移': 'Space + drag to pan',
  拖动空白处: 'Drag empty space',
  追加框选: 'Add to selection',
  文档名称: 'Document name',
  '名称需为 1–120 个字符，不能包含文件路径或特殊文件名字符。':
    'Use 1–120 characters without path separators or special filename characters.',
  文件: 'File',
  更多选项: 'More options',
  导出: 'Export',
  图片倍率: 'Image scale',
  '下载 PNG': 'Download PNG',
  '下载 JPEG': 'Download JPEG',
  '下载 WEBP': 'Download WEBP',
  画布设置: 'Canvas settings',
  '仅 Ctrl / Cmd + 滚轮缩放': 'Zoom only with Ctrl / Cmd + scroll',
  画布背景: 'Canvas background',
  切换图层面板: 'Toggle layers panel',
  切换属性面板: 'Toggle properties panel',
  编辑工具栏: 'Editing toolbar',
  收起左侧面板: 'Collapse left panel',
  收起属性面板: 'Collapse properties panel',
  '没有匹配的素材，试试其他关键词。': 'No matching assets. Try another keyword.',
  '还没有最近使用的图标。': 'No recently used icons yet.',
  素材分页: 'Asset pagination',
  上一页素材: 'Previous asset page',
  下一页素材: 'Next asset page',
  '正在加载图标库…': 'Loading icon library…',
  重新加载图标: 'Reload icons',
  搜索结果: 'Search results',
  左侧面板: 'Left panel',
  显示插入面板: 'Show insert panel',
  显示图层面板: 'Show layers panel',
  动效: 'Motion',
  外观: 'Appearance',
  文字: 'Text',
  布局: 'Layout',
  连接关联: 'Connection bindings',
  连接线: 'Connector',
  'SVG 属性': 'SVG attributes',
  对齐与间距: 'Alignment and spacing',
  批量文字: 'Batch text',
  图标颜色: 'Icon color',
  图标描边: 'Icon stroke',
  填充: 'Fill',
  描边: 'Stroke',
  宽度: 'Width',
  高度: 'Height',
  透明度: 'Opacity',
  字体: 'Font',
  字号: 'Font size',
  字重: 'Font weight',
  文字对齐: 'Text alignment',
  居中: 'Center',
  多行行距: 'Line spacing',
  内容: 'Content',
  混合: 'Mixed',
  '请输入有效数字。': 'Enter a valid number.',
  '每个细节，都刚刚好。': 'Every detail, exactly right.',
  '选择一个元素，开始精修。': 'Select an element to start refining.',
  '文字、颜色、间距，由你决定。': 'You decide the text, color and spacing.',
  '粘贴你的 SVG': 'Paste your SVG',
  未命名: 'Untitled',
  比例已锁定: 'Aspect ratio locked',
  锁定宽高比例: 'Lock aspect ratio',
  '查看完整 SVG 源码': 'View full SVG source',
  '坐标与尺寸基于文档坐标系的外接矩形。旋转为相对角度。':
    'Coordinates and dimensions use the document bounding box. Rotation is relative.',
  当前选择边界: 'Current selection bounds',
  最后选中的关键对象: 'Last selected key object',
  画布: 'Canvas',
  左对齐: 'Align left',
  水平居中: 'Align center',
  右对齐: 'Align right',
  顶对齐: 'Align top',
  垂直居中: 'Align middle',
  底对齐: 'Align bottom',
  水平分布: 'Distribute horizontally',
  垂直分布: 'Distribute vertically',
  净间距: 'Gap',
  设置水平间距: 'Set horizontal gap',
  设置垂直间距: 'Set vertical gap',
  起点: 'Start',
  终点: 'End',
  未关联: 'Unbound',
  最近边界: 'Nearest edge',
  左侧中心: 'Left center',
  右侧中心: 'Right center',
  顶部中心: 'Top center',
  底部中心: 'Bottom center',
  关联相邻箭头: 'Bind nearby arrows',
  解除关联: 'Unbind',
  无动效: 'No motion',
  箭头流动: 'Flowing arrows',
  呼吸: 'Pulse',
  柔和闪动: 'Soft blink',
  启用动效: 'Enable motion',
  '动效周期（秒）': 'Motion duration (seconds)',
  流动方向: 'Flow direction',
  沿路径正向: 'Along path',
  沿路径反向: 'Reverse path',
  编辑原图形: 'Edit original shape',
  暂停预览: 'Pause preview',
  播放预览: 'Play preview',
  移除动效: 'Remove motion',
  增加一行: 'Add a line',
  删除末行: 'Remove last line',
  按宽度换行: 'Wrap to width',
  缩小字号适应宽度: 'Reduce font to fit width',
  导入兼容性与安全报告: 'Import compatibility and safety report',
  关闭兼容性报告: 'Close compatibility report',
  关闭提示: 'Close notice',
  '未发现需移除的危险内容。内部 SVG 资源与结构已保留。':
    'No risky content needed removal. Internal SVG resources and structure were preserved.',
  '安全处理会限制高风险特性。建议在导出前检查原始视觉效果。':
    'Safety processing limits high-risk features. Check the original appearance before exporting.',
  '安全 SVG': 'Safe SVG',
  '就绪，选择一个元素开始编辑': 'Ready. Select an element to start editing.',
  恢复不可用: 'Recovery unavailable',
  待写入恢复副本: 'Recovery copy pending',
  已写入本地恢复副本: 'Recovery copy saved locally',
  '导入失败，请重试。': 'Import failed. Please try again.',
  '请先应用或取消文字编辑，再返回首页。': 'Apply or cancel text editing before returning home.',
  '请先应用或取消文字编辑，再打开示例页。': 'Apply or cancel text editing before opening examples.',
  '本地恢复空间不可用，请及时导出各标签中的 SVG。':
    'Local recovery is unavailable. Export the SVGs in your tabs soon.',
  个已选: 'selected',
  条提示: 'notices',
  '新建 SVG': 'New SVG',
  '新建空白 SVG': 'New blank SVG',
  '有未导出的修改。关闭后将从已打开的图稿中移除，建议先下载 SVG。':
    'has unsaved changes. Closing removes it from the open documents; download the SVG first.',
  '图标库加载失败，请重试。素材随应用提供，不需要外部图标服务。':
    'Icon library failed to load. Please retry; assets ship with the app and need no external icon service.',
  个匹配: 'matches',
  共: 'of',
  第: 'Page',
  页: '',
  分类: ' category',
  使用: 'Use ',
  新建图稿: ' to create a document',
  作为新图稿: 'Create document',
  点击或拖入画布: 'Click or drag onto the canvas',
  按住背景拖动: 'Drag the background',
  'Shift + 拖动背景': 'Shift + drag the background',
  框选元素: 'Marquee select',
  平移画布: 'Pan canvas',
  多选元素: 'Multi-select elements',
  '方向键 / Shift + 方向键': 'Arrow keys / Shift + arrow keys',
  '输入文字时，画布快捷键自动暂停。': 'Canvas shortcuts pause while editing text.',
  '仅支持同级图层排序，避免改变坐标和继承样式。':
    'Only sibling layers can be reordered to preserve coordinates and inherited styles.',
  '请先解锁图层。': 'Unlock the layer first.',
  图层排序: 'Reorder layers',
  已锁定: 'Locked',
  图层名称: 'Layer name',
  显示图层: 'Show layer',
  隐藏图层: 'Hide layer',
  解锁图层: 'Unlock layer',
  锁定图层: 'Lock layer',
  隐藏所选图层: 'Hide selected layers',
  '来源：': 'Source: ',
  属性文字: 'Property text',
  '字号必须大于 0。': 'Font size must be greater than 0.',
  '左 / 起始': 'Left / start',
  '右 / 末尾': 'Right / end',
  'SVG 保留原字体。此设备未安装的字体会使用浏览器回退字体；不会加载外部字体。':
    'SVG keeps its original fonts. Browser fallbacks are used when a font is not installed; external fonts are not loaded.',
  属性面板: 'Properties panel',
  个元素: 'elements',
  编辑背景矩形: 'Edit background rectangle',
  '透明度范围为 0–1。': 'Opacity must be between 0 and 1.',
  圆角: 'Corner radius',
  虚线间距: 'Dash spacing',
  '显示计算样式。修改将为所选元素设置显式覆盖；清空可恢复继承。':
    'Computed styles are shown. Changes create explicit overrides for the selection; clearing restores inheritance.',
  '分组内已有独立样式的子元素保持原样；可深入分组单独修改。':
    'Children with their own styles keep them; enter the group to edit them individually.',
  批量字号: 'Batch font size',
  批量字体: 'Batch font',
  起点箭头样式: 'Start arrow style',
  终点箭头样式: 'End arrow style',
  '选择箭头…': 'Choose arrow…',
  无: 'None',
  实心箭头: 'Solid arrow',
  开放箭头: 'Open arrow',
  圆点: 'Circle',
  '文档：': 'Document: ',
  起始箭头: 'Start marker',
  结束箭头: 'End marker',
  折线坐标: 'Polyline points',
  '可选已有箭头或创建独立样式。Path 支持整体移动、缩放与样式编辑。':
    'Choose an existing arrow or create an independent style. Paths support moving, scaling and style edits.',
  元素ID: 'Element ID',
  Transform: 'Transform',
  调整外框尺寸: 'Adjust the frame size',
  '调整外框尺寸，保持同组文字和图标不变。':
    'Adjust the frame size while keeping grouped text and icons unchanged.',
  外框宽度: 'Frame width',
  外框高度: 'Frame height',
  新的一行: 'New line',
  排版宽度: 'Layout width',
  排版行距: 'Layout line spacing',
  最小字号: 'Minimum font size',
  '宽度和行距使用文字本地坐标。仅在点击命令时排版；可撤销，不修改其他文字。':
    'Width and line spacing use the text’s local coordinates. Layout runs only when commanded; it is undoable and does not change other text.',
  对齐到: 'Align to',
  对齐参照: 'Alignment reference',
  关键对象: 'Key object',
  最后选中的对象: 'Last selected object',
  请输入: 'Enter',
  '之间的数值。': 'a value in this range.',
  关联节点: ' node',
  连接位置: ' connection position',
  目标已丢失或不支持: 'Target missing or unsupported',
  '关联后跟随节点移动、缩放和对齐。拖动端点会解除该端关联；单独移动连线会解除两端关联。折线保留原有走线，不自动避让其他节点。':
    'Bindings follow node moves, scaling and alignment. Dragging an endpoint unbinds it; moving a line alone unbinds both ends. Polylines keep their routing and do not avoid other nodes automatically.',
  已建立: 'Created',
  '个端点关联，可直接移动卡片。': 'endpoint bindings; cards can now move directly.',
  '没有找到可明确关联的新端点。可选中连线，手动指定节点。':
    'No clearly bindable endpoints found. Select a line and choose its nodes manually.',
  已有: 'There are',
  '条连线关联到所选节点。识别屏幕上距边界 14 px 内且目标明确的端点；不会自动修改导入的曲线或复杂 Path。':
    'lines bound to the selected nodes. Endpoints within 14 px of a clear target are recognized; imported curves and complex paths are not changed automatically.',
  动效类型: 'Motion type',
  流动线段: 'Flow dash',
  流动间隔: 'Flow gap',
  '请输入 %': 'Enter %',
  '周期越短流动越快，方向按 SVG 路径定义。轨道保留原线，节点关联仍可跟随。':
    'Shorter cycles flow faster; direction follows the SVG path. The original track stays, and node bindings still follow.',
  '通过透明度变化强调状态，不改变卡片尺寸或连接位置。':
    'Opacity changes emphasize state without changing card size or connector positions.',
  '配置随 SVG 导出；暂停仅影响编辑器预览。系统开启减少动态效果时显示静态。':
    'Motion settings export with the SVG; pausing affects only the editor preview. Reduced-motion systems show a static result.',
  选择下方对象: 'Choose an object below',
  选择当前位置的对象: 'Choose an object at this position',
  '按图形边界列出，包含重叠对象与分组。':
    'Listed by shape bounds, including overlapping objects and groups.',
  '此位置没有可选择的对象。': 'No selectable object at this position.',
  '源码修改已应用，可撤销。': 'Source changes applied and can be undone.',
  '编辑源码后点击应用。取消不修改图稿；一次应用可完整撤销，视口保持不变。':
    'Edit the source and click Apply. Cancel keeps the document unchanged; one application is fully undoable and preserves the viewport.',
  '导出 SVG 源码': 'Export SVG source',
  '应用时会清理或限制以下内容：': 'The following content will be cleaned or restricted on apply:',
  复制当前图稿: 'Copy current document',
  确认并应用: 'Confirm and apply',
  应用修改: 'Apply changes',
  编辑文字: 'Edit text',
  取消文字编辑: 'Cancel text editing',
  文字段落: 'Text paragraph',
};

export const LocaleContext = createContext({
  locale: 'en' as Language,
  setLocale: (() => {}) as (locale: Language) => void,
  t: (text: string): string => text,
});

function languageFromHash(): Language | null {
  let hash: string;
  try {
    hash = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return null;
  }
  const match = hash.match(/(?:^|[&#])(?:lang|language)=(en|zh)(?:$|&)/i);
  if (match) return match[1].toLowerCase() === 'zh' ? 'zh' : 'en';
  if (/^(?:en|zh)$/i.test(hash)) return hash.toLowerCase() === 'zh' ? 'zh' : 'en';
  return null;
}

function updateLanguageHash(locale: Language) {
  if (typeof window === 'undefined') return;
  let hash = window.location.hash.slice(1);
  try {
    hash = decodeURIComponent(hash);
  } catch {
    /* Preserve malformed anchors as-is. */
  }
  const hashParts = hash
    .split('&')
    .filter(Boolean)
    .filter((part) => !/^(?:lang|language)=(?:en|zh)$/i.test(part) && !/^(?:en|zh)$/i.test(part));
  const nextHash = [`lang=${locale}`, ...hashParts].join('&');
  const url = new URL(window.location.href);
  url.hash = nextHash;
  window.history.replaceState(window.history.state, '', url);
}

export function translate(text: string, locale: Language) {
  return locale === 'zh' ? text : translations[text] || text;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Language>(() => {
    const fromHash = languageFromHash();
    if (fromHash) return fromHash;
    try {
      const stored = localStorage.getItem(languageStorageKey);
      if (stored === 'zh' || stored === 'en') return stored;
    } catch {
      /* Fall through to the incumbent route defaults. */
    }
    return /\/(?:editor|examples)\/?$/.test(window.location.pathname) ? 'zh' : 'en';
  });
  const changeLocale = useCallback((nextLocale: Language) => {
    setLocale(nextLocale);
    updateLanguageHash(nextLocale);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
    try {
      localStorage.setItem(languageStorageKey, locale);
    } catch {
      /* Keep the in-memory choice when storage is unavailable. */
    }
  }, [locale]);
  useEffect(() => {
    const syncLanguage = () => {
      const next = languageFromHash();
      if (next) setLocale(next);
    };
    const syncStorage = (event: StorageEvent) => {
      if (
        event.key === languageStorageKey &&
        (event.newValue === 'en' || event.newValue === 'zh')
      ) {
        setLocale(event.newValue);
        updateLanguageHash(event.newValue);
      }
    };
    window.addEventListener('hashchange', syncLanguage);
    window.addEventListener('popstate', syncLanguage);
    window.addEventListener('storage', syncStorage);
    return () => {
      window.removeEventListener('hashchange', syncLanguage);
      window.removeEventListener('popstate', syncLanguage);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);
  const value = useMemo(
    () => ({ locale, setLocale: changeLocale, t: (text: string) => translate(text, locale) }),
    [changeLocale, locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
