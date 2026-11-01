# Cloudflare 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
采用当前Cloudflare官网橙色技术场、黑色常规大字、白色工作面及网络图语言。原生渐变与低透明度细点阵构成橙色技术标题带；其下，上排是四个知识处理对象，下排从问题流经检索/上下文，到带环形网络线的边缘生成核心，回答在独立底部回路。橙色集中在标题与生成焦点，功能连接使用较深橙保证对比。网络环是原生几何，不假造地理坐标、全球节点数、延迟或性能指标，不复制云商标。

细部规范：细橙色同心网络环、不同层级的处理对象和灰白表面。标题带白色大字，浅橙节点上用深橙字；依赖连接绕行，不能用装饰网络线替代真实绑定。 箭头使用markerUnits="userSpaceOnUse"，尺寸9px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

根据实际官网橙色大幅技术场、近白页面、细网络图与黑色无衬线观察；色号/环形几何为RAG图解适配，不是官方token清单或真实部署。STK Bureau Sans仅本机优先，使用系统回退。
- Cloudflare · 官方首页与Region: Earth网络视觉: https://www.cloudflare.com/

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=80,360,312,128
chunks: Chunking / 解析与切分 | x/y/w/h=456,360,312,128
embed: Embeddings / 向量编码 | x/y/w/h=832,360,312,128
index: Vector index / 向量索引 | x/y/w/h=1208,360,312,128
query: User query / 用户问题 | x/y/w/h=80,680,280,116
retrieve: Retriever / 相似度检索 | x/y/w/h=480,680,344,116
context: Context / 上下文构建 | x/y/w/h=944,680,280,116
llm: LLM / 生成模型 | x/y/w/h=1280,628,240,220
answer: Answer / 回答与引用 | x/y/w/h=480,864,344,116

关系与专用路线：
docs → chunks | 396,424 → 452,424
chunks → embed | 772,424 → 828,424
embed → index | 1148,424 → 1204,424
query → retrieve | 364,738 → 476,738
retrieve → context | 828,738 → 940,738
context → llm | 1228,738 → 1276,738
llm → answer | 1400,852 → 1400,922 → 828,922
index → retrieve | 1364,492 → 1364,560 → 652,560 → 652,676

节点ID前缀brand-cloudflare-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
