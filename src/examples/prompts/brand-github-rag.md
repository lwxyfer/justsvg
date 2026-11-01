# GitHub 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
具体采用GitHub Actions产品页的工作流依赖图和GitHub深色仓库材料。标题下方是一整幅工作流：左列知识构建任务有绿色空心提交轨道；上方查询/检索/上下文形成横向job链，右下大型模型job包含等宽伪代码，回答为绿色产物行。用灰色线、6px节点轮廓、文件路径和语法色体现代码工具的精度。节点标题/说明不换为真实CI任务，不绘制成功状态、不虚构运行时间。不是GitHub首页吉祥物海报，也不复用Linear或Vercel版式。

细部规范：提交轨道有明确起止，路径用等宽字，语义标题保持无衬线。工作流与代码区不同尺度，微弱边界退后、绿色集中在轨道和回答。代码为示意流程而非可运行SDK示例。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

官方Actions页面的工作流示例提供job依赖图依据，官网实际打开确认深色表面与无衬线层级。图中是RAG流程的原创适配，不是实际仓库或运行状态；Mona Sans仅优先本机字体，不分发字体和Octocat标志。
- GitHub · Actions 产品与工作流视觉: https://github.com/features/actions
- GitHub · 官方网站: https://github.com/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=112,390,300,96
chunks: Chunking / 解析与切分 | x/y/w/h=112,532,300,96
embed: Embeddings / 向量编码 | x/y/w/h=112,674,300,96
index: Vector index / 向量索引 | x/y/w/h=112,816,300,96
query: User query / 用户问题 | x/y/w/h=516,390,260,96
retrieve: Retriever / 相似度检索 | x/y/w/h=852,390,260,96
context: Context / 上下文构建 | x/y/w/h=1188,390,260,96
llm: LLM / 生成模型 | x/y/w/h=852,650,596,152
answer: Answer / 回答与引用 | x/y/w/h=852,866,596,96

关系与专用路线：
docs → chunks | 262,490 → 262,528
chunks → embed | 262,632 → 262,670
embed → index | 262,774 → 262,812
query → retrieve | 780,438 → 848,438
retrieve → context | 1116,438 → 1184,438
context → llm | 1318,490 → 1318,646
llm → answer | 1150,806 → 1150,862
index → retrieve | 416,864 → 468,864 → 468,570 → 982,570 → 982,490

节点ID前缀brand-github-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
