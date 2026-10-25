# 黑白论文 · RAG 架构图

生成一张 RAG 检索增强生成架构图。内容为演示结构，不是生产部署或性能数据。
信息与方向必须准确：
离线索引：Documents（文档与知识库）→ Chunking（解析与切分）→ Embeddings（向量编码）→ Vector index（向量索引）。
在线回答：User query（用户问题）→ Retriever（相似度检索）→ Context（上下文构建）→ LLM（生成模型）→ Answer（回答与引用）。
Vector index 额外向 Retriever 提供检索内容，以绕行的正交折线连接；这条线不得穿过节点或标题。
阶段标题分别为「离线索引 / INDEXING」与「在线回答 / ANSWERING」。

风格要求：
黑白学术论文插图。白底，黑灰两级，Georgia/宋体衬线标题，细线方框和居中标签。顶部有 Figure 1. 与简短题名，下方正文型说明。仅使用 1.2px 方框、实心小端口和开放箭头，不使用彩色、阴影或圆角。节点标题居中排列，保留充足留白。

画布为 1200×800，viewBox="0 0 1200 800"。页边距至少 56px。
上排四个节点：x=60、340、620、900，y=250，宽240、高112。
下排五个节点：x=60、290、520、750、980，y=550，宽160、高112。
相邻节点水平连接。向量索引至 Retriever 的折线从 (1020,362) 经 (1020,440)、(370,440) 到 (370,550)。
阶段标题在 y=215 和 y=505；y=700 之后仅放图例和演示说明。标题及副标题位于 y=60–155，不得与图内容重叠。
节点标题字号 20–22px，中文说明 14–15px，必须在卡片范围内留有至少 12px 边距。下排长英文标题需要用较小字号或换行，不得越界。

只输出完整 SVG XML，不要 Markdown 代码块。
使用原生 rect、g、text、line/polyline/path、defs/marker；文字保留为 text，不转路径。
每个节点使用带唯一 id、data-label、data-node="true" 的独立 g。连线在节点后方，箭头 marker 用本地 url(#id) 引用。
每条线可附带 data-sf-start-node="#节点id"、data-sf-end-node="#节点id"，以及 data-sf-start-anchor / data-sf-end-anchor="u v 0 0"，u/v 为 0–1 归一化边界锚点，方便在 JustSVG 中继续联动编辑。
使用系统字体及回退字体。不使用 script、事件属性、foreignObject、外部 URL/图片/字体、CSS @规则、动画或位图。
确保所有 ID 唯一，所有内部引用存在。导出文件需能在浏览器直接打开，节点可单独拖动、文字可单独修改。
