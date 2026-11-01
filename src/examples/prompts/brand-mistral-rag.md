# Mistral 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
参照Mistral官方Brand页的暖白、大幅紧排黑字、橙色强调和原生像素模型语言。知识摄入按四级阶梯下降，文档/切片/向量/索引用真正的像素几何表达；下方查询和索引汇入检索，再经上下文到分层橙色综合对象和回答。轮廓采用直角台阶，不能用通用圆角卡片替代。不是复制像素猫、M字标或官方模型插图，所有像素对象按RAG语义原创。

细部规范：76px两行紧排标题，橙色底面强调第二行；12px几何单元、低饱和暖纸、像素模型与直角依赖；节点标题24–30px，文字保持text，像素不用于长正文。所有台阶形完整边界与绑定一致。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

实际Brand页已打开，Models部分明确采用像素插图。图中对象是原创技术几何，不复用像素猫、商标、官方模型图、照片、选择控制点或协作者指针；暖色按实际品牌材料近似。专有字体不分发，本机无衬线回退；内容不是Mistral生产架构或实际模型能力。
- Mistral · 官方品牌与像素模型视觉: https://mistral.ai/brand/
- Mistral · 当前官网: https://mistral.ai/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=72,304,240,176
chunks: Chunking / 解析与切分 | x/y/w/h=376,352,240,176
embed: Embeddings / 向量编码 | x/y/w/h=680,400,240,176
index: Vector index / 向量索引 | x/y/w/h=984,448,264,176
query: User query / 用户问题 | x/y/w/h=72,744,240,128
retrieve: Retriever / 相似度检索 | x/y/w/h=376,704,336,208
context: Context / 上下文构建 | x/y/w/h=808,744,240,128
llm: LLM / 生成模型 | x/y/w/h=1160,736,352,176
answer: Answer / 回答与引用 | x/y/w/h=1160,968,352,80

关系与专用路线：
docs → chunks | 316,392 → 340,392 → 340,440 → 372,440
chunks → embed | 620,440 → 648,440 → 648,488 → 676,488
embed → index | 924,488 → 952,488 → 952,536 → 980,536
query → retrieve | 316,808 → 372,808
retrieve → context | 716,808 → 804,808
context → llm | 1052,808 → 1156,808
llm → answer | 1336,916 → 1336,964
index → retrieve | 1116,628 → 1116,664 → 544,664 → 544,700

节点ID前缀brand-mistral-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
