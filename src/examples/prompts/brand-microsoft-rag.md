# Microsoft 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
以Microsoft Fluent的工作面、层级、双色图标和空间材料为参考，绘制一个完整桌面工作区：白色主工作面、系统标题栏和左侧知识库区域；问题进入右侧检索/上下文，再进入蓝紫叠层模型对象，下方是宽幅回答区域。窗口用细轮廓和工作面明度区分层级；文件、切分、编码、索引图标用不同的渐变体块与明暗面绘制，模型使用重叠半透明平面。Segoe风格紧凑层级，蓝色连接；禁止把Fluent简化成浅蓝底的九张相同卡片。静态SVG不声称模拟Mica或真实系统窗口。

细部规范：窗口标题栏仅顶部圆角，底部与内容区齐接；Fluent文件图标有0.8px亮边，薄轮廓和叠层共同表达材质。 箭头使用markerUnits="userSpaceOnUse"，尺寸10px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

以Fluent工作面、空间层次和双色图标而非色板为依据；体块与工作区是本图原创适配，Segoe不可用时系统回退。
- Microsoft · 设计视觉: https://microsoft.design/
- Fluent 2 · 图标: https://fluent2.microsoft.design/iconography
- Fluent 2 · 层级: https://fluent2.microsoft.design/elevation
- Fluent 2 · 字体: https://fluent2.microsoft.design/typography/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=92,378,300,108
chunks: Chunking / 解析与切分 | x/y/w/h=92,532,300,108
embed: Embeddings / 向量编码 | x/y/w/h=92,686,300,108
index: Vector index / 向量索引 | x/y/w/h=92,840,300,108
query: User query / 用户问题 | x/y/w/h=500,378,576,108
retrieve: Retriever / 相似度检索 | x/y/w/h=500,582,266,122
context: Context / 上下文构建 | x/y/w/h=850,582,266,122
llm: LLM / 生成模型 | x/y/w/h=1200,520,240,244
answer: Answer / 回答与引用 | x/y/w/h=500,858,940,144

关系与专用路线：
docs → chunks | 242,490 → 242,528
chunks → embed | 242,644 → 242,682
embed → index | 242,798 → 242,836
query → retrieve | 633,490 → 633,578
retrieve → context | 770,643 → 846,643
context → llm | 1120,643 → 1196,643
llm → answer | 1320,768 → 1320,812 → 1120,812 → 1120,854
index → retrieve | 396,894 → 448,894 → 448,643 → 496,643

节点ID前缀brand-microsoft-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
