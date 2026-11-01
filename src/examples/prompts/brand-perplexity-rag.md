# Perplexity 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
采用Perplexity官方Hub页底部链接的Brand Guidelines，严格以Off White #FBFAF4、Off Black #091717、Turquoise #20808D为主，配Sans/Serif/Mono的编辑式层次。四份来源研究页形成左侧知识材料，右侧问题进入检索、上下文、模型，最后输出横向回答与出处。文档页、切片摘录、向量结构、索引书目及引用正文各有明确内容，不画假搜索按钮或照搬未观察的产品界面。

细部规范：58px清楚的无衬线标题、细青绿规则与安静纸白，30px衬线用于研究页，等宽字只承担路径和字段；原生纸页/索引结构、宽幅有据回答，功能青绿深于装饰。橙色只作少量摘录标识，不能压过青绿。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

官方Hub页尾确认链接至该品牌指南；指南色号和字体层级由公开网页索引正文读取。Chrome主站为验证页、指南连接失败，未将这些页面当作有效截图；本图仅是经确认的色彩/字体原则下原创研究排版，不宣称复刻产品UI。专有字体本机优先、系统与Georgia回退，未分发；无真实引用文章或生成效果。
- Perplexity · 官方品牌入口（页尾Brand Guidelines）: https://www.perplexity.ai/hub
- Perplexity · 品牌色彩指南: https://live.standards.site/perplexity/color
- Perplexity · 品牌字体指南: https://live.standards.site/perplexity/type

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=72,272,344,176
chunks: Chunking / 解析与切分 | x/y/w/h=512,272,344,176
embed: Embeddings / 向量编码 | x/y/w/h=512,544,344,176
index: Vector index / 向量索引 | x/y/w/h=72,544,344,176
query: User query / 用户问题 | x/y/w/h=1008,272,512,112
retrieve: Retriever / 相似度检索 | x/y/w/h=1008,480,512,160
context: Context / 上下文构建 | x/y/w/h=1008,736,240,144
llm: LLM / 生成模型 | x/y/w/h=1344,736,176,144
answer: Answer / 回答与引用 | x/y/w/h=72,920,1448,112

关系与专用路线：
docs → chunks | 420,360 → 508,360
chunks → embed | 684,452 → 684,540
embed → index | 508,632 → 420,632
query → retrieve | 1264,388 → 1264,476
retrieve → context | 1124,644 → 1124,732
context → llm | 1252,808 → 1340,808
llm → answer | 1432,884 → 1432,916
index → retrieve | 244,724 → 244,816 → 944,816 → 944,560 → 1004,560

节点ID前缀brand-perplexity-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
