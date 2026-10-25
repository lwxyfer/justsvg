# Apple 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
以Apple产品发布页和Apple Intelligence/芯片视觉为具体参考。1600×1100白色画布，84px两行产品式标题；左侧四级知识库窄列，中间查询/检索/上下文分级模块，右侧440px大型芯片作为焦点，底部独立回答。芯片通过精确引脚、金属渐变、深色内核和蓝紫粉橙边缘表达材料；不能使用九张等大卡片或一排通用蓝色图标。左侧文件堆叠、切分薄片、向量点阵、索引抽屉各自绘制；文字保持原生text。无品牌logo、位图和滤镜。

细部规范：芯片引脚使用冷银色渐变，金属封装有0.8px内缘高光，暗芯有细边倒角。保持克制的材质层次，不加光晕。 箭头使用markerUnits="userSpaceOnUse"，尺寸10px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

依据产品页的不等尺度焦点与留白，以及Apple Intelligence/Apple silicon的技术对象语言。此图为RAG内容转译，不复刻Apple的真实系统；Helvetica Neue近似本机字体，不分发SF字体。
- Apple · Mac 产品叙事: https://www.apple.com/mac/
- Apple · Intelligence 视觉: https://www.apple.com/apple-intelligence/
- Apple · PCC 技术图: https://security.apple.com/blog/pcc-security-research/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=96,394,306,112
chunks: Chunking / 解析与切分 | x/y/w/h=96,550,306,112
embed: Embeddings / 向量编码 | x/y/w/h=96,706,306,112
index: Vector index / 向量索引 | x/y/w/h=96,862,306,112
query: User query / 用户问题 | x/y/w/h=528,394,330,102
retrieve: Retriever / 相似度检索 | x/y/w/h=528,581,330,110
context: Context / 上下文构建 | x/y/w/h=528,782,330,110
llm: LLM / 生成模型 | x/y/w/h=986,410,440,440
answer: Answer / 回答与引用 | x/y/w/h=974,922,474,96

关系与专用路线：
docs → chunks | 249,510 → 249,546
chunks → embed | 249,666 → 249,702
embed → index | 249,822 → 249,858
query → retrieve | 693,500 → 693,577
retrieve → context | 693,695 → 693,778
index → retrieve | 406,918 → 470,918 → 470,636 → 524,636
context → llm | 862,837 → 922,837 → 922,630 → 982,630
llm → answer | 1206,854 → 1206,918

节点ID前缀brand-apple-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
