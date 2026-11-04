# Goldman Sachs · 高盛 · RAG 架构风格

请输出完整、可编辑原生SVG。1600×1100，viewBox="0 0 1600 1100"。这是非官方视觉研究与演示架构，不是该品牌/作品真实系统；不虚构实验结果或投资结论。

## 视觉方向
锚定Goldman Sachs Insights页面：窄蓝色刊头、白色大留白、巨大常规字重衬线主标题、细规则线与分析型信息组织。上排开放式知识形成，下排研究与综合；索引是一整块浅蓝知识基础，问题是海军蓝实体，其他环节开放排版，以不同尺度/边界表达层级，不做交易仪表盘。

配色：#7599be、#ffffff、#142e47、#d4e2ef。节点有不同尺寸、轮廓和信息角色，不能只替换通用卡片的颜色。依据Goldman Sachs官方Insights的蓝色刊头、白色编辑页面、衬线大题与细规则线进行原创架构转译。2026-11-03实际查看官方页面；Georgia为本地衬线近似，不分发品牌字体。非官方示例。

## 内容与几何
docs: Documents / 文档与知识库；x/y/w/h=72/430/230/144
chunks: Chunking / 解析与切分；x/y/w/h=380/430/230/144
embed: Embeddings / 向量编码；x/y/w/h=688/430/230/144
index: Vector index / 向量索引；x/y/w/h=1040/430/488/144
query: User query / 用户问题；x/y/w/h=72/770/230/170
retrieve: Retriever / 相似度检索；x/y/w/h=380/770/230/170
context: Context / 上下文构建；x/y/w/h=688/770/230/170
llm: LLM / 生成模型；x/y/w/h=1040/770/220/170
answer: Answer / 回答与引用；x/y/w/h=1336/770/192/170

## 关系及路线
docs → chunks；302,502 → 380,502
chunks → embed；610,502 → 688,502
embed → index；918,502 → 1040,502
query → retrieve；302,855 → 380,855
retrieve → context；610,855 → 688,855
context → llm；918,855 → 1040,855
llm → answer；1260,855 → 1336,855
index → retrieve；1284,574 → 1284,654 → 495,654 → 495,770

## 编辑与安全约束
保留9个data-node独立g和8条polyline；节点id前缀brand-goldman-sachs-rag-node-。每条连接保留data-sf-start-node/end-node以及归一化data-sf-start-anchor/end-anchor。文字保持text，标记使用内部defs/marker，markerUnits=userSpaceOnUse，箭头尖端refX=10。ID唯一、引用有效、连线不穿无关节点或文字，标签与画布不溢出。仅用安全SVG几何；不使用script、事件、foreignObject、外部URL、外部字体、位图或整图栅格化。字体本机回退；节点可独立移动，导出后可继续编辑。

## 参考来源
- Goldman Sachs · Insights: https://www.goldmansachs.com/insights
- Goldman Sachs · Home: https://www.goldmansachs.com/
