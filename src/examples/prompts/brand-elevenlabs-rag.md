# ElevenLabs 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
明确采用ElevenLabs官方Brand页的ElevenAgents方向：浅色母品牌页面、蓝色主调/绿青层次、圆/球作为Agent图形。标题克制大字，知识片段列与问题汇入检索、上下文，再进入直径416px蓝绿球形综合对象，底部宽幅回答。不要混用ElevenCreative橙色Chladni和ElevenAPI黑白体系；球是原创原生几何材质，不复制官方声球位图，也不画播放按钮或11标志。

细部规范：60px两行常规标题，窄知识片段与开放注释，球使用受控原生径向层次和深色中心上的清晰白字承载核心，关系端点在真实圆周4px之外。辅助信号条是知识综合的静态图解，不表示真实音频、可播放状态或语音功能。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

官方规范明确Agents为蓝色/圆球，Creative为橙色/Chladni，API为黑白；本图只采Agents分支，不声称整个品牌只有一种色板。原生几何适配不复制声球纹理或照片。仍为同9节点RAG内容，不是语音产品真实架构；Waldenburg本机优先，系统回退。
- ElevenLabs · 官方品牌规范（ElevenAgents）: https://elevenlabs.io/brand
- ElevenLabs · 当前产品视觉: https://elevenlabs.io/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=72,288,288,112
chunks: Chunking / 解析与切分 | x/y/w/h=72,456,288,112
embed: Embeddings / 向量编码 | x/y/w/h=72,624,288,112
index: Vector index / 向量索引 | x/y/w/h=72,792,288,112
query: User query / 用户问题 | x/y/w/h=488,280,544,120
retrieve: Retriever / 相似度检索 | x/y/w/h=488,520,224,136
context: Context / 上下文构建 | x/y/w/h=808,520,224,136
llm: LLM / 生成模型 | x/y/w/h=1096,456,416,416
answer: Answer / 回答与引用 | x/y/w/h=488,932,1024,108

关系与专用路线：
docs → chunks | 216,404 → 216,452
chunks → embed | 216,572 → 216,620
embed → index | 216,740 → 216,788
query → retrieve | 600,404 → 600,516
retrieve → context | 716,588 → 804,588
context → llm | 1036,588 → 1064,588 → 1064,664 → 1092,664
llm → answer | 1304,876 → 1304,928
index → retrieve | 364,848 → 424,848 → 424,588 → 484,588

节点ID前缀brand-elevenlabs-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
