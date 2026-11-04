# arXiv 论文配图 · RAG 方法架构

生成一张可以直接用于机器学习论文的 RAG 检索增强生成方法示意图。用户需要的是论文里的 figure 视觉语言，不是 arXiv 网站界面，也不是 arXiv 官方模板。只输出完整、可编辑的 SVG XML。

## 视觉语言

- 1440×900，viewBox="0 0 1440 900"，纯白纸面，无阴影、渐变、装饰背景、大色块或产品 UI 卡片。
- 使用 Times New Roman, Times, Liberation Serif, serif 本地衬线字体栈；不加载外部字体。数学变量用斜体，标题和分面编号用粗体。保留原生 text / tspan，不把文字转成路径。
- 正文字色 #20242b、辅助说明 #515b69，线条 #414853。模块描边 1.5px，连接线 1.8px，圆角仅 3px。父级分面边界 #a8afb9、1.3px。
- 语义色节制使用：检索/编码浅蓝 #e8f0fa + #4b6c92 边框；上下文浅赭 #fbefd9 + #967235；生成浅紫 #eee9f6 + #7d6b98；输入输出白底灰边。颜色不是唯一编码，模块名称和线型必须在灰度打印时仍可区分。
- 采用真正的方法图结构：(a) 离线索引、(b) 在线检索与生成、(c) prompt 细节。每个分面都有短标题，节点紧凑，数学标记清晰。底部是 Figure 1. 图注，顶部不做海报式大标题。
- 标题 28px，分面标签 23px，节点名称 24px，变量 20–27px，辅助说明与图注 18–23px。在约 180mm 双栏通栏宽度下仍能阅读；单栏使用时需按内容拆图或重新排版。

## 内容与关系

离线索引：Documents → Chunking → Embeddings → Vector index。
在线回答：User query → Retriever → Context → LLM → Answer。
另以虚线箭头连接 Vector index → Retriever，表示使用已建索引查询。实线表示数据流，虚线表示索引读取，不表示训练过程。LLM 使用原问题与检索证据形成的 P(q, C) 作为输入。

节点内保留简洁数学说明：文档集合 D；chunk cᵢ；编码 eᵢ = E(cᵢ)；向量集合 V；问题 q；相似度 sim(E(q), eᵢ)；证据集合 C；条件生成 pθ(y | q, C)；输出 ŷ 与引用。
向量索引内部加一个小型向量矩阵示意，Chunking 内部展示三个分段 c₁/c₂/cₙ，Documents 使用原生几何文档图标。不要使用 emoji、位图或未经授权的品牌图形。

## 几何与信息布局

- (a) 外框 x=28,y=58,w=1384,h=210；标题基线 y=91。
- 上排节点全部 y=132,h=106：Documents x=64,w=216；Chunking x=340,w=230；Embeddings x=630,w=250；Vector index x=990,w=350。
- (b) 外框 x=28,y=286,w=1384,h=300；标题基线 y=320。
- 下排节点全部 y=406,h=110：User query x=64,w=186；Retriever x=330,w=190；Context x=600,w=200；LLM x=880,w=200；Answer x=1160,w=216。
- 所有相邻连接均从节点右侧中点到下个节点左侧中点。
- Vector index → Retriever 从 (1165,238) 经 (1165,358)、(425,358) 到 (425,406)；虚线标签位于 (807,347)。不穿过标题和节点。
- Context 下方用无箭头的细点线引出 (c) prompt 局部放大，不把这条注解线当作数据流。
- (c) x=28,y=624,w=810,h=170，标题 y=656，横线分隔。逐行展示 q、c₁、cₖ，与提示词、[1] 和 [k] 的证据片段。示意文本必须能独立编辑。
- 右下 x=884 开始放条件解码公式 ŷ = arg max_y pθ(y | q, C) 以及变量说明，底部放实线/虚线图例。
- 图注 y=840、871：Figure 1. Overview of a retrieval-augmented generation pipeline. 之后用一句话说明三个分面。
- 所有文字在画布和所属节点内，连线、箭头、标题、公式互不遮挡。节点文本至少离边框 12px。

## 原生编辑与安全

每个语义节点是独立 <g id="arxiv-node-…" data-node="true" data-label="…">；共 9 个节点。共 8 条数据连接使用 polyline 和内部 marker，位于节点后方。
每条连接带有效 data-sf-start-node / data-sf-end-node="#节点ID" 与 data-sf-start-anchor / data-sf-end-anchor="u v 0 0"，其中 u/v 为 0–1 边界比例；用于 JustSVG 拖动后更新连接。父分面、图注和放大注解独立分组，不包裹可编辑节点。
ID 唯一，内部 url(#id) 引用有效。不得使用 script、事件属性、foreignObject、外部 URL/字体/图片、动画或整图位图化。

这是原创的通用 RAG 演示架构，不声称复现特定论文算法，不包含实验结果或性能数字，也不使用 arXiv 官方认证表述。
参考阅读（仅用于理解学术方法图和主题，不加载进 SVG）：
- https://arxiv.org/html/2312.10997v5
- https://arxiv.org/html/2406.13249v1
