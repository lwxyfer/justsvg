# Duolingo 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
具体参考Duolingo当前官网的白底、绿色主要按钮、圆润重字与明确的按钮底边。知识链采用错落的学习站点，查询为蓝色对话块、检索为紫色切角宝石、上下文为白色内容页，右侧绿色圆润生成徽章连接绿色回答。原生几何图标表达文件/切分/向量/索引，不临摹Duo猫头鹰或人物。所有功能字保持可读；饱和绿上的文字使用深绿，这是可读性适配。

细部规范：模块使用圆角20–28px和2.5–3px轮廓；底边是官网按钮实体厚度的转译而非模糊投影。图标采用圆端厚线，学习站点错落连接，拒绝泛化的九张绿色卡片。 箭头使用markerUnits="userSpaceOnUse"，尺寸10px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

实际官网可见白底、绿色按钮、圆润标题与清晰底边；旧design.duolingo.com指南已跳转设计博客，因此不冒称读取了仍有效的旧token页。图中无官方吉祥物/人物，字形本机近似，学习站点仅为知识流的原创图示隐喻。
- Duolingo · Official homepage: https://www.duolingo.com/
- Duolingo · Design articles: https://blog.duolingo.com/hub/design/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=84,356,270,112
chunks: Chunking / 解析与切分 | x/y/w/h=230,520,270,112
embed: Embeddings / 向量编码 | x/y/w/h=84,684,270,112
index: Vector index / 向量索引 | x/y/w/h=230,848,270,112
query: User query / 用户问题 | x/y/w/h=650,356,320,120
retrieve: Retriever / 相似度检索 | x/y/w/h=650,566,320,164
context: Context / 上下文构建 | x/y/w/h=650,870,320,120
llm: LLM / 生成模型 | x/y/w/h=1110,512,360,252
answer: Answer / 回答与引用 | x/y/w/h=1110,870,360,120

关系与专用路线：
docs → chunks | 219,472 → 219,494 → 365,494 → 365,516
chunks → embed | 365,636 → 365,658 → 219,658 → 219,680
embed → index | 219,800 → 219,822 → 365,822 → 365,844
query → retrieve | 810,480 → 810,562
retrieve → context | 810,734 → 810,866
context → llm | 974,930 → 1030,930 → 1030,638 → 1106,638
llm → answer | 1290,768 → 1290,866
index → retrieve | 504,904 → 568,904 → 568,648 → 646,648

节点ID前缀brand-duolingo-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
