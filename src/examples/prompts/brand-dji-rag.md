# DJI 大疆 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
参照大疆当前Mavic官网的主导三孔光学组件、深蓝黑场、精确金属轮廓和地平线光。以520×450原创圆角光学综合组件为模型焦点，内部一大两小三层镜腔，非单一通用刻度圆环；上方细长知识模块和左侧问题/检索/上下文提供明确结构，底部宽幅回答。几何组件表达综合聚焦，不仿制具体Mavic硬件，不加虚构参数。

细部规范：54px居中轻字与中文副题，原生径向玻璃/线性金属材质，68/58px双层壳体和104/60px镜腔。输入输出对齐实际壳体边界4px之外，不再绑定旧圆形轮廓。小模块银灰细线和明确语义副标，所有镜组与壳体均随模型组移动。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

有效官网截图展示三摄光学对象与深色产品光域。新图的壳体和镜腔为原创技术类比，没有复制无人机、相机照片或具体产品形状；不含真实焦距/飞行参数/硬件性能。字体本机无衬线；独角兽选择沿用胡润2026发布口径。
- DJI · 当前官网Mavic产品视觉: https://www.dji.com/cn
- 中国独角兽选取依据 · 胡润2026榜单（6月25日口径）: https://www.hurun.net/zh-cn/info/detail?num=E9GMNPY37G4Q

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=72,264,288,128
chunks: Chunking / 解析与切分 | x/y/w/h=436,264,288,128
embed: Embeddings / 向量编码 | x/y/w/h=800,264,288,128
index: Vector index / 向量索引 | x/y/w/h=1164,264,288,128
query: User query / 用户问题 | x/y/w/h=72,576,224,144
retrieve: Retriever / 相似度检索 | x/y/w/h=384,576,240,144
context: Context / 上下文构建 | x/y/w/h=712,576,224,144
llm: LLM / 生成模型 | x/y/w/h=984,450,520,450
answer: Answer / 回答与引用 | x/y/w/h=72,940,1432,88

关系与专用路线：
docs → chunks | 364,328 → 432,328
chunks → embed | 728,328 → 796,328
embed → index | 1092,328 → 1160,328
query → retrieve | 300,648 → 380,648
retrieve → context | 628,648 → 708,648
context → llm | 940,648 → 980,648
llm → answer | 1244,904 → 1244,936
index → retrieve | 1308,396 → 1308,424 → 504,424 → 504,572

节点ID前缀brand-dji-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
