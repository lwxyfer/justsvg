# 小红书 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
以实际可公开访问的小红书官方故事页为依据：宽幅白色圆角故事对象、独立缩略封面、粗中文内容标题与少量红色动作。左侧四个编辑式知识条目有文档双页/切片/向量/索引原生语义封面，右侧问题经检索进入上下文和红色模型，再到宽幅有据回答。去掉旧版方形卡阵列与绕整张图的长周边连线，改用两列之间紧凑检索脊线。

细部规范：64px粗中文标题，600×140故事对象与116×108封面，封面色温分别纸白/浅黄/绿灰/浅紫，语义图形与标题并置。大圆角只从实际故事页结构转译；粉色用于检索片段，强红仅模型重点。没有头像、点赞、假用户内容。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

主站访问限制仍保留，视觉来源为实际官方招聘/故事页而非登录后信息流；新封面全部原创原生几何，不复制照片/UGC/字标。字阶和内容关系是主要参考，不把红白配色等同于全品牌规范。胡润2026选择口径不变。
- 小红书 · 官方招聘与品牌故事: https://job.xiaohongshu.com/
- 中国独角兽选取依据 · 胡润2026榜单（6月25日口径）: https://www.hurun.net/zh-cn/info/detail?num=E9GMNPY37G4Q

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=72,270,600,140
chunks: Chunking / 解析与切分 | x/y/w/h=72,454,600,140
embed: Embeddings / 向量编码 | x/y/w/h=72,638,600,140
index: Vector index / 向量索引 | x/y/w/h=72,822,600,140
query: User query / 用户问题 | x/y/w/h=824,270,696,104
retrieve: Retriever / 相似度检索 | x/y/w/h=824,478,696,144
context: Context / 上下文构建 | x/y/w/h=824,714,320,144
llm: LLM / 生成模型 | x/y/w/h=1240,714,280,144
answer: Answer / 回答与引用 | x/y/w/h=824,942,696,96

关系与专用路线：
docs → chunks | 372,414 → 372,450
chunks → embed | 372,598 → 372,634
embed → index | 372,782 → 372,818
query → retrieve | 1172,378 → 1172,474
retrieve → context | 984,626 → 984,710
context → llm | 1148,786 → 1236,786
llm → answer | 1380,862 → 1380,938
index → retrieve | 676,892 → 748,892 → 748,550 → 820,550

节点ID前缀brand-xiaohongshu-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
