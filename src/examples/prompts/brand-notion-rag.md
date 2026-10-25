# Notion 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
用户明确指定Notion官网品牌视觉，参考官方Projects页白纸黑墨和少量黄色的几何插画，而不是Notion编辑器。白底84px两行重字标题，文档、纸片、向量网络、抽屉分别绘制为有细节的墨线对象；左侧四级知识链无卡片背景。查询用带尾巴的纸质对话框，检索用勾选清单，上下文用折页文档，生成用展开的纸质知识册和黄色格窗对象，回答用大幅白纸。2.8–3px黑墨对象轮廓、2–2.5px内部线、2.3px黑色关系线；黑字正文、灰色辅文、黄色只点亮切片/勾选/格窗，保留白纸面积。禁止数据库列名、Aa属性、Source/Status、Share/New、假编辑器侧栏或控件；不要靠画N标志、粗框卡片或给每个节点加同样图标冒充Notion。全部图形文字保持可编辑的原生SVG，不做噪声滤镜或位图。

细部规范：官网纸墨对象：2.8–3px外轮廓、2–2.5px内部细节、2.3px关系线；重字标题、展开的知识册、分层文档与少量黄色格窗。移除数据库列名、属性和假产品控件；索引供给标签紧邻真实路径。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

用户已明确选择Notion官网品牌视觉。参考官方Projects页纸墨插画的有分量黑线、纸张与格窗对象和少量黄色；据此创作知识链、勾选清单、稿纸与展开的知识册对象。图中不再模拟数据库和编辑器控件，不使用官方标志或真实产品数据；这是原生SVG品牌风格转译，不是官方插画原稿。
- Notion · Projects 数据库与看板: https://www.notion.com/product/projects
- Notion · 官方产品视觉与插画: https://www.notion.com/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=92,342,340,118
chunks: Chunking / 解析与切分 | x/y/w/h=92,502,340,118
embed: Embeddings / 向量编码 | x/y/w/h=92,662,340,118
index: Vector index / 向量索引 | x/y/w/h=92,822,340,118
query: User query / 用户问题 | x/y/w/h=536,342,350,118
retrieve: Retriever / 相似度检索 | x/y/w/h=536,560,350,126
context: Context / 上下文构建 | x/y/w/h=536,812,350,126
llm: LLM / 生成模型 | x/y/w/h=1006,462,430,250
answer: Answer / 回答与引用 | x/y/w/h=1044,820,420,174

关系与专用路线：
docs → chunks | 260,464 → 260,498
chunks → embed | 260,624 → 260,658
embed → index | 260,784 → 260,818
query → retrieve | 711,464 → 711,556
retrieve → context | 711,690 → 711,808
context → llm | 890,875 → 952,875 → 952,587 → 1002,587
llm → answer | 1221,716 → 1221,764 → 1254,764 → 1254,816
index → retrieve | 436,881 → 480,881 → 480,623 → 532,623

节点ID前缀brand-notion-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
