# 字节跳动 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
参照字节跳动当前中文官网：蔚蓝大场、白色巨大单侧下转角使命版面和中文宋体。将白色转角延伸为占左侧650px的知识域，域内四种知识对象开放排列，右侧蓝域承接问题/检索/青色上下文和多层综合，再输出回答。用实际文档/切片/向量/模式结构替代九张蓝白卡，形成清楚的知识域到推理域非对称关系。

细部规范：58px宋体中文两行标题、188px单角曲线、白与浅青的不同语义层次，节点标题28px无衬线。知识域内路径开放，依赖深蓝；底部白色来源带保证说明可读。所有知识图形背景归属节点自身，拖动不会留下装饰。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

实际中文官网的蓝场/白色大转角/宋体为结构依据，不复制办公楼照片、四根柱状标志或抖音品牌。字体本机Songti SC/SimSun回退；原生对象为原创技术转译。独角兽口径沿用胡润2026公开快照，不宣称实时状态。
- 字节跳动 · 官方中文视觉: https://www.bytedance.com/
- 中国独角兽选取依据 · 胡润2026榜单（6月25日口径）: https://www.hurun.net/zh-cn/info/detail?num=E9GMNPY37G4Q

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=72,288,432,128
chunks: Chunking / 解析与切分 | x/y/w/h=72,464,432,128
embed: Embeddings / 向量编码 | x/y/w/h=72,640,432,128
index: Vector index / 向量索引 | x/y/w/h=72,816,432,128
query: User query / 用户问题 | x/y/w/h=744,254,728,120
retrieve: Retriever / 相似度检索 | x/y/w/h=744,480,320,160
context: Context / 上下文构建 | x/y/w/h=1160,480,312,160
llm: LLM / 生成模型 | x/y/w/h=1160,736,312,184
answer: Answer / 回答与引用 | x/y/w/h=744,920,320,104

关系与专用路线：
docs → chunks | 288,420 → 288,460
chunks → embed | 288,596 → 288,636
embed → index | 288,772 → 288,812
query → retrieve | 904,378 → 904,476
retrieve → context | 1068,560 → 1156,560
context → llm | 1316,644 → 1316,732
llm → answer | 1156,848 → 1108,848 → 1108,972 → 1068,972
index → retrieve | 508,880 → 690,880 → 690,560 → 740,560

节点ID前缀brand-bytedance-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
