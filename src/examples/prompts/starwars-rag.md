# 星战 · 银河指挥部 · RAG 架构风格

请输出完整、可编辑原生SVG。1600×1100，viewBox="0 0 1600 1100"。这是非官方视觉研究与演示架构，不是该品牌/作品真实系统；不虚构实验结果或投资结论。

## 视觉方向
黑色星空，巨型镂空黄字、切角指挥面板、青色战术路径，中央圆形战斗空间站作为LLM；左侧四级档案、中央查询/检索/上下文，右侧引用通讯。空间站应有圆形凹盘、赤道结构和技术刻线，但不遮挡标签。不是黄色标题加通用卡片。

配色：#060a12、#ffe34b、#8ee7ed、#101c2a。节点有不同尺寸、轮廓和信息角色，不能只替换通用卡片的颜色。参考Star Wars官方Databank的黑色、切角信息面板与战斗空间站几何，原创转译成RAG战术图；非官方同人风格研究，不复刻影片字幕或官方徽记。

## 内容与几何
docs: Documents / 文档与知识库；x/y/w/h=80/350/280/108
chunks: Chunking / 解析与切分；x/y/w/h=80/510/280/108
embed: Embeddings / 向量编码；x/y/w/h=80/670/280/108
index: Vector index / 向量索引；x/y/w/h=80/830/280/108
query: User query / 用户问题；x/y/w/h=470/350/300/110
retrieve: Retriever / 相似度检索；x/y/w/h=470/570/300/120
context: Context / 上下文构建；x/y/w/h=470/850/300/120
llm: LLM / 生成模型；x/y/w/h=880/470/300/300
answer: Answer / 回答与引用；x/y/w/h=1280/450/250/340

## 关系及路线
docs → chunks；220,458 → 220,510
chunks → embed；220,618 → 220,670
embed → index；220,778 → 220,830
query → retrieve；620,460 → 620,570
retrieve → context；620,690 → 620,850
index → retrieve；360,884 → 415,884 → 415,630 → 470,630
context → llm；770,910 → 824,910 → 824,620 → 880,620
llm → answer；1180,620 → 1280,620

## 编辑与安全约束
保留9个data-node独立g和8条polyline；节点id前缀starwars-rag-node-。每条连接保留data-sf-start-node/end-node以及归一化data-sf-start-anchor/end-anchor。文字保持text，标记使用内部defs/marker，markerUnits=userSpaceOnUse，箭头尖端refX=10。ID唯一、引用有效、连线不穿无关节点或文字，标签与画布不溢出。仅用安全SVG几何；不使用script、事件、foreignObject、外部URL、外部字体、位图或整图栅格化。字体本机回退；节点可独立移动，导出后可继续编辑。

## 参考来源
- Star Wars · Databank: https://www.starwars.com/databank/
- Star Wars · Death Star: https://www.starwars.com/databank/death-star
