# Linear 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
具体采用Linear产品项目/Issue视图的2026年更新的暖灰工程语言：偏暖中性近黑画布、柔和表面分隔、清晰位置栏与视图栏、状态图标和窄列任务；右侧以检索任务详情和结果组织RAG流程。小面积低饱和蓝只用于选中状态，中性灰承担依赖线，绿色仅用于输出状态；侧栏在视觉上退后，位置栏与视图栏分开，减少侧栏无意义分隔线；不同任务尺寸和阅读层级，禁止用霓虹光晕或把所有卡片染紫。薄框与低噪声结构保留，功能箭头至少3:1、辅助文字至少4.5:1；Issue ID均为示意，不使用实际客户数据或官方图标商标。

细部规范：暖灰近黑工作区、退后的侧栏、分离的位置/视图栏、11px来源ID；只以小面积低饱和蓝标示选中任务状态，依赖线中性灰，避免全图紫色。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

依据官方2026界面更新对位置栏/视图栏、分隔与密度的调整，以及官方品牌页的Mercury White #F4F5F8/Nordic Gray #222326和低饱和蓝原则；暖灰表面颜色为图示适配值；本图是原创RAG任务视图，未使用Linear商标素材。
- Linear · 产品视觉: https://linear.app/
- Linear · 2026界面更新: https://linear.app/now/behind-the-latest-design-refresh
- Linear · 品牌指南: https://linear.app/brand

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=96,380,348,88
chunks: Chunking / 解析与切分 | x/y/w/h=96,506,348,88
embed: Embeddings / 向量编码 | x/y/w/h=96,632,348,88
index: Vector index / 向量索引 | x/y/w/h=96,758,348,88
query: User query / 用户问题 | x/y/w/h=552,380,362,98
retrieve: Retriever / 相似度检索 | x/y/w/h=552,594,362,122
context: Context / 上下文构建 | x/y/w/h=1020,594,406,122
llm: LLM / 生成模型 | x/y/w/h=1020,838,406,140
answer: Answer / 回答与引用 | x/y/w/h=552,860,362,118

关系与专用路线：
docs → chunks | 270,472 → 270,502
chunks → embed | 270,598 → 270,628
embed → index | 270,724 → 270,754
query → retrieve | 733,482 → 733,590
retrieve → context | 918,655 → 1016,655
context → llm | 1223,720 → 1223,834
llm → answer | 1016,908 → 958,908 → 958,919 → 918,919
index → retrieve | 448,802 → 510,802 → 510,655 → 548,655

节点ID前缀brand-linear-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
