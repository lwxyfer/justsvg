# Lovable 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
视觉依据为Lovable官网公开链接的Brand Hub，参考Creme #F7F4ED、Black #1B1B1B、全谱色板、Typography及Gradient Backgrounds。以蓝紫左域、粉橙右下和向奶油白逐渐消退的层叠径向色场承托原创知识转换。知识材料分别为文档线稿、切片色条、向量点与索引表；问题和知识汇入白色检索焦点，再组合成上下文、渐变叠层模型与白色回答。不能把渐变做成生硬矩形彩虹旗，不画假的发送按钮。

细部规范：56px/600居中标题与-2px字距，参考Brand Hub的600字重紧排；14–28px柔和白面、受控渐变和深紫功能线。半径144px检索圆是原创语义焦点，不宣称来自官网界面。全谱色也进入切片/向量/综合对象，实际文字承载于清楚的白面。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

主站仍为安全验证页，未用它推断产品界面。有效依据是官网链接的Brand Hub色彩、渐变背景与Typography，非主站布局复制。Camera Plain仅本机优先，使用系统回退，不分发专有字体。所有节点造型和RAG构图为原创转译；没有真实产品会话、发送功能或生成性能。
- Lovable · 官网公开品牌入口: https://lovable.dev/brand
- Lovable · 官方Brand Hub色彩: https://lovablebrand.lovable.app/brand/colors
- Lovable · 官方Brand Hub字体与字阶: https://lovablebrand.lovable.app/brand/typography
- 近期社区选取依据 · Lovable Blog: https://lovable.dev/blog

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=88,306,280,128
chunks: Chunking / 解析与切分 | x/y/w/h=88,480,280,128
embed: Embeddings / 向量编码 | x/y/w/h=88,654,280,128
index: Vector index / 向量索引 | x/y/w/h=88,828,280,128
query: User query / 用户问题 | x/y/w/h=488,270,944,124
retrieve: Retriever / 相似度检索 | x/y/w/h=528,492,288,288
context: Context / 上下文构建 | x/y/w/h=944,482,488,176
llm: LLM / 生成模型 | x/y/w/h=944,730,488,176
answer: Answer / 回答与引用 | x/y/w/h=488,960,944,76

关系与专用路线：
docs → chunks | 228,438 → 228,476
chunks → embed | 228,612 → 228,650
embed → index | 228,786 → 228,824
query → retrieve | 672,398 → 672,488
retrieve → context | 820,636 → 876,636 → 876,570 → 940,570
context → llm | 1188,662 → 1188,726
llm → answer | 1188,910 → 1188,956
index → retrieve | 372,892 → 444,892 → 444,636 → 524,636

节点ID前缀brand-lovable-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
