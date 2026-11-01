# Raycast 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
参照Raycast实际官网黑底、主导红色斜向光场、白色重字及公开产品细节中的精确键帽/命令表面。两条不等宽红色渐变结构穿过技术综合区，左侧紧凑知识对象通过索引和问题汇入中央检索，再到上下文/键帽式模型/回答。去掉旧版大伪命令窗口和角落三条小红装饰，让斜向材质组织构图。

细部规范：52px分行白标题、14px中性深面、模型24px外缘/18px内缘构成有材料的键帽；知识材料用受控柔色标识MD/TXT/VEC/SQL角色。功能依赖使用高对比浅粉白线，避免红背景上丢失。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

官网首屏实际主导斜向红色，补采产品细节可见命令/键帽材质；不复制官方背景颗粒或斜条商标。几何渐变是原生材料近似，不是假快捷键执行或剪贴板。Inter本机优先；无真实集成、使用量或性能。
- Raycast · 官方产品视觉: https://www.raycast.com/
- 近期选取依据 · 2026年10月Changelog: https://www.raycast.com/changelog
- Raycast · 官方社区扩展生态: https://www.raycast.com/store

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=72,292,320,128
chunks: Chunking / 解析与切分 | x/y/w/h=72,460,320,128
embed: Embeddings / 向量编码 | x/y/w/h=72,628,320,128
index: Vector index / 向量索引 | x/y/w/h=72,796,320,128
query: User query / 用户问题 | x/y/w/h=640,264,816,112
retrieve: Retriever / 相似度检索 | x/y/w/h=640,464,352,160
context: Context / 上下文构建 | x/y/w/h=1104,464,352,160
llm: LLM / 生成模型 | x/y/w/h=1104,704,352,168
answer: Answer / 回答与引用 | x/y/w/h=640,920,816,104

关系与专用路线：
docs → chunks | 232,424 → 232,456
chunks → embed | 232,592 → 232,624
embed → index | 232,760 → 232,792
query → retrieve | 816,380 → 816,460
retrieve → context | 996,544 → 1100,544
context → llm | 1280,628 → 1280,700
llm → answer | 1280,876 → 1280,916
index → retrieve | 396,860 → 528,860 → 528,544 → 636,544

节点ID前缀brand-raycast-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
