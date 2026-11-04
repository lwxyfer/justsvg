# Morgan Stanley · 摩根士丹利 · RAG 架构风格

请输出完整、可编辑原生SVG。1600×1100，viewBox="0 0 1600 1100"。这是非官方视觉研究与演示架构，不是该品牌/作品真实系统；不虚构实验结果或投资结论。

## 视觉方向
Morgan Stanley企业研究方向：白色编辑页、黑色无衬线机构字、宽松大题、炭黑纵向知识栏、淡青色研究重点、细灰分隔。左窄右宽且不等尺度，生成是横向研究面，回答开放为证据摘要；禁止使用高盛式蓝色刊头与衬线主标题。

配色：#ffffff、#252b30、#d2edf5、#236c90。节点有不同尺寸、轮廓和信息角色，不能只替换通用卡片的颜色。参照Morgan Stanley官方企业/研究页面的信息层级和黑白编辑框架，结合公开页面预览的浅青研究方向。官网正文可读取，本轮实时浏览器因网络协议超时未获得有效截图；本机Helvetica回退为近似，不声称精确品牌字体或完整官方规范。非官方示例。

## 内容与几何
docs: Documents / 文档与知识库；x/y/w/h=96/410/336/110
chunks: Chunking / 解析与切分；x/y/w/h=96/565/336/110
embed: Embeddings / 向量编码；x/y/w/h=96/720/336/110
index: Vector index / 向量索引；x/y/w/h=96/875/336/110
query: User query / 用户问题；x/y/w/h=560/410/320/104
retrieve: Retriever / 相似度检索；x/y/w/h=560/600/320/140
context: Context / 上下文构建；x/y/w/h=560/850/320/130
llm: LLM / 生成模型；x/y/w/h=1020/600/480/160
answer: Answer / 回答与引用；x/y/w/h=1020/850/480/130

## 关系及路线
docs → chunks；264,520 → 264,565
chunks → embed；264,675 → 264,720
embed → index；264,830 → 264,875
query → retrieve；720,514 → 720,600
retrieve → context；720,740 → 720,850
index → retrieve；432,930 → 495,930 → 495,670 → 560,670
context → llm；880,915 → 950,915 → 950,680 → 1020,680
llm → answer；1260,760 → 1260,850

## 编辑与安全约束
保留9个data-node独立g和8条polyline；节点id前缀brand-morgan-stanley-rag-node-。每条连接保留data-sf-start-node/end-node以及归一化data-sf-start-anchor/end-anchor。文字保持text，标记使用内部defs/marker，markerUnits=userSpaceOnUse，箭头尖端refX=10。ID唯一、引用有效、连线不穿无关节点或文字，标签与画布不溢出。仅用安全SVG几何；不使用script、事件、foreignObject、外部URL、外部字体、位图或整图栅格化。字体本机回退；节点可独立移动，导出后可继续编辑。

## 参考来源
- Morgan Stanley · Home: https://www.morganstanley.com/
- Morgan Stanley · Insights: https://www.morganstanley.com/insights
