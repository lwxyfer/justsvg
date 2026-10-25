# Vercel 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
具体参考Vercel Geist的高对比黑白、严格网格、开发者排版和部署依赖图：上方四个构建阶段，下方请求/检索/上下文连接右侧生成与输出。网格作为真正的图坐标场存在，节点沿网格对齐，文件路径使用等宽文字；模型采用线框计算对象和代码分区，输出用蓝色事件流状态强调；补充项目、分支、Preview上下文。对象采用6px基础表面与12px模型表面；灰阶区分背景/边界/次要文字/正文，文件图标、路径、搜索函数与端口都承担语义。不能用空矩形加网格冒充完整品牌设计。黑色界面不能只靠三角logo识别，禁止霓虹、厚重投影与泛蓝科技装饰；灰阶箭头至少3:1，正文4.5:1。Geist可用时使用，否则本机回退，不加载外部字体。

细部规范：Geist表面层级：基础对象6px圆角，模型12px圆角；项目/分支/Preview上下文、文件图标与路径、分区代码和事件流输出丰富信息层级。网格与源列对齐，连线有静态端口，非实际编辑控制点。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

官方Geist明确以高对比色彩、网格及开发者字体组织视觉；本图按Materials的6/12px表面角色、字体的标题/标签/代码层级和色彩分工细化部署DAG。项目、分支和Preview均为图示，不是真实Vercel部署或运行状态。
- Vercel · Geist 设计系统: https://vercel.com/geist/introduction
- Vercel · 网格: https://vercel.com/geist/grid
- Vercel · 色彩: https://vercel.com/geist/colors
- Vercel · 表面材料: https://vercel.com/geist/materials
- Vercel · 字体层级: https://vercel.com/geist/typography

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=88,348,250,120
chunks: Chunking / 解析与切分 | x/y/w/h=432,348,250,120
embed: Embeddings / 向量编码 | x/y/w/h=776,348,250,120
index: Vector index / 向量索引 | x/y/w/h=1120,348,310,120
query: User query / 用户问题 | x/y/w/h=88,708,290,116
retrieve: Retriever / 相似度检索 | x/y/w/h=520,636,322,132
context: Context / 上下文构建 | x/y/w/h=520,884,322,132
llm: LLM / 生成模型 | x/y/w/h=1100,676,340,176
answer: Answer / 回答与引用 | x/y/w/h=1100,888,340,136

关系与专用路线：
docs → chunks | 342,408 → 428,408
chunks → embed | 686,408 → 772,408
embed → index | 1030,408 → 1116,408
index → retrieve | 1275,472 → 1275,556 → 681,556 → 681,632
query → retrieve | 382,766 → 450,766 → 450,702 → 516,702
retrieve → context | 681,772 → 681,880
context → llm | 846,950 → 992,950 → 992,764 → 1096,764
llm → answer | 1270,856 → 1270,884

节点ID前缀brand-vercel-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
