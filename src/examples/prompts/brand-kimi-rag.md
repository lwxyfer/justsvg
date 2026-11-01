# Kimi（月之暗面） 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
提取当前Kimi官网黑白/暖白材料、主导圆润问题面、附属浅色搁板和微小蓝点，重新组织为技术图；去掉伪应用窗口/导航栏/历史会话。左侧开放文档处理列，中上952×176问题面，下方紧凑检索/上下文/黑色综合对象，底部为真正有正文与出处结构的开放回答，而不是空卡加假引用按钮。

细部规范：59px中文黑标题，28px问题面和浅色附层，18–22px推理对象，蓝色只有三个信息点。回答以34px标题、25px结论和20px说明建立文档层次；文件名使用13px等宽字。所有文件/回答背景随组移动，结构边界与绑定一致。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

参考当前实际Kimi任务界面的黑白与暖白附层，不沿用早期荧绿宇宙印象，不分发K标志。文档名、引用正文均为原创RAG机制说明，不是真实会话、检索结果或性能。月之暗面独角兽资格沿用胡润2026快照，字体本机回退。
- Kimi · 当前官网任务界面: https://www.kimi.com/
- 中国独角兽选取依据 · 胡润2026榜单（6月25日口径）: https://www.hurun.net/zh-cn/info/detail?num=E9GMNPY37G4Q

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=104,280,292,120
chunks: Chunking / 解析与切分 | x/y/w/h=104,464,292,120
embed: Embeddings / 向量编码 | x/y/w/h=104,648,292,120
index: Vector index / 向量索引 | x/y/w/h=104,832,292,120
query: User query / 用户问题 | x/y/w/h=496,248,952,176
retrieve: Retriever / 相似度检索 | x/y/w/h=496,544,280,156
context: Context / 上下文构建 | x/y/w/h=872,544,336,156
llm: LLM / 生成模型 | x/y/w/h=1304,544,168,156
answer: Answer / 回答与引用 | x/y/w/h=496,816,976,216

关系与专用路线：
docs → chunks | 248,404 → 248,460
chunks → embed | 248,588 → 248,644
embed → index | 248,772 → 248,828
query → retrieve | 636,428 → 636,540
retrieve → context | 780,622 → 868,622
context → llm | 1212,622 → 1300,622
llm → answer | 1388,704 → 1388,812
index → retrieve | 400,892 → 448,892 → 448,748 → 636,748 → 636,704

节点ID前缀brand-kimi-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
