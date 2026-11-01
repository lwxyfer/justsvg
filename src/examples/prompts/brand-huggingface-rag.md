# Hugging Face 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
参照当前Hugging Face首页的白色外场、深色模型工作面、开源仓库文字/任务标签，以及官方Brand页#FFD21E/#FF9D00色板。知识处理用仓库式材料行，查询汇入检索、上下文和黄色模型对象，输出独立回答。保留来源路径、语义类型和模型/数据关系，不把整图涂成黄色、不复制拥抱吉祥物、不造下载量/点赞/排名。

细部规范：54px重字主标题在深场中左对齐；深蓝灰层级、12px角、细冷灰边，仓库路径13–15px等宽，黄色集中于模型综合和小范围类型。正文浅灰有高对比；没有假筛选/收藏/参数滑杆。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

当前首页实际是白色外场中的深色模型与任务图，不沿用“黄底吉祥物”印象。图中仓库名全部example示意，无真实第三方模型/指标/状态或品牌表情。Source Sans Pro本机优先、系统回退；不引入图片、字体文件或外部内容。
- Hugging Face · 当前社区与模型视觉: https://huggingface.co/
- Hugging Face · 官方品牌色板: https://huggingface.co/brand

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=96,296,312,128
chunks: Chunking / 解析与切分 | x/y/w/h=96,476,312,128
embed: Embeddings / 向量编码 | x/y/w/h=96,656,312,128
index: Vector index / 向量索引 | x/y/w/h=96,836,312,128
query: User query / 用户问题 | x/y/w/h=520,296,928,128
retrieve: Retriever / 相似度检索 | x/y/w/h=520,548,344,176
context: Context / 上下文构建 | x/y/w/h=968,548,480,176
llm: LLM / 生成模型 | x/y/w/h=968,824,480,176
answer: Answer / 回答与引用 | x/y/w/h=520,888,344,112

关系与专用路线：
docs → chunks | 252,428 → 252,472
chunks → embed | 252,608 → 252,652
embed → index | 252,788 → 252,832
query → retrieve | 692,428 → 692,544
retrieve → context | 868,636 → 964,636
context → llm | 1208,728 → 1208,820
llm → answer | 964,944 → 868,944
index → retrieve | 412,900 → 464,900 → 464,636 → 516,636

节点ID前缀brand-huggingface-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
