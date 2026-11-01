# Slack 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
参考当前Slack官网白底重字标题、紫色产品框架和消息阅读结构。四个知识附件位于紫色来源侧栏；问题是带彩色原创几何头像的消息，检索是工作流消息，上下文是附件正文，大型生成消息位于中下，右侧为带引用段的回答线程。紫色用于整个工作面，青/绿/黄用于语义头像而非全图循环染色。保留真实8条RAG依赖，不伪造在线人数、未读数和聊天时间，不复制Slack井号商标。

细部规范：工作区保留顶栏、来源栏和白色消息区三层。头像为圆角原创几何，白色消息保留明确正文和附件区分；来源卡与线程的尺寸不同。辅助字色必须在浅紫与白底可读。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

依据实际官网中的紫色产品框架、白色工作面和粗字标题，不把历史茄紫当作唯一当前规范。头像/消息/附件为原创图示，无真实团队数据。当前官网显示Salesforce字体，SVG用本机字体近似并回退，不分发专有字体。
- Slack · 当前官网与产品工作区: https://slack.com/
- Slack · Media Kit 产品截图: https://slack.com/media-kit

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=112,386,280,88
chunks: Chunking / 解析与切分 | x/y/w/h=112,528,280,88
embed: Embeddings / 向量编码 | x/y/w/h=112,670,280,88
index: Vector index / 向量索引 | x/y/w/h=112,812,280,88
query: User query / 用户问题 | x/y/w/h=492,386,360,104
retrieve: Retriever / 相似度检索 | x/y/w/h=948,386,500,104
context: Context / 上下文构建 | x/y/w/h=948,578,500,112
llm: LLM / 生成模型 | x/y/w/h=492,772,360,160
answer: Answer / 回答与引用 | x/y/w/h=948,792,500,140

关系与专用路线：
docs → chunks | 252,478 → 252,524
chunks → embed | 252,620 → 252,666
embed → index | 252,762 → 252,808
query → retrieve | 856,426 → 944,426
retrieve → context | 1198,494 → 1198,574
context → llm | 944,634 → 900,634 → 900,742 → 672,742 → 672,768
llm → answer | 856,862 → 944,862
index → retrieve | 396,856 → 416,856 → 416,528 → 916,528 → 916,466 → 944,466

节点ID前缀brand-slack-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
