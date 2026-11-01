# Cursor 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
具体参照当前Cursor官网的暖灰/暖白材料、克制句式标题和紧密的文件/上下文/代码排版，提取为开放式技术图，而非复制应用窗口。左侧为原生文件路径与知识处理列，中上问题汇入右侧文档检索与上下文源码，再流向左下代码生成和右下回答。文件、上下文与模型要有不同内容结构，保留sources/handbook.md与伪代码等示意材料。

细部规范：40px句式标题、浅石色文件域、13–16px真实文件路径和伪代码，节点标题22–25px。去掉伪窗口栏和外框，文档行开放、代码块带细分隔，正文清楚。所有语义对象拥有自己的背景并随节点移动，绑定边界与实际对象一致。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

当前官网暖白#f7f7f4及任务/文件/上下文结构是参考；官网画作与专有CursorGothic不复制。图为原创RAG技术结构，代码/文件均为示意，不代表真实Cursor配置或执行状态。此次重画取代被用户否定的稀疏伪界面。
- Cursor · 当前官网与智能体工作台: https://cursor.com/
- 社区选取依据 · Cursor Insights: https://cursor.com/insights
- Cursor · 社区活动: https://cursor.com/community

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=96,320,296,112
chunks: Chunking / 解析与切分 | x/y/w/h=96,484,296,112
embed: Embeddings / 向量编码 | x/y/w/h=96,648,296,112
index: Vector index / 向量索引 | x/y/w/h=96,812,296,112
query: User query / 用户问题 | x/y/w/h=472,324,376,124
retrieve: Retriever / 相似度检索 | x/y/w/h=1000,324,440,144
context: Context / 上下文构建 | x/y/w/h=1000,568,440,172
llm: LLM / 生成模型 | x/y/w/h=472,720,376,248
answer: Answer / 回答与引用 | x/y/w/h=1000,840,440,128

关系与专用路线：
docs → chunks | 244,436 → 244,480
chunks → embed | 244,600 → 244,644
embed → index | 244,764 → 244,808
query → retrieve | 852,386 → 996,386
retrieve → context | 1220,472 → 1220,564
context → llm | 996,656 → 920,656 → 920,692 → 660,692 → 660,716
llm → answer | 852,904 → 996,904
index → retrieve | 396,868 → 440,868 → 440,508 → 960,508 → 960,436 → 996,436

节点ID前缀brand-cursor-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
