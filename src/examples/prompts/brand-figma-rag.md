# Figma 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
具体参考Figma/FigJam的多人创作画布，而非只借用五色logo：暖白画布、大字、颜色鲜明的组件、文件/切片/向量组件/索引等不同图形，以及两个人工示意的彩色协作指针。知识链向右分叉进入检索和生成，标题、框架、组件与结果具有不同尺度。角色色固定，不按序号循环；组件菱形和光标是自主绘制几何，不使用Figma标志，不把实际编辑器选框和控制点写入SVG。所有内容与连接原生可编辑。

细部规范：三个输入块统一88px文字内距、组件图标统一1.5px描边；协作指针加2px白边以区分画布，指针只是静态示意。 箭头使用markerUnits="userSpaceOnUse"，尺寸9px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

转译FigJam的协作、组件、连线和色块组织。画面中的指针/名字是说明素材，不是实时协作者；不用logo或假选框替代品牌构图，字体采用本机近似。
- Figma · 品牌使用指南: https://www.figma.com/using-the-figma-brand/
- Figma · FigJam 协作画布: https://www.figma.com/figjam/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=96,362,280,124
chunks: Chunking / 解析与切分 | x/y/w/h=96,586,280,124
embed: Embeddings / 向量编码 | x/y/w/h=96,810,280,124
index: Vector index / 向量索引 | x/y/w/h=500,810,260,168
query: User query / 用户问题 | x/y/w/h=500,362,260,124
retrieve: Retriever / 相似度检索 | x/y/w/h=880,476,260,202
context: Context / 上下文构建 | x/y/w/h=880,842,260,124
llm: LLM / 生成模型 | x/y/w/h=1240,650,260,160
answer: Answer / 回答与引用 | x/y/w/h=1240,888,260,130

关系与专用路线：
docs → chunks | 236,490 → 236,582
chunks → embed | 236,714 → 236,806
embed → index | 380,872 → 496,872
query → retrieve | 764,424 → 820,424 → 820,550 → 876,550
index → retrieve | 764,894 → 820,894 → 820,626 → 876,626
retrieve → context | 1010,682 → 1010,838
context → llm | 1144,904 → 1190,904 → 1190,730 → 1236,730
llm → answer | 1370,814 → 1370,884

节点ID前缀brand-figma-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
