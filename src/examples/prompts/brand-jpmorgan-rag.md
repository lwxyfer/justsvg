# J.P. Morgan · 摩根大通 · RAG 架构风格

请输出完整、可编辑原生SVG。1600×1100，viewBox="0 0 1600 1100"。这是非官方视觉研究与演示架构，不是该品牌/作品真实系统；不虚构实验结果或投资结论。

## 视觉方向
J.P. Morgan机构简报方向：暖白纸、深棕衬线、低饱和铜棕线条、细分隔线，三列连续运营模型；知识基础、检索上下文、综合交付为整列分区。生成节点是深棕色大幅研究稿，证据摘要在下方。与Morgan Stanley白色无衬线/青色研究框架明确区分。

配色：#faf7f2、#3b3029、#e9ded0、#875f38。节点有不同尺寸、轮廓和信息角色，不能只替换通用卡片的颜色。以J.P. Morgan机构站的暖中性色、衬线研究叙事为原创转译方向，不采用Chase零售蓝。官方站本轮返回403/区域重定向且浏览截图空白，不能作为已核验的逐项品牌规范；本图为非官方风格近似，未使用官方标志或专有字体。

## 内容与几何
docs: Documents / 文档与知识库；x/y/w/h=96/425/336/104
chunks: Chunking / 解析与切分；x/y/w/h=96/575/336/104
embed: Embeddings / 向量编码；x/y/w/h=96/725/336/104
index: Vector index / 向量索引；x/y/w/h=96/875/336/104
query: User query / 用户问题；x/y/w/h=555/425/360/104
retrieve: Retriever / 相似度检索；x/y/w/h=555/665/360/125
context: Context / 上下文构建；x/y/w/h=555/875/360/104
llm: LLM / 生成模型；x/y/w/h=1040/520/464/200
answer: Answer / 回答与引用；x/y/w/h=1040/875/464/104

## 关系及路线
docs → chunks；264,529 → 264,575
chunks → embed；264,679 → 264,725
embed → index；264,829 → 264,875
query → retrieve；735,529 → 735,665
retrieve → context；735,790 → 735,875
index → retrieve；432,927 → 483,927 → 483,727.5 → 555,727.5
context → llm；915,927 → 970,927 → 970,620 → 1040,620
llm → answer；1272,720 → 1272,875

## 编辑与安全约束
保留9个data-node独立g和8条polyline；节点id前缀brand-jpmorgan-rag-node-。每条连接保留data-sf-start-node/end-node以及归一化data-sf-start-anchor/end-anchor。文字保持text，标记使用内部defs/marker，markerUnits=userSpaceOnUse，箭头尖端refX=10。ID唯一、引用有效、连线不穿无关节点或文字，标签与画布不溢出。仅用安全SVG几何；不使用script、事件、foreignObject、外部URL、外部字体、位图或整图栅格化。字体本机回退；节点可独立移动，导出后可继续编辑。

## 参考来源
- J.P. Morgan · Institutional site: https://www.jpmorgan.com/
- J.P. Morgan · About: https://www.jpmorgan.com/about-us
