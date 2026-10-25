# Stripe 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
具体参考Stripe官网基础设施叙事：深海军蓝大字、斜切紫/蓝/珊瑚渐变、精密白色数据模块。左侧是垂直知识输入链，中间是不等尺度的查询/检索核心/上下文，右侧深色生成接口与白色输出；以数据流而非九张等大卡片组织内容。模型展示API路径和处理层，渐变仅用于品牌场域与基础设施焦点，不做渐变文字、无意义光晕或虚构金额。渐变、文件、核心和连接全部原生SVG，不嵌入图片和专有字体。

细部规范：斜切色域叠加受控原生径向渐变，形成流体色彩；文件、切片、向量和索引用独立细线图标，拒绝X和空方框占位。 箭头使用markerUnits="userSpaceOnUse"，尺寸9px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

以Stripe官网的斜切渐变、深蓝排版、产品与开发者基础设施层级为参考；转译为RAG数据流，不是支付生产架构或官方模板。字体采用本机近似。
- Stripe · 基础设施视觉: https://stripe.com/
- Stripe · 品牌资源: https://stripe.com/newsroom/brand-assets

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=96,362,304,108
chunks: Chunking / 解析与切分 | x/y/w/h=96,516,304,108
embed: Embeddings / 向量编码 | x/y/w/h=96,670,304,108
index: Vector index / 向量索引 | x/y/w/h=96,824,304,108
query: User query / 用户问题 | x/y/w/h=600,362,340,94
retrieve: Retriever / 相似度检索 | x/y/w/h=600,546,340,208
context: Context / 上下文构建 | x/y/w/h=600,860,340,112
llm: LLM / 生成模型 | x/y/w/h=1120,478,350,258
answer: Answer / 回答与引用 | x/y/w/h=1120,874,350,144

关系与专用路线：
docs → chunks | 248,474 → 248,512
chunks → embed | 248,628 → 248,666
embed → index | 248,782 → 248,820
query → retrieve | 770,460 → 770,542
retrieve → context | 770,758 → 770,856
index → retrieve | 404,878 → 500,878 → 500,650 → 596,650
context → llm | 944,916 → 1030,916 → 1030,607 → 1116,607
llm → answer | 1295,740 → 1295,870

节点ID前缀brand-stripe-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
