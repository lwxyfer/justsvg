# Supabase 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
参照当前Supabase浅色官网的黑/深绿两级标题、细线非对称Bento和大幅数据插图。知识来源使用文档页组、文本切片和线框向量结构，汇入更大的knowledge数据模式板；索引实际展示id/text/vector/source/chunk/index字段，下方检索以语义SQL说明，上下文接模型代码和淡绿回答。以模式表取代空心通用数据库圆柱，精细数据结构必须进入图本身。

细部规范：48px常规黑/深绿标题，12px角、1px中性边、原生文档页/线框向量/360×320模式板；SQL与模式字段13–15px等宽字只用于真实代码角色。模式行、标题和说明分离；非同样九张图标卡，绿色集中于依赖和数据语义。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

实际官网为浅色Manrope和深绿，Oct28补采的Vector/Storage/Data APIs几何作为对象语言参考。伪代码及模式是RAG机制示意，不是可直接部署的官方Supabase架构。Manrope本机优先系统回退；不分发闪电、大象或字体。2026社区活动选取依据沿用。
- Supabase · 当前官网: https://supabase.com/
- 近期社区选取依据 · Select 2026: https://select.supabase.com/
- Supabase · 2026社区Hackathon: https://hackathon.supabase.com/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=72,270,280,240
chunks: Chunking / 解析与切分 | x/y/w/h=440,270,280,240
embed: Embeddings / 向量编码 | x/y/w/h=808,270,280,240
index: Vector index / 向量索引 | x/y/w/h=1160,238,360,320
query: User query / 用户问题 | x/y/w/h=72,664,280,120
retrieve: Retriever / 相似度检索 | x/y/w/h=440,628,280,220
context: Context / 上下文构建 | x/y/w/h=808,664,280,120
llm: LLM / 生成模型 | x/y/w/h=1208,628,312,220
answer: Answer / 回答与引用 | x/y/w/h=808,916,712,108

关系与专用路线：
docs → chunks | 356,390 → 436,390
chunks → embed | 724,390 → 804,390
embed → index | 1092,390 → 1156,390
query → retrieve | 356,724 → 436,724
retrieve → context | 724,724 → 804,724
context → llm | 1092,724 → 1204,724
llm → answer | 1364,852 → 1364,912
index → retrieve | 1340,562 → 1340,596 → 580,596 → 580,624

节点ID前缀brand-supabase-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
