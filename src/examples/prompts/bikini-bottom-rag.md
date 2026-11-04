# 比奇堡 · 海底知识工厂 · RAG 架构风格

请输出完整、可编辑原生SVG。1600×1100，viewBox="0 0 1600 1100"。这是非官方视觉研究与演示架构，不是该品牌/作品真实系统；不虚构实验结果或投资结论。

## 视觉方向
青绿海水、五瓣海底花、暖沙地，菠萝形文档档案，带孔洞的黄海绵切分模块，粉色波浪编码体、深青色索引水箱，圆形舷窗检索、航海便笺与黄色红顶生成工坊。深墨色3–4px轮廓，Chalkboard/Comic Sans本机回退；标题活泼，结构和语义仍清晰。不是贴角色截图或九张彩色卡片。

配色：#9ee6df、#ffe265、#f4b4c5、#f4de9b。节点有不同尺寸、轮廓和信息角色，不能只替换通用卡片的颜色。参考Nickelodeon官方海绵宝宝视觉及比奇堡环境；使用海底花、菠萝、海绵和舷窗等原创几何节点，不嵌入角色图片。非官方趣味风格研究。

## 内容与几何
docs: Documents / 文档与知识库；x/y/w/h=70/400/250/200
chunks: Chunking / 解析与切分；x/y/w/h=390/400/210/150
embed: Embeddings / 向量编码；x/y/w/h=690/400/230/150
index: Vector index / 向量索引；x/y/w/h=1060/360/380/220
query: User query / 用户问题；x/y/w/h=72/792/217/146
retrieve: Retriever / 相似度检索；x/y/w/h=390/740/230/230
context: Context / 上下文构建；x/y/w/h=720/790/200/150
llm: LLM / 生成模型；x/y/w/h=1030/720/220/220
answer: Answer / 回答与引用；x/y/w/h=1330/790/210/160

## 关系及路线
docs → chunks；320,475 → 390,475
chunks → embed；600,475 → 690,475
embed → index；920,475 → 990,475 → 990,470 → 1060,470
index → retrieve；1250,580 → 1250,648 → 505,648 → 505,740
query → retrieve；290,865 → 340,865 → 340,855 → 390,855
retrieve → context；620,855 → 670,855 → 670,865 → 720,865
context → llm；920,865 → 975,865 → 975,830 → 1030,830
llm → answer；1250,830 → 1290,830 → 1290,870 → 1330,870

## 编辑与安全约束
保留9个data-node独立g和8条polyline；节点id前缀bikini-bottom-rag-node-。每条连接保留data-sf-start-node/end-node以及归一化data-sf-start-anchor/end-anchor。文字保持text，标记使用内部defs/marker，markerUnits=userSpaceOnUse，箭头尖端refX=10。ID唯一、引用有效、连线不穿无关节点或文字，标签与画布不溢出。仅用安全SVG几何；不使用script、事件、foreignObject、外部URL、外部字体、位图或整图栅格化。字体本机回退；节点可独立移动，导出后可继续编辑。

## 参考来源
- Nickelodeon · SpongeBob: https://www.nick.com/fan-hub/spongebob-squarepants
- Paramount · SpongeBob About: https://www.paramountpressexpress.com/nickelodeon/shows/spongebob-squarepants/about/
