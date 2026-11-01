# IBM 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
采用IBM Design Language的Technical diagrams作为具体参照：清楚的知识/运行/生成三域、直角嵌套框、蓝色语义节点与正交连接。按8px基础节奏构建，以2x画布比例放大节点、图标和左对齐文字；使用1.5–2px轮廓并明确其为图示缩放适配。标题克制，辅助信息层级清晰。不是企业宣传海报，不依靠IBM的8-Bar标志；不复制商标。

细部规范：白色与Color10浅蓝节点、深色/白色图标、16–32px内距、横纵路径和明确的分区标题；节点说明左对齐，真实连线避开文字和无关节点。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

官方技术图规范直接提供节点类型、嵌套、正交连接、字体与8px基础网格依据。本图为1600px画布的放大适配，非官方生产架构；IBM Plex Sans仅本机可用时使用，未打包字体或官方产品标志。
- IBM · Technical diagrams: https://www.ibm.com/design/language/infographics/technical-diagrams/design/
- IBM · 2x Grid: https://www.ibm.com/design/language/2x-grid/
- IBM · Color: https://www.ibm.com/design/language/color/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=112,360,352,96
chunks: Chunking / 解析与切分 | x/y/w/h=112,512,352,96
embed: Embeddings / 向量编码 | x/y/w/h=112,664,352,96
index: Vector index / 向量索引 | x/y/w/h=112,816,352,96
query: User query / 用户问题 | x/y/w/h=648,328,304,96
retrieve: Retriever / 相似度检索 | x/y/w/h=648,552,304,128
context: Context / 上下文构建 | x/y/w/h=648,848,304,112
llm: LLM / 生成模型 | x/y/w/h=1120,512,352,192
answer: Answer / 回答与引用 | x/y/w/h=1120,848,352,112

关系与专用路线：
docs → chunks | 288,460 → 288,508
chunks → embed | 288,612 → 288,660
embed → index | 288,764 → 288,812
query → retrieve | 800,428 → 800,548
retrieve → context | 800,684 → 800,844
context → llm | 956,904 → 1032,904 → 1032,608 → 1116,608
llm → answer | 1296,708 → 1296,844
index → retrieve | 468,864 → 568,864 → 568,616 → 644,616

节点ID前缀brand-ibm-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
