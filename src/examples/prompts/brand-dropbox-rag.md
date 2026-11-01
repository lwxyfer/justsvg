# Dropbox 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
具体参照Dropbox官方Typography页的深石墨底、巨大字阶、直角拼版与鲜明配色组合。知识源为四块不同语义的彩色版面，中列以浅色查询、粉色检索、青柠上下文组织层级，右侧大型蓝色生成版面与浅色回答形成焦点。节点留出清晰连接通道；不是给通用圆角卡片染色，不复制Dropbox标志。大标题与模块尺度差异明确，直角轮廓保持平面编辑气质。

细部规范：强调有分量的无衬线排版、零圆角色块和不同字阶。彩色底的辅助文字使用深色以确保对比；深色背景上的连接使用浅石色。 箭头使用markerUnits="userSpaceOnUse"，尺寸9px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

依据实际打开的官方字体页面与官方色板：石墨、蓝、青柠、粉色、浅纸色构成编辑式拼版。专有DB Sharp Grotesk只优先本机可用字体，Helvetica Neue/Arial回退；本图不分发字体、不使用标志，不声称逐像素或字形一致。
- Dropbox · Typography: https://brand.dropbox.com/typography
- Dropbox · Color: https://brand.dropbox.com/color

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=80,366,260,112
chunks: Chunking / 解析与切分 | x/y/w/h=80,514,260,112
embed: Embeddings / 向量编码 | x/y/w/h=80,662,260,112
index: Vector index / 向量索引 | x/y/w/h=80,810,260,112
query: User query / 用户问题 | x/y/w/h=560,366,350,116
retrieve: Retriever / 相似度检索 | x/y/w/h=560,618,350,164
context: Context / 上下文构建 | x/y/w/h=560,886,350,112
llm: LLM / 生成模型 | x/y/w/h=1050,510,440,240
answer: Answer / 回答与引用 | x/y/w/h=1050,886,440,112

关系与专用路线：
docs → chunks | 210,482 → 210,510
chunks → embed | 210,630 → 210,658
embed → index | 210,778 → 210,806
query → retrieve | 735,486 → 735,614
retrieve → context | 735,786 → 735,882
context → llm | 914,942 → 992,942 → 992,630 → 1046,630
llm → answer | 1270,754 → 1270,882
index → retrieve | 344,866 → 438,866 → 438,700 → 556,700

节点ID前缀brand-dropbox-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
