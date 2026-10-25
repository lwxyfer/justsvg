# Claude 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
参考Claude/Anthropic的温暖编辑气质，构建一张有阅读节奏的图：大幅衬线双行标题、左侧知识手册、中间轻量问题气泡与开放式检索/上下文注释、陶土色圆形生成核心、右侧占主要阅读面积的回答稿纸。使用奶油纸、细暖灰线、陶土连接；知识、问题、推理、回答不使用相同容器和字体层级。76px Georgia标题、开放流程31px衬线、辅助文字无衬线；取消上一版两条大燕麦色托盘。所有纸张和线条为清晰几何，禁止噪声滤镜和伪手绘。

细部规范：知识手册使用陶土色书签小图标，稿纸顶端使用细引线；保持温暖纸面、衬线正文和安静的留白。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

官网的暖纸色、燕麦色、陶土色及衬线/无衬线对照作为材料与阅读层级依据；本图采用知识手册和回答稿纸重新组织RAG，不声称复刻专有字体。
- Claude · 官方产品视觉: https://claude.com/
- Anthropic · 编辑与研究视觉: https://www.anthropic.com/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=106,400,270,108
chunks: Chunking / 解析与切分 | x/y/w/h=106,550,270,108
embed: Embeddings / 向量编码 | x/y/w/h=106,700,270,108
index: Vector index / 向量索引 | x/y/w/h=106,850,270,108
query: User query / 用户问题 | x/y/w/h=500,400,370,112
retrieve: Retriever / 相似度检索 | x/y/w/h=500,600,330,118
context: Context / 上下文构建 | x/y/w/h=500,838,330,118
llm: LLM / 生成模型 | x/y/w/h=870,664,208,208
answer: Answer / 回答与引用 | x/y/w/h=1130,398,404,606

关系与专用路线：
docs → chunks | 241,512 → 241,546
chunks → embed | 241,662 → 241,696
embed → index | 241,812 → 241,846
query → retrieve | 665,516 → 665,596
retrieve → context | 665,722 → 665,834
context → llm | 834,897 → 850,897 → 850,768 → 866,768
llm → answer | 1082,768 → 1126,768
index → retrieve | 380,904 → 444,904 → 444,659 → 496,659

节点ID前缀brand-claude-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
