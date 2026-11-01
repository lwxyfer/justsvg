# Spotify 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
具体采用Spotify实际Web Player的深色层级、绿色强调、封面队列和圆形播放对象语言，将知识输入画成四条带原创几何封面的队列，中列是查询/检索/上下文，右侧大型绿色唱片式生成核心与深绿回答。保留原RAG文字与八条真实依赖，不放真实歌名、专辑照片、Spotify标志或虚构播放状态。不是把全部节点做成绿色卡片；绿色集中于生成焦点、检索动作和输出。

细部规范：深色表面用#121212/#242424分层，文字白/浅灰；原创封面图形、检索三角和唱片同心线体现音乐隐喻。绿色焦点上的文字加深以保证可读。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

参考实际Web Player的音乐浏览层级及官方设计指南中的色彩/字体说明。唱片和队列是RAG语义的原创静态转译，不是Spotify服务、真实曲库或可播放控件。Spotify Mix不分发，使用本机字体回退。
- Spotify · Web Player: https://open.spotify.com/
- Spotify · Design guidelines: https://developer.spotify.com/documentation/design

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=80,330,360,106
chunks: Chunking / 解析与切分 | x/y/w/h=80,490,360,106
embed: Embeddings / 向量编码 | x/y/w/h=80,650,360,106
index: Vector index / 向量索引 | x/y/w/h=80,810,360,106
query: User query / 用户问题 | x/y/w/h=600,330,350,112
retrieve: Retriever / 相似度检索 | x/y/w/h=600,568,350,156
context: Context / 上下文构建 | x/y/w/h=600,872,350,122
llm: LLM / 生成模型 | x/y/w/h=1140,476,300,300
answer: Answer / 回答与引用 | x/y/w/h=1110,872,360,122

关系与专用路线：
docs → chunks | 260,440 → 260,486
chunks → embed | 260,600 → 260,646
embed → index | 260,760 → 260,806
query → retrieve | 775,446 → 775,564
retrieve → context | 775,728 → 775,868
context → llm | 954,933 → 1030,933 → 1030,626 → 1136,626
llm → answer | 1290,780 → 1290,868
index → retrieve | 444,863 → 510,863 → 510,646 → 596,646

节点ID前缀brand-spotify-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
