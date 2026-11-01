# Miro 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
具体依据当前Miro官网的新视觉：衬线大标题、暖纸色、淡点阵白色画布、黄色品牌点缀与蓝紫流程连接。顶部四个可编辑便签承载知识链，下方问题对话、菱形检索、上下文文档、深色模型工作块和黄色回答形成清晰路径。各对象有不同形状和尺度，不复制FigJam协作指针，不画虚构协作者和人数。标题使用本机Georgia近似官网Apris衬线气质，正文无衬线。

细部规范：画布点阵只在工作区出现；便签有轻微折角但无假投影，纸张/菱形/对话框的轮廓独立。深色模型用黄色图形作焦点；蓝紫箭头对齐真实几何端点。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

实际官网已采用Apris衬线标题、暖白点阵工作面和蓝紫连接，不能只沿用旧版蓝黄印象。本图为原生图解转译，Georgia/Roobert系统回退，不复制品牌标志或照片，不声称专有字形一致。
- Miro · 当前官网 Intelligent Canvas 视觉: https://miro.com/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=104,306,240,152
chunks: Chunking / 解析与切分 | x/y/w/h=456,306,240,152
embed: Embeddings / 向量编码 | x/y/w/h=808,306,240,152
index: Vector index / 向量索引 | x/y/w/h=1160,306,240,152
query: User query / 用户问题 | x/y/w/h=104,684,280,144
retrieve: Retriever / 相似度检索 | x/y/w/h=496,650,280,212
context: Context / 上下文构建 | x/y/w/h=888,684,232,144
llm: LLM / 生成模型 | x/y/w/h=1224,654,248,204
answer: Answer / 回答与引用 | x/y/w/h=1160,898,312,88

关系与专用路线：
docs → chunks | 348,382 → 452,382
chunks → embed | 700,382 → 804,382
embed → index | 1052,382 → 1156,382
query → retrieve | 388,756 → 492,756
retrieve → context | 780,756 → 884,756
context → llm | 1124,756 → 1220,756
llm → answer | 1348,862 → 1348,894
index → retrieve | 1280,462 → 1280,520 → 636,520 → 636,646

节点ID前缀brand-miro-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
