# OpenAI 品牌视觉研究 · RAG 架构

非官方示例，非品牌自己的生产架构。不要把9个节点画成相同大小的通用卡片。

## 具体视觉方向
以用户指定的https://developers.openai.com/blog为唯一当前视觉锚点，具体采用首篇Designing failover across OpenAI model providers封面的暖色方向。白色编辑式页面、居中克制的标题与灰色副标题，下方是一整幅珊瑚橙/粉红/奶油色渐变封面。技术对象使用半透明白色圆角平面、细白轮廓、精确细线图标，左上和右下添加淡白同心弧线；奶油亮区收在左下第三部分，中部不均匀橙红、右下珊瑚红、右上暖粉；用不等尺度径向色域与多尺度半透明云团、原生pattern细点近似参考封面的颗粒，不能嵌入封面位图。RAG内容保持9节点8关系：左列四个知识阶段，中间查询/检索/上下文，右侧层叠模型和回答；标题正文用深酒红保证信息可读，功能连线也加深，而背景轮廓作为非信息装饰保持很淡。不要复用上一版的巨型圆、直角色块或ChatGPT界面。图案、渐变、clipPath内部引用必须有效；节点、文字和关联保持原生可编辑。

细部规范：白底居中标题、完整暖色封面、细白透明平面和低透明度同心弧；细线文件/切片/向量/索引/层叠模型图标。功能文字和关联使用深酒红，装饰白线不承载唯一信息；细颗粒通过确定性的原生pattern实现。 箭头使用markerUnits="userSpaceOnUse"，尺寸8px，refX="10"确保尖端与绑定端点重合，不能随描边粗细失控放大。

直接观察用户指定博客的页面与首篇封面：暖橙珊瑚粉氛围、透明圆角技术图形、白色细线和同心弧线，而非笼统套用OpenAI企业色板。原封面的细腻纹理以原生SVG渐变和细点pattern近似；为架构图的可读性，将文字与实际依赖线加深。OpenAI Sans只在本机可用时使用，不分发专有字体，缺失时回退Helvetica Neue/Arial；不声称逐像素复刻。
- OpenAI Developers · Blog（用户指定）: https://developers.openai.com/blog
- Developer Blog · 暖色封面参考: https://developers.openai.com/images/blog/designing-failover-across-openai-model-providers/cover.webp

## 内容与独立构图
画布1600×1100，viewBox="0 0 1600 1100"。同图比较保持9个语义节点和8条依赖，允许版式、对象尺寸和形状随品牌改变。
docs: Documents / 文档与知识库 | x/y/w/h=128,340,320,104
chunks: Chunking / 解析与切分 | x/y/w/h=128,495,320,104
embed: Embeddings / 向量编码 | x/y/w/h=128,650,320,104
index: Vector index / 向量索引 | x/y/w/h=128,805,320,104
query: User query / 用户问题 | x/y/w/h=600,340,300,108
retrieve: Retriever / 相似度检索 | x/y/w/h=600,555,300,156
context: Context / 上下文构建 | x/y/w/h=600,850,300,114
llm: LLM / 生成模型 | x/y/w/h=1120,498,320,210
answer: Answer / 回答与引用 | x/y/w/h=1120,850,320,114

关系与专用路线：
docs → chunks | 288,448 → 288,491
chunks → embed | 288,603 → 288,646
embed → index | 288,758 → 288,801
query → retrieve | 750,452 → 750,551
retrieve → context | 750,715 → 750,846
context → llm | 904,907 → 1008,907 → 1008,603 → 1116,603
llm → answer | 1280,712 → 1280,846
index → retrieve | 452,857 → 522,857 → 522,633 → 596,633

节点ID前缀brand-openai-rag-node-；原生g/text/rect/circle/path/polyline/linearGradient/radialGradient/pattern/clipPath/defs/marker。图形结构必须体现上述参考的构图、焦点、材质、信息层级与图标语言，不能只改变色板或圆角。文字保持text，专有字体不分发，使用本机字体回退。不使用位图、脚本、foreignObject、事件、外部资源或需清理的滤镜；渐变内部引用需有效。所有节点保留data-node、语义ID与data-layout，连接保留data-sf-start/end-node和归一化anchor，标签data-sf-label-for随线移动。辅助文字与背景对比至少4.5:1，大字号至少3:1，承载依赖的箭头至少3:1；禁止穿字和无关节点；只输出完整SVG XML。
