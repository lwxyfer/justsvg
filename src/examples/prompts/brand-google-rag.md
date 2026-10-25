# Google 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
具体参考Google品牌几何与Material You表现性形状。上方知识链使用不同轮廓：蓝色文档、红色切片、黄色向量花形、绿色索引胶囊；下方大圆形Retriever连接搜索框、上下文、模型与输出，形成不等尺度的阅读节奏。语义色固定：文档/问题蓝，切分红，向量/上下文黄，索引/回答绿；模型蓝。禁止按数组位置循环配色，禁止把所有节点做成相同圆角矩形。深色同色相字保证对比；Google Sans存在时使用，否则本机回退。

细部规范：Material八瓣花形采用连续圆润轮廓；向量用三个相连数据点、检索用放大镜、生成用四瓣星，避免占位加号。 箭头使用markerUnits="userSpaceOnUse"，尺寸12px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

把Google的简单几何、四色与Material的表达性形状落实为节点轮廓、语义映射和不同尺度；不是Google官方架构图标准。
- Google · 品牌几何: https://design.google/library/evolving-google-identity
- Google · Material You: https://design.google/library/making-material-you
- Google · 表现性设计: https://design.google/about

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=80,320,280,194
chunks: Chunking / 解析与切分 | x/y/w/h=448,320,264,194
embed: Embeddings / 向量编码 | x/y/w/h=800,300,270,234
index: Vector index / 向量索引 | x/y/w/h=1174,312,288,218
query: User query / 用户问题 | x/y/w/h=80,704,348,110
retrieve: Retriever / 相似度检索 | x/y/w/h=526,622,260,260
context: Context / 上下文构建 | x/y/w/h=880,686,270,132
llm: LLM / 生成模型 | x/y/w/h=876,920,278,110
answer: Answer / 回答与引用 | x/y/w/h=1250,838,270,192

关系与专用路线：
docs → chunks | 364,417 → 444,417
chunks → embed | 716,417 → 796,417
embed → index | 1074,417 → 1170,417
query → retrieve | 432,759 → 522,759
retrieve → context | 790,752 → 876,752
context → llm | 1015,822 → 1015,916
llm → answer | 1158,975 → 1246,975
index → retrieve | 1318,534 → 1318,576 → 656,576 → 656,618

节点ID前缀brand-google-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
