# 阶跃星辰 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
参照阶跃星辰当前官网的不等幅学术纸页拼版、衬线标题与青蓝知识点，技术图主材料采用空白边缘相互重叠的原生研究纸页：原始文档、切片带、较大向量网络与索引表。版面尺寸/起点错落，相邻纸页边缘重叠而标题/图形/端口露出，摄入关系从上/下侧绕行；所有纸面归属可移动语义节点，下游上下文继续双层纸页。下方延续论文摘录/研究问题/上下文/综合推理/有据回答语言，不能上方纸片下方回到空通用卡。

细部规范：61px两行Georgia近似Lora的衬线主标题，第二行青蓝；纸页形成紧密重叠拼版、奶油/淡黄/灰绿/暖灰材料，内容用细线文档/切片/网络/模式解释语义。检索放入摘录层次，下游使用明确的推理文字；青蓝只标知识点，不画选择框/假手稿。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

有效官网截图为历史材料/学术图拼版，本图不复制手稿、人物、蝴蝶照片或编辑器控制点。用可以精确描述的研究几何适配为可编辑Diagram，字体Lora本机优先、Georgia/宋体回退。独角兽选取沿用胡润2026发布口径；图不是官方模型架构。
- 阶跃星辰 · 当前官网学术拼版: https://www.stepfun.com/
- 中国独角兽选取依据 · 胡润2026榜单（6月25日口径）: https://www.hurun.net/zh-cn/info/detail?num=E9GMNPY37G4Q

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=104,292,352,312
chunks: Chunking / 解析与切分 | x/y/w/h=416,244,320,280
embed: Embeddings / 向量编码 | x/y/w/h=700,300,408,320
index: Vector index / 向量索引 | x/y/w/h=1068,252,424,304
query: User query / 用户问题 | x/y/w/h=72,800,248,136
retrieve: Retriever / 相似度检索 | x/y/w/h=416,736,304,224
context: Context / 上下文构建 | x/y/w/h=824,800,272,136
llm: LLM / 生成模型 | x/y/w/h=1200,748,304,188
answer: Answer / 回答与引用 | x/y/w/h=824,976,680,72

关系与专用路线：
docs → chunks | 260,288 → 260,216 → 560,216 → 560,240
chunks → embed | 560,528 → 560,660 → 900,660 → 900,624
embed → index | 900,296 → 900,224 → 1280,224 → 1280,248
query → retrieve | 324,868 → 412,868
retrieve → context | 724,868 → 820,868
context → llm | 1100,868 → 1196,868
llm → answer | 1352,940 → 1352,972
index → retrieve | 1340,560 → 1340,700 → 568,700 → 568,732

节点ID前缀brand-stepfun-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
