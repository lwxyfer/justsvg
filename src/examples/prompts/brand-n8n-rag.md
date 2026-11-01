# n8n 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
同时参照当前n8n官网浅色首屏及官网下方真实深色工作流示例：灰白大字界面外场、深灰点阵工作面、紧密的图标操作块、端口和粉色重点。上方知识步骤有中央语义图形和下置文字，下方问题与索引汇入较大的检索节点，再到上下文和粉色模型代码。明确区分主站浅色背景与深色工作流材质，不沿用旧暗紫品牌印象。

细部规范：55px两行紧排黑标题；深色点阵仅用于工作流，圆角28外域/16操作块，端口10px原生marker。知识节点中央图形、下方标签；模型展示prompt+context到response，粉色集中于综合对象，功能线浅中性以保持清楚。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

Oct28补采官网工作流区能看到深色点阵、图标居中节点和侧边端口；不是把先前浅色首屏当完整工作流编辑器。n8n Baumer字体不分发，系统回退。原生端口属于图示，不是选择辅助框；无真实执行状态、星数或第三方服务集成。
- n8n · 当前官网: https://n8n.io/
- 近期社区选取依据 · 官方2026社区研究: https://blog.n8n.io/lets-talk-about-n8n-community-research/
- n8n · 2026社区讨论与活动: https://community.n8n.io/top

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=112,344,248,176
chunks: Chunking / 解析与切分 | x/y/w/h=464,344,248,176
embed: Embeddings / 向量编码 | x/y/w/h=816,344,248,176
index: Vector index / 向量索引 | x/y/w/h=1168,344,248,176
query: User query / 用户问题 | x/y/w/h=112,716,248,112
retrieve: Retriever / 相似度检索 | x/y/w/h=464,684,344,176
context: Context / 上下文构建 | x/y/w/h=920,716,248,112
llm: LLM / 生成模型 | x/y/w/h=1264,684,248,176
answer: Answer / 回答与引用 | x/y/w/h=920,936,592,80

关系与专用路线：
docs → chunks | 364,428 → 460,428
chunks → embed | 716,428 → 812,428
embed → index | 1068,428 → 1164,428
query → retrieve | 364,772 → 460,772
retrieve → context | 812,772 → 916,772
context → llm | 1172,772 → 1260,772
llm → answer | 1388,864 → 1388,932
index → retrieve | 1292,524 → 1292,596 → 636,596 → 636,680

节点ID前缀brand-n8n-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
