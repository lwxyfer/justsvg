# Replicate 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
采用当前Replicate官网实际洋红/橙红网点色场与白色代码/输出并列材料，不沿用推荐时的黑白极简印象。大幅白字与完整深洋红技术场、左列白色知识代码对象、中部问题/检索与右侧上下文/模型/回答形成不对称链路。摄入阶段用source/split/embed/index伪代码说明，生成块用带语法层次的综合代码，不画假的API调用成功/计数或嵌入官方生成照片。

细部规范：64px紧排双行白标题，原生pattern细点只近似实际网点，不用噪声滤镜；白面方角与细中性分隔、13–18px代码、24–28px信息标题。依赖线白色只走颜色场，代码注释保持语义而不充当装饰，所有白面随节点移动。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

有效官网截图显示大幅洋红/橙红渐变网点和白色代码面，和旧黑白印象不同。此图为RAG机制伪代码，不是Replicate SDK用法；不复制生成照片、官方标志、真实模型/调用数或性能。Basier Square及Freigeist仅本机优先，系统回退，无额外运行依赖。
- Replicate · 当前官网色场与API代码展示: https://replicate.com/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=96,300,352,112
chunks: Chunking / 解析与切分 | x/y/w/h=96,468,352,112
embed: Embeddings / 向量编码 | x/y/w/h=96,636,352,112
index: Vector index / 向量索引 | x/y/w/h=96,804,352,112
query: User query / 用户问题 | x/y/w/h=536,300,448,128
retrieve: Retriever / 相似度检索 | x/y/w/h=536,568,448,152
context: Context / 上下文构建 | x/y/w/h=1080,568,424,152
llm: LLM / 生成模型 | x/y/w/h=1080,824,424,192
answer: Answer / 回答与引用 | x/y/w/h=536,904,448,112

关系与专用路线：
docs → chunks | 260,416 → 260,464
chunks → embed | 260,584 → 260,632
embed → index | 260,752 → 260,800
query → retrieve | 760,432 → 760,564
retrieve → context | 988,644 → 1076,644
context → llm | 1292,724 → 1292,820
llm → answer | 1076,960 → 988,960
index → retrieve | 452,860 → 484,860 → 484,644 → 532,644

节点ID前缀brand-replicate-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
